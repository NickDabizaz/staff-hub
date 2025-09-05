"use server";

import { revalidatePath } from "next/cache";
import { CreateProjectSchema } from "./schemas/projectsSchemas";
import { createProjectService, updateProjectService } from "./services/projectService";
import { ProjectWithTeams } from "./types/projectTypes";

/**
 * Fungsi utilitas untuk mengkonversi nilai ke tipe number
 * 
 * @param v - Nilai yang akan dikonversi
 * @returns Nilai dalam bentuk number, NaN jika gagal
 */
function num(v: FormDataEntryValue | null): number {
  return Number(v ?? NaN);
}

/**
 * Action untuk membuat proyek baru
 * Memvalidasi data input dan membuat proyek baru melalui service
 * 
 * @param formData - Data form yang berisi informasi proyek baru
 * @returns Hasil operasi pembuatan proyek
 */
export async function createProjectAction(formData: FormData): Promise<ProjectWithTeams> {
  const rawTeams = String(formData.get("team_ids") || "[]");
  let team_ids: number[] = [];
  try {
    const parsed = JSON.parse(rawTeams);
    if (Array.isArray(parsed)) {
      team_ids = parsed.map((x) => Number(x)).filter(Boolean);
    }
  } catch (e) {
    throw new Error("Format tim tidak valid");
  }

  const payload = {
    project_name: String(formData.get("project_name") || "").trim(),
    project_description: String(formData.get("project_description") || "").trim(),
    project_deadline: String(formData.get("project_deadline") || "").trim(),
    team_ids,
  };

  const parsed = CreateProjectSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await createProjectService(parsed.data);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/projects");
  return res.data;
}

/**
 * Action untuk memperbarui proyek yang sudah ada
 * Memvalidasi data input dan memperbarui proyek melalui service
 * 
 * @param formData - Data form yang berisi informasi proyek yang diperbarui
 * @returns Hasil operasi pembaruan proyek
 */
export async function updateProjectAction(formData: FormData): Promise<ProjectWithTeams> {
  const projectId = num(formData.get("project_id"));
  if (isNaN(projectId)) throw new Error("ID project tidak valid");

  const rawTeams = String(formData.get("team_ids") || "[]");
  let team_ids: number[] = [];
  try {
    const parsed = JSON.parse(rawTeams);
    if (Array.isArray(parsed)) {
      team_ids = parsed.map((x) => Number(x)).filter(Boolean);
    }
  } catch (e) {
    throw new Error("Format tim tidak valid");
  }

  const payload = {
    project_id: projectId,
    project_name: String(formData.get("project_name") || "").trim(),
    project_description: String(formData.get("project_description") || "").trim(),
    project_deadline: String(formData.get("project_deadline") || "").trim(),
    team_ids,
  };

  // Untuk saat ini, kita menggunakan schema yang sama dengan pembuatan karena field-nya mirip
  // Anda mungkin ingin membuat UpdateProjectSchema terpisah nanti
  const parsed = CreateProjectSchema.safeParse({
    project_name: payload.project_name,
    project_description: payload.project_description,
    project_deadline: payload.project_deadline,
    team_ids: payload.team_ids,
  });
  
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await updateProjectService(payload);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/projects");
  return res.data;
}
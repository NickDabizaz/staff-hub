"use server";

import { cookies } from "next/headers";
import { err, ok, Result } from "@/lib/result";
import { SessionUser } from "@/app/admin/users/types/userTypes";
import { listProjectsRepo, getProjectRepo, createProjectRepo, updateProjectRepo, deleteProjectRepo } from "../data/projectsRepo";
import { ProjectWithTeams } from "../types/projectTypes";

// Helper functions for authentication and authorization
/**
 * Mengambil data pengguna yang sedang login
 * 
 * @returns Data pengguna yang sedang login atau null jika tidak ada
 */
async function currentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

/**
 * Memastikan bahwa pengguna memiliki hak akses admin
 * 
 * @param user - Data pengguna yang akan diverifikasi
 * @returns Hasil verifikasi, error jika bukan admin
 */
function ensureAdmin(user: SessionUser | null): Result<null> {
  if (!user || user.role !== "ADMIN") return err("FORBIDDEN");
  return ok(null);
}

// Service functions for project management
// All services include authentication checks

/**
 * Service untuk mengambil daftar semua proyek
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @returns Daftar proyek atau error jika tidak memiliki akses
 */
export async function listProjectsService(): Promise<Result<ProjectWithTeams[]>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await listProjectsRepo();
}

/**
 * Service untuk mengambil detail proyek berdasarkan ID
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @param project_id - ID proyek yang akan diambil
 * @returns Data proyek atau error jika tidak memiliki akses
 */
export async function getProjectService(project_id: number): Promise<Result<ProjectWithTeams | null>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await getProjectRepo(project_id);
}

/**
 * Service untuk membuat proyek baru
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @param input - Data proyek baru yang akan dibuat
 * @returns Hasil operasi pembuatan proyek
 */
export async function createProjectService(input: {
  project_name: string;
  project_description: string;
  project_deadline: string;
  team_ids: number[];
}): Promise<Result<ProjectWithTeams>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  const parsedDeadline = new Date(input.project_deadline);
  if (isNaN(parsedDeadline.getTime())) return err("Tanggal deadline tidak valid");

  const res = await createProjectRepo({
    project_name: input.project_name.trim(),
    project_description: input.project_description.trim(),
    project_deadline: parsedDeadline.toISOString().split("T")[0],
    team_ids: Array.from(new Set(input.team_ids.filter(Boolean))),
  });

  return res;
}

/**
 * Service untuk memperbarui proyek yang sudah ada
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @param input - Data proyek yang akan diperbarui
 * @returns Hasil operasi pembaruan proyek
 */
export async function updateProjectService(input: {
  project_id: number;
  project_name: string;
  project_description: string;
  project_deadline: string;
  team_ids: number[];
}): Promise<Result<ProjectWithTeams>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  if (!input.project_id || input.project_id <= 0) return err("ID proyek tidak valid");

  const parsedDeadline = new Date(input.project_deadline);
  if (isNaN(parsedDeadline.getTime())) return err("Tanggal deadline tidak valid");

  const res = await updateProjectRepo({
    project_id: input.project_id,
    project_name: input.project_name.trim(),
    project_description: input.project_description.trim(),
    project_deadline: parsedDeadline.toISOString().split("T")[0],
    team_ids: Array.from(new Set(input.team_ids.filter(Boolean))),
  });

  return res;
}

/**
 * Service untuk menghapus proyek berdasarkan ID
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @param project_id - ID proyek yang akan dihapus
 * @returns Hasil operasi penghapusan proyek
 */
export async function deleteProjectService(project_id: number): Promise<Result<null>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  if (!project_id || project_id <= 0) return err("ID proyek tidak valid");

  return await deleteProjectRepo(project_id);
}
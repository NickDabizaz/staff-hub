"use server";

import { revalidatePath } from "next/cache";
import { CreateProjectSchema } from "./schemas/projectsSchemas";
import { createProjectService, updateProjectService } from "./services/projectService";
import { ProjectWithTeams } from "./types/projectTypes";

function num(v: FormDataEntryValue | null): number {
  return Number(v ?? NaN);
}

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

  // For now, we'll use the same schema as create since the fields are similar
  // You might want to create a separate UpdateProjectSchema later
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
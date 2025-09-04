"use server";

import { cookies } from "next/headers";
import { err, ok, Result } from "@/lib/result";
import { SessionUser } from "@/app/admin/users/types/userTypes";
import { listProjectsRepo, getProjectRepo, createProjectRepo, updateProjectRepo } from "../data/projectsRepo";
import { ProjectWithTeams } from "../types/projectTypes";

// Helpers (mirrored from userService)
async function currentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

function ensureAdmin(user: SessionUser | null): Result<null> {
  if (!user || user.role !== "ADMIN") return err("FORBIDDEN");
  return ok(null);
}

// Services
export async function listProjectsService(): Promise<Result<ProjectWithTeams[]>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await listProjectsRepo();
}

export async function getProjectService(projectId: number): Promise<Result<ProjectWithTeams>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await getProjectRepo(projectId);
}

export async function createProjectService(input: {
  project_name: string;
  project_description?: string;
  project_deadline: string;
  team_ids: number[];
}): Promise<Result<ProjectWithTeams>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await createProjectRepo(input);
}

export async function updateProjectService(input: {
  project_id: number;
  project_name: string;
  project_description?: string;
  project_deadline: string;
  team_ids: number[];
}): Promise<Result<ProjectWithTeams>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await updateProjectRepo(input);
}
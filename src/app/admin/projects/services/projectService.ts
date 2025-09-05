"use server";

import { cookies } from "next/headers";
import { err, ok, Result } from "@/lib/result";
import { SessionUser } from "@/app/admin/users/types/userTypes";
import { listProjectsRepo, getProjectRepo, createProjectRepo, updateProjectRepo } from "../data/projectsRepo";
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

// Services for project management
// All services include authentication checks

/**
 * Service untuk mengambil daftar semua proyek dengan timnya
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @returns Daftar proyek dengan timnya atau error jika tidak memiliki akses
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
 * @param projectId - ID proyek yang akan diambil
 * @returns Data proyek atau error jika tidak memiliki akses
 */
export async function getProjectService(projectId: number): Promise<Result<ProjectWithTeams>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await getProjectRepo(projectId);
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
  project_description?: string;
  project_deadline: string;
  team_ids: number[];
}): Promise<Result<ProjectWithTeams>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await createProjectRepo(input);
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
  project_description?: string;
  project_deadline: string;
  team_ids: number[];
}): Promise<Result<ProjectWithTeams>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await updateProjectRepo(input);
}
"use server";

import { revalidatePath } from "next/cache";
import {
  createTeamWithMembersRepo,
  addTeamMemberRepo,
  removeTeamMemberRepo,
} from "./data/teamsRepo";

function num(v: FormDataEntryValue | null): number {
  return Number(v ?? NaN);
}

export async function createTeamAction(formData: FormData) {
  const team_name = String(formData.get("team_name") || "").trim();
  const pm_user_id = num(formData.get("pm_user_id"));
  const rawMembers = String(formData.get("member_user_ids") || "[]");

  let member_user_ids: number[] = [];
  try {
    const parsed = JSON.parse(rawMembers);
    if (Array.isArray(parsed)) member_user_ids = parsed.map((x) => Number(x)).filter(Boolean);
  } catch (e) {
    throw new Error("Format members tidak valid");
  }

  if (!team_name) throw new Error("Nama tim wajib diisi");
  if (!pm_user_id || Number.isNaN(pm_user_id)) throw new Error("PM wajib dipilih");

  const res = await createTeamWithMembersRepo({ team_name, pm_user_id, member_user_ids });
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/users");
  return res.data; // TeamWithMembers
}

export async function addTeamMemberAction(formData: FormData) {
  const team_id = num(formData.get("team_id"));
  const user_id = num(formData.get("user_id"));
  const role = String(formData.get("role") || "STAFF");

  if (!team_id || !user_id) throw new Error("team_id dan user_id wajib");

  const res = await addTeamMemberRepo({ team_id, user_id, role: role as any });
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/users");
  return res.data; // TeamMemberRow
}

export async function removeTeamMemberAction(formData: FormData) {
  const team_member_id = num(formData.get("team_member_id"));
  if (!team_member_id) throw new Error("team_member_id wajib");

  const res = await removeTeamMemberRepo(team_member_id);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/users");
}


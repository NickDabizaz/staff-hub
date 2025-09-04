"use server";

import { revalidatePath } from "next/cache";
import {
  AddTeamMemberSchema,
  CreateTeamSchema,
  RemoveTeamMemberSchema,
} from "./schemas/teamsSchemas";
import {
  addTeamMemberService,
  createTeamService,
  removeTeamMemberService,
} from "./services/teamService";

function num(v: FormDataEntryValue | null): number {
  return Number(v ?? NaN);
}

export async function createTeamAction(formData: FormData) {
  const rawMembers = String(formData.get("member_user_ids") || "[]");
  let member_user_ids: number[] = [];
  try {
    const parsed = JSON.parse(rawMembers);
    if (Array.isArray(parsed)) {
      member_user_ids = parsed.map((x) => Number(x)).filter(Boolean);
    }
  } catch (e) {
    throw new Error("Format members tidak valid");
  }

  const payload = {
    team_name: String(formData.get("team_name") || "").trim(),
    pm_user_id: num(formData.get("pm_user_id")),
    member_user_ids,
  };

  const parsed = CreateTeamSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await createTeamService(parsed.data);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/teams");
  return res.data; // TeamWithMembers
}

export async function addTeamMemberAction(formData: FormData) {
  const payload = {
    team_id: num(formData.get("team_id")),
    user_id: num(formData.get("user_id")),
    role: String(formData.get("role") || "STAFF"),
  };

  const parsed = AddTeamMemberSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await addTeamMemberService(parsed.data as any);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/teams");
  return res.data; // TeamMemberRow
}

export async function removeTeamMemberAction(formData: FormData) {
  const payload = { team_member_id: num(formData.get("team_member_id")) };
  const parsed = RemoveTeamMemberSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await removeTeamMemberService(parsed.data.team_member_id);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/teams");
}


"use server";

import { cookies } from "next/headers";
import { err, ok, Result } from "@/lib/result";
import { SessionUser } from "@/app/admin/users/types/userTypes";

import { TeamMemberRole, TeamMemberRow, TeamWithMembers } from "../types/teamTypes";
import { addTeamMemberRepo, createTeamWithMembersRepo, listTeamsWithMembersRepo, removeTeamMemberRepo, updateTeamMembersRepo, updateTeamPMRepo } from "../data/teamsRepo";

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
export async function listTeamsService(): Promise<Result<TeamWithMembers[]>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await listTeamsWithMembersRepo();
}

export async function createTeamService(input: {
  team_name: string;
  pm_user_id: number;
  member_user_ids: number[];
}): Promise<Result<TeamWithMembers>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await createTeamWithMembersRepo(input);
}

export async function addTeamMemberService(input: {
  team_id: number;
  user_id: number;
  role: TeamMemberRole;
}): Promise<Result<TeamMemberRow>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await addTeamMemberRepo(input);
}

export async function removeTeamMemberService(
  team_member_id: number
): Promise<Result<null>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await removeTeamMemberRepo(team_member_id);
}

export async function updateTeamPMService(input: {
  team_id: number;
  pm_user_id: number;
}): Promise<Result<null>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await updateTeamPMRepo(input);
}

export async function updateTeamMembersService(input: {
  team_id: number;
  member_user_ids: number[];
}): Promise<Result<null>> {
  const me = await currentUser();
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await updateTeamMembersRepo(input);
}

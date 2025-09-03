"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { Result, ok, err } from "@/lib/result";
import {
  TeamWithMembers,
  TeamMemberRow,
  TeamMemberRole,
} from "../types/teamTypes";

function mapTeamRow(raw: any): TeamWithMembers {
  const members: TeamMemberRow[] = (raw.team_members ?? []).map((m: any) => ({
    team_member_id: m.team_member_id,
    team_id: m.team_id,
    team_member_role: m.team_member_role,
    user: {
      user_id: m.user?.user_id,
      user_name: m.user?.user_name,
      user_email: m.user?.user_email,
      user_system_role: m.user?.user_system_role,
    },
  }));

  return {
    team_id: raw.team_id,
    team_name: raw.team_name,
    members,
  } as TeamWithMembers;
}

export async function listTeamsWithMembersRepo(): Promise<
  Result<TeamWithMembers[]>
> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("teams")
    .select(
      `team_id,team_name,
       team_members:team_members(
         team_member_id, team_id, team_member_role,
         user:users(user_id,user_name,user_email,user_system_role)
       )`
    )
    .order("team_id", { ascending: true });

  if (error) return err(error.message);
  const mapped = (data ?? []).map(mapTeamRow);
  return ok(mapped);
}

export async function createTeamWithMembersRepo(input: {
  team_name: string;
  pm_user_id: number;
  member_user_ids: number[];
}): Promise<Result<TeamWithMembers>> {
  const sb = supabaseServer();

  // 1) Create team
  const { data: teamCreated, error: teamErr } = await sb
    .from("teams")
    .insert({ team_name: input.team_name })
    .select("team_id,team_name")
    .single();
  if (teamErr || !teamCreated) return err(teamErr?.message ?? "Gagal buat tim");

  const team_id = teamCreated.team_id as number;

  // 2) Insert PM member
  const { error: pmErr } = await sb.from("team_members").insert({
    team_id,
    user_id: input.pm_user_id,
    team_member_role: "PM" satisfies TeamMemberRole,
  });
  if (pmErr) return err(pmErr.message);

  // 3) Insert STAFF members (filter duplicates & PM)
  const uniqueMembers = Array.from(new Set(input.member_user_ids)).filter(
    (uid) => uid && uid !== input.pm_user_id
  );
  if (uniqueMembers.length > 0) {
    const rows = uniqueMembers.map((uid) => ({
      team_id,
      user_id: uid,
      team_member_role: "STAFF" as TeamMemberRole,
    }));
    const { error: memErr } = await sb.from("team_members").insert(rows);
    if (memErr) return err(memErr.message);
  }

  // 4) Read back with members
  const { data: full, error: fullErr } = await sb
    .from("teams")
    .select(
      `team_id,team_name,
       team_members:team_members(
         team_member_id, team_id, team_member_role,
         user:users(user_id,user_name,user_email,user_system_role)
       )`
    )
    .eq("team_id", team_id)
    .single();
  if (fullErr || !full) return err(fullErr?.message ?? "Gagal baca tim");

  return ok(mapTeamRow(full));
}

export async function addTeamMemberRepo(input: {
  team_id: number;
  user_id: number;
  role?: TeamMemberRole; // default STAFF
}): Promise<Result<TeamMemberRow>> {
  const sb = supabaseServer();
  const role = input.role ?? ("STAFF" as TeamMemberRole);

  // Insert member
  const { data: ins, error: insErr } = await sb
    .from("team_members")
    .insert({ team_id: input.team_id, user_id: input.user_id, team_member_role: role })
    .select("team_member_id,team_id,team_member_role")
    .single();
  if (insErr || !ins) return err(insErr?.message ?? "Gagal tambah member");

  // Fetch user for shaping
  const { data: user, error: userErr } = await sb
    .from("users")
    .select("user_id,user_name,user_email,user_system_role")
    .eq("user_id", input.user_id)
    .single();
  if (userErr || !user) return err(userErr?.message ?? "User tidak ditemukan");

  return ok({
    team_member_id: ins.team_member_id,
    team_id: ins.team_id,
    team_member_role: ins.team_member_role,
    user: user as any,
  });
}

export async function removeTeamMemberRepo(team_member_id: number): Promise<Result<null>> {
  const sb = supabaseServer();
  const { error } = await sb
    .from("team_members")
    .delete()
    .eq("team_member_id", team_member_id);
  if (error) return err(error.message);
  return ok(null);
}


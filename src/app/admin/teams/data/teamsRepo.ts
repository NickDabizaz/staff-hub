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

export async function getJobRolesRepo(): Promise<Result<any[]>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("job_roles")
    .select("job_role_id, job_role_name")
    .order("job_role_name");
    
  if (error) return err(error.message);
  return ok(data || []);
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

export async function getTeamMemberRolesRepo(team_member_id: number): Promise<Result<any[]>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("team_member_roles")
    .select("job_role_id")
    .eq("team_member_id", team_member_id);
    
  if (error) return err(error.message);
  return ok(data?.map(item => item.job_role_id) || []);
}

export async function setTeamMemberRolesRepo(team_member_id: number, job_role_ids: number[]): Promise<Result<null>> {
  const sb = supabaseServer();
  
  // Validasi input
  if (job_role_ids.some(id => isNaN(id) || id <= 0)) {
    return err("Invalid job role IDs");
  }
  
  // Hapus semua job role yang ada untuk team member ini
  const { error: deleteError } = await sb
    .from("team_member_roles")
    .delete()
    .eq("team_member_id", team_member_id);
  
  if (deleteError) return err(deleteError.message);
  
  // Tambahkan job role baru jika ada
  if (job_role_ids.length > 0) {
    const rows = job_role_ids.map(job_role_id => ({
      team_member_id,
      job_role_id
    }));
    
    const { error: insertError } = await sb
      .from("team_member_roles")
      .insert(rows);
      
    if (insertError) return err(insertError.message);
  }
  
  return ok(null);
}

export async function updateTeamPMRepo(input: {
  team_id: number;
  pm_user_id: number;
}): Promise<Result<null>> {
  const sb = supabaseServer();
  
  // 1. Periksa apakah user yang dipilih memang PM
  const { data: user, error: userErr } = await sb
    .from("users")
    .select("user_system_role")
    .eq("user_id", input.pm_user_id)
    .single();
  
  if (userErr) return err(userErr.message);
  if (user?.user_system_role !== "PM") return err("Hanya user dengan role PM yang bisa dijadikan Project Manager");
  
  // 2. Hapus role PM lama jika ada
  const { error: removeErr } = await sb
    .from("team_members")
    .delete()
    .match({ team_id: input.team_id, team_member_role: "PM" });
  
  if (removeErr) return err(removeErr.message);
  
  // 3. Tambahkan PM baru
  const { error: addErr } = await sb
    .from("team_members")
    .insert({
      team_id: input.team_id,
      user_id: input.pm_user_id,
      team_member_role: "PM"
    });
  
  if (addErr) return err(addErr.message);
  
  return ok(null);
}

export async function updateTeamMembersRepo(input: {
  team_id: number;
  member_user_ids: number[];
}): Promise<Result<null>> {
  const sb = supabaseServer();
  // Ambil daftar anggota STAFF saat ini untuk tim ini
  const { data: currentRows, error: currentErr } = await sb
    .from("team_members")
    .select("team_member_id,user_id")
    .match({ team_id: input.team_id, team_member_role: "STAFF" });

  if (currentErr) return err(currentErr.message);

  const currentUserIds = new Set((currentRows ?? []).map((r: any) => r.user_id as number));
  const desiredUserIds = Array.from(new Set(input.member_user_ids.filter(Boolean)));

  // Hitung diff: siapa yang harus dihapus dan siapa yang harus ditambahkan
  const toDelete = (currentRows ?? [])
    .filter((r: any) => !desiredUserIds.includes(r.user_id))
    .map((r: any) => r.team_member_id as number);

  const toAdd = desiredUserIds.filter((uid) => !currentUserIds.has(uid));

  // Hapus hanya anggota yang tidak lagi dipilih
  if (toDelete.length > 0) {
    const { error: removeErr } = await sb
      .from("team_members")
      .delete()
      .in("team_member_id", toDelete);
    if (removeErr) return err(removeErr.message);
  }

  // Tambahkan hanya anggota baru
  if (toAdd.length > 0) {
    const rows = toAdd.map((user_id) => ({
      team_id: input.team_id,
      user_id,
      team_member_role: "STAFF" as TeamMemberRole,
    }));
    const { error: insertErr } = await sb.from("team_members").insert(rows);
    if (insertErr) return err(insertErr.message);
  }

  return ok(null);
}

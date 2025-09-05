"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { Result, ok, err } from "@/lib/result";
import {
  TeamWithMembers,
  TeamMemberRow,
  TeamMemberRole,
} from "../types/teamTypes";

/**
 * Fungsi utilitas untuk memetakan data tim mentah ke struktur yang diharapkan
 * 
 * @param raw - Data tim mentah dari database
 * @returns Data tim yang telah dipetakan ke struktur TeamWithMembers
 */
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

/**
 * Repository function untuk mengambil daftar job roles dari database
 * 
 * @returns Daftar job roles atau error jika terjadi kesalahan
 */
export async function getJobRolesRepo(): Promise<Result<any[]>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("job_roles")
    .select("job_role_id, job_role_name")
    .order("job_role_name");
    
  if (error) return err(error.message);
  return ok(data || []);
}

/**
 * Repository function untuk mengambil daftar semua tim dengan anggotanya
 * 
 * @returns Daftar tim dengan anggotanya atau error jika terjadi kesalahan
 */
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

/**
 * Repository function untuk membuat tim baru beserta anggotanya
 * 
 * @param input - Data tim baru yang akan dibuat
 * @returns Hasil operasi pembuatan tim atau error jika terjadi kesalahan
 */
export async function createTeamWithMembersRepo(input: {
  team_name: string;
  pm_user_id: number;
  member_user_ids: number[];
}): Promise<Result<TeamWithMembers>> {
  const sb = supabaseServer();

  // 1) Membuat tim
  const { data: teamCreated, error: teamErr } = await sb
    .from("teams")
    .insert({ team_name: input.team_name })
    .select("team_id,team_name")
    .single();
  if (teamErr || !teamCreated) return err(teamErr?.message ?? "Gagal buat tim");

  const team_id = teamCreated.team_id as number;

  // 2) Menyisipkan anggota PM
  const { error: pmErr } = await sb.from("team_members").insert({
    team_id,
    user_id: input.pm_user_id,
    team_member_role: "PM" satisfies TeamMemberRole,
  });
  if (pmErr) return err(pmErr.message);

  // 3) Menyisipkan anggota STAFF (filter duplikat & PM)
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

  // 4) Membaca kembali dengan anggota
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

/**
 * Repository function untuk menambahkan anggota ke tim
 * 
 * @param input - Data anggota yang akan ditambahkan
 * @returns Hasil operasi penambahan anggota atau error jika terjadi kesalahan
 */
export async function addTeamMemberRepo(input: {
  team_id: number;
  user_id: number;
  role?: TeamMemberRole; // default STAFF
}): Promise<Result<TeamMemberRow>> {
  const sb = supabaseServer();
  const role = input.role ?? ("STAFF" as TeamMemberRole);

  // Menyisipkan anggota
  const { data: ins, error: insErr } = await sb
    .from("team_members")
    .insert({ team_id: input.team_id, user_id: input.user_id, team_member_role: role })
    .select("team_member_id,team_id,team_member_role")
    .single();
  if (insErr || !ins) return err(insErr?.message ?? "Gagal tambah member");

  // Mengambil pengguna untuk shaping
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

/**
 * Repository function untuk menghapus anggota dari tim
 * 
 * @param team_member_id - ID anggota tim yang akan dihapus
 * @returns Hasil operasi penghapusan atau error jika terjadi kesalahan
 */
export async function removeTeamMemberRepo(team_member_id: number): Promise<Result<null>> {
  const sb = supabaseServer();
  const { error } = await sb
    .from("team_members")
    .delete()
    .eq("team_member_id", team_member_id);
  if (error) return err(error.message);
  return ok(null);
}

/**
 * Repository function untuk mengambil job roles anggota tim
 * 
 * @param team_member_id - ID anggota tim
 * @returns Daftar job role IDs untuk anggota tim atau error jika terjadi kesalahan
 */
export async function getTeamMemberRolesRepo(team_member_id: number): Promise<Result<any[]>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("team_member_roles")
    .select("job_role_id")
    .eq("team_member_id", team_member_id);
    
  if (error) return err(error.message);
  return ok(data?.map(item => item.job_role_id) || []);
}

/**
 * Repository function untuk mengatur job roles anggota tim
 * 
 * @param team_member_id - ID anggota tim
 * @param job_role_ids - Daftar ID job roles yang akan diatur
 * @returns Hasil operasi pengaturan job roles atau error jika terjadi kesalahan
 */
export async function setTeamMemberRolesRepo(team_member_id: number, job_role_ids: number[]): Promise<Result<null>> {
  const sb = supabaseServer();
  
  // Validasi input
  if (job_role_ids.some(id => isNaN(id) || id <= 0)) {
    return err("Invalid job role IDs");
  }
  
  // Menghapus semua job role yang ada untuk anggota tim ini
  const { error: deleteError } = await sb
    .from("team_member_roles")
    .delete()
    .eq("team_member_id", team_member_id);
  
  if (deleteError) return err(deleteError.message);
  
  // Menambahkan job role baru jika ada
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

/**
 * Repository function untuk memperbarui Project Manager tim
 * 
 * @param input - Data untuk memperbarui PM tim
 * @returns Hasil operasi pembaruan PM atau error jika terjadi kesalahan
 */
export async function updateTeamPMRepo(input: {
  team_id: number;
  pm_user_id: number;
}): Promise<Result<null>> {
  const sb = supabaseServer();
  
  // 1. Memeriksa apakah pengguna yang dipilih memang PM
  const { data: user, error: userErr } = await sb
    .from("users")
    .select("user_system_role")
    .eq("user_id", input.pm_user_id)
    .single();
  
  if (userErr) return err(userErr.message);
  if (user?.user_system_role !== "PM") return err("Hanya user dengan role PM yang bisa dijadikan Project Manager");
  
  // 2. Menghapus role PM lama jika ada
  const { error: removeErr } = await sb
    .from("team_members")
    .delete()
    .match({ team_id: input.team_id, team_member_role: "PM" });
  
  if (removeErr) return err(removeErr.message);
  
  // 3. Menambahkan PM baru
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

/**
 * Repository function untuk memperbarui anggota tim
 * 
 * @param input - Data untuk memperbarui anggota tim
 * @returns Hasil operasi pembaruan anggota atau error jika terjadi kesalahan
 */
export async function updateTeamMembersRepo(input: {
  team_id: number;
  member_user_ids: number[];
}): Promise<Result<null>> {
  const sb = supabaseServer();
  // Mengambil daftar anggota STAFF saat ini untuk tim ini
  const { data: currentRows, error: currentErr } = await sb
    .from("team_members")
    .select("team_member_id,user_id")
    .match({ team_id: input.team_id, team_member_role: "STAFF" });

  if (currentErr) return err(currentErr.message);

  const currentUserIds = new Set((currentRows ?? []).map((r: any) => r.user_id as number));
  const desiredUserIds = Array.from(new Set(input.member_user_ids.filter(Boolean)));

  // Menghitung diff: siapa yang harus dihapus dan siapa yang harus ditambahkan
  const toDelete = (currentRows ?? [])
    .filter((r: any) => !desiredUserIds.includes(r.user_id))
    .map((r: any) => r.team_member_id as number);

  const toAdd = desiredUserIds.filter((uid) => !currentUserIds.has(uid));

  // Menghapus hanya anggota yang tidak lagi dipilih
  if (toDelete.length > 0) {
    const { error: removeErr } = await sb
      .from("team_members")
      .delete()
      .in("team_member_id", toDelete);
    if (removeErr) return err(removeErr.message);
  }

  // Menambahkan hanya anggota baru
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
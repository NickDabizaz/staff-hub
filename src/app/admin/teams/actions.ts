"use server";

import { revalidatePath } from "next/cache";
import {
  AddTeamMemberSchema,
  CreateTeamSchema,
  RemoveTeamMemberSchema,
  UpdateTeamPMSchema,
  UpdateTeamMembersSchema,
  SetTeamMemberRolesSchema,
} from "./schemas/teamsSchemas";
import {
  addTeamMemberService,
  createTeamService,
  removeTeamMemberService,
  updateTeamPMService,
  updateTeamMembersService,
  getJobRolesService,
  getTeamMemberRolesService,
  setTeamMemberRolesService,
} from "./services/teamService";

/**
 * Fungsi utilitas untuk mengkonversi nilai ke tipe number
 * 
 * @param value - Nilai yang akan dikonversi
 * @returns Nilai dalam bentuk number, NaN jika gagal
 */
function num(v: FormDataEntryValue | null): number {
  return Number(v ?? NaN);
}

/**
 * Action untuk mengambil daftar job roles
 * 
 * @returns Daftar job roles
 */
export async function getJobRolesAction() {
  const res = await getJobRolesService();
  if (!res.ok) throw new Error(res.error);
  return res.data;
}

/**
 * Action untuk membuat tim baru
 * Memvalidasi data input dan membuat tim baru melalui service
 * 
 * @param formData - Data form yang berisi informasi tim baru
 * @returns Hasil operasi pembuatan tim
 */
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

/**
 * Action untuk menambahkan anggota ke tim
 * Memvalidasi data input dan menambahkan anggota melalui service
 * 
 * @param formData - Data form yang berisi informasi anggota yang akan ditambahkan
 * @returns Hasil operasi penambahan anggota
 */
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

/**
 * Action untuk menghapus anggota dari tim
 * Memvalidasi data input dan menghapus anggota melalui service
 * 
 * @param formData - Data form yang berisi ID anggota yang akan dihapus
 * @returns Hasil operasi penghapusan anggota
 */
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

/**
 * Action untuk mengambil job roles anggota tim
 * 
 * @param team_member_id - ID anggota tim
 * @returns Daftar job role IDs untuk anggota tim
 */
export async function getTeamMemberRolesAction(team_member_id: number) {
  const res = await getTeamMemberRolesService(team_member_id);
  if (!res.ok) throw new Error(res.error);
  return res.data;
}

/**
 * Action untuk mengatur job roles anggota tim
 * Memvalidasi data input dan mengatur job roles melalui service
 * 
 * @param formData - Data form yang berisi ID anggota tim dan daftar job role IDs
 * @returns Hasil operasi pengaturan job roles
 */
export async function setTeamMemberRolesAction(formData: FormData) {
  const team_member_id = num(formData.get("team_member_id"));
  const rawJobRoles = String(formData.get("job_role_ids") || "[]");
  
  let job_role_ids: number[] = [];
  try {
    const parsed = JSON.parse(rawJobRoles);
    if (Array.isArray(parsed)) {
      job_role_ids = parsed.map((x) => Number(x)).filter(Boolean);
    }
  } catch (e) {
    throw new Error("Format job roles tidak valid");
  }

  const payload = {
    team_member_id,
    job_role_ids,
  };

  const parsed = SetTeamMemberRolesSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await setTeamMemberRolesService(team_member_id, job_role_ids);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/teams");
}

/**
 * Action untuk memperbarui Project Manager tim
 * Memvalidasi data input dan memperbarui PM melalui service
 * 
 * @param formData - Data form yang berisi ID tim dan ID pengguna baru sebagai PM
 * @returns Hasil operasi pembaruan PM
 */
export async function updateTeamPMAction(formData: FormData) {
  const payload = {
    team_id: num(formData.get("team_id")),
    pm_user_id: num(formData.get("pm_user_id")),
  };

  const parsed = UpdateTeamPMSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await updateTeamPMService(parsed.data);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/teams");
  return res.data;
}

/**
 * Action untuk memperbarui anggota tim
 * Memvalidasi data input dan memperbarui anggota melalui service
 * 
 * @param formData - Data form yang berisi ID tim dan daftar ID pengguna sebagai anggota
 * @returns Hasil operasi pembaruan anggota
 */
export async function updateTeamMembersAction(formData: FormData) {
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
    team_id: num(formData.get("team_id")),
    member_user_ids,
  };

  const parsed = UpdateTeamMembersSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await updateTeamMembersService(parsed.data);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/teams");
  return res.data;
}
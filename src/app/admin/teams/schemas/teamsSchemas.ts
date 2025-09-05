import { z } from "zod";

/**
 * Schema validasi untuk membuat tim baru
 * Memastikan data yang diterima sesuai dengan format yang diharapkan
 */
export const CreateTeamSchema = z.object({
  team_name: z.string().min(1, "Nama tim wajib diisi"),
  pm_user_id: z.number().int().positive("PM wajib dipilih"),
  member_user_ids: z.array(z.number().int().positive()).default([]),
});

/**
 * Schema validasi untuk menambahkan anggota tim
 * Memastikan data yang diterima sesuai dengan format yang diharapkan
 */
export const AddTeamMemberSchema = z.object({
  team_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  role: z.enum(["PM", "STAFF"]).default("STAFF"),
});

/**
 * Schema validasi untuk menghapus anggota tim
 * Memastikan ID anggota tim yang diterima valid
 */
export const RemoveTeamMemberSchema = z.object({
  team_member_id: z.number().int().positive(),
});

/**
 * Schema validasi untuk memperbarui Project Manager tim
 * Memastikan data yang diterima sesuai dengan format yang diharapkan
 */
export const UpdateTeamPMSchema = z.object({
  team_id: z.number().int().positive(),
  pm_user_id: z.number().int().positive("PM wajib dipilih"),
});

/**
 * Schema validasi untuk memperbarui anggota tim
 * Memastikan data yang diterima sesuai dengan format yang diharapkan
 */
export const UpdateTeamMembersSchema = z.object({
  team_id: z.number().int().positive(),
  member_user_ids: z.array(z.number().int().positive()).default([]),
});

/**
 * Schema validasi untuk mengatur job roles anggota tim
 * Memastikan data yang diterima sesuai dengan format yang diharapkan
 */
export const SetTeamMemberRolesSchema = z.object({
  team_member_id: z.number().int().positive(),
  job_role_ids: z.array(z.number().int().positive()).default([]),
});
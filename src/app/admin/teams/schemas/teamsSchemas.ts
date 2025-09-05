import { z } from "zod";

export const CreateTeamSchema = z.object({
  team_name: z.string().min(1, "Nama tim wajib diisi"),
  pm_user_id: z.number().int().positive("PM wajib dipilih"),
  member_user_ids: z.array(z.number().int().positive()).default([]),
});

export const AddTeamMemberSchema = z.object({
  team_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  role: z.enum(["PM", "STAFF"]).default("STAFF"),
});

export const RemoveTeamMemberSchema = z.object({
  team_member_id: z.number().int().positive(),
});

export const UpdateTeamPMSchema = z.object({
  team_id: z.number().int().positive(),
  pm_user_id: z.number().int().positive("PM wajib dipilih"),
});

export const UpdateTeamMembersSchema = z.object({
  team_id: z.number().int().positive(),
  member_user_ids: z.array(z.number().int().positive()).default([]),
});

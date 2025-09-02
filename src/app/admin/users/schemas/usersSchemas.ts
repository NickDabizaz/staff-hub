import { z } from "zod";

export const RoleSchema = z.enum(["ADMIN", "PM", "STAFF"]);

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: RoleSchema.default("STAFF"),
});

export const UpdateUserSchema = z.object({
  id: z.number().int().positive("ID tidak valid"),
  name: z.string().min(1, "Nama wajib diisi").optional(),
  role: RoleSchema.optional(),
  // Jika mau izinkan ganti password saat edit:
  password: z.string().min(6).optional(),
});

export const DeleteUserSchema = z.object({
  id: z.number().int().positive("ID tidak valid"),
});

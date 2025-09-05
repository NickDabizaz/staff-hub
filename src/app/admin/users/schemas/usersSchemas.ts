import { z } from "zod";

/**
 * Schema validasi untuk role pengguna
 * Mendefinisikan nilai-nilai yang valid untuk role pengguna
 */
export const RoleSchema = z.enum(["ADMIN", "PM", "STAFF"]);

/**
 * Schema validasi untuk membuat pengguna baru
 * Memastikan data yang diterima sesuai dengan format yang diharapkan
 */
export const CreateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: RoleSchema.default("STAFF"),
});

/**
 * Schema validasi untuk memperbarui pengguna
 * Memastikan data yang diterima sesuai dengan format yang diharapkan
 */
export const UpdateUserSchema = z.object({
  id: z.number().int().positive("ID tidak valid"),
  name: z.string().min(1, "Nama wajib diisi").optional(),
  role: RoleSchema.optional(),
  // Jika mau izinkan ganti password saat edit:
  password: z.string().min(6).optional(),
});

/**
 * Schema validasi untuk menghapus pengguna
 * Memastikan ID pengguna yang diterima valid
 */
export const DeleteUserSchema = z.object({
  id: z.number().int().positive("ID tidak valid"),
});
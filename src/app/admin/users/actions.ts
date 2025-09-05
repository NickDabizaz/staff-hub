"use server";

import { revalidatePath } from "next/cache";
import {
  CreateUserSchema,
  UpdateUserSchema,
  DeleteUserSchema,
} from "./schemas/usersSchemas";
import {
  createUserService,
  deleteUserService,
  updateUserService,
} from "./services/userService";

/**
 * Actions: parsing FormData -> validasi Zod -> panggil service -> revalidate
 * Tidak ada query langsung di sini.
 */

/**
 * Fungsi utilitas untuk mengkonversi nilai ke tipe number
 * 
 * @param value - Nilai yang akan dikonversi
 * @returns Nilai dalam bentuk number, NaN jika gagal
 */
function parseNumber(value: FormDataEntryValue | null): number {
  return Number(value ?? NaN);
}

/**
 * Action untuk membuat pengguna baru
 * Memvalidasi data input dan membuat pengguna baru melalui service
 * 
 * @param formData - Data form yang berisi informasi pengguna baru
 * @returns Hasil operasi pembuatan pengguna
 */
export async function createUserAction(formData: FormData) {
  const payload = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    role: String(formData.get("role") || "STAFF"),
  };

  const parsed = CreateUserSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await createUserService(parsed.data);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/users");
}

/**
 * Action untuk memperbarui informasi pengguna
 * Memvalidasi data input dan memperbarui pengguna melalui service
 * 
 * @param formData - Data form yang berisi informasi pengguna yang diperbarui
 * @returns Hasil operasi pembaruan pengguna
 */
export async function updateUserAction(formData: FormData) {
  const payload = {
    id: parseNumber(formData.get("id")),
    name: String(formData.get("name") || ""),
    role: formData.get("role") ? String(formData.get("role")) : undefined,
    password: formData.get("password")
      ? String(formData.get("password"))
      : undefined,
  };

  const parsed = UpdateUserSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await updateUserService(parsed.data);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/users");
}

/**
 * Action untuk menghapus pengguna
 * Memvalidasi data input dan menghapus pengguna melalui service
 * 
 * @param formData - Data form yang berisi ID pengguna yang akan dihapus
 * @returns Hasil operasi penghapusan pengguna
 */
export async function deleteUserAction(formData: FormData) {
  const payload = { id: parseNumber(formData.get("id")) };
  const parsed = DeleteUserSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await deleteUserService(parsed.data.id);
  if (!res.ok) throw new Error(res.error);

  revalidatePath("/admin/users");
}
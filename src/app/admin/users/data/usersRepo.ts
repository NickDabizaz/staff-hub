"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { UserRow, Result, ok, err } from "../types/userTypes";

/**
 * Semua akses ke Supabase dikumpulkan di sini.
 * Repository TIDAK berisi aturan bisnis.
 */

/**
 * Mengambil daftar semua pengguna dari database
 * 
 * @returns Daftar pengguna atau error jika terjadi kesalahan
 */
export async function listUsersRepo(): Promise<Result<UserRow[]>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("users")
    .select("user_id,user_name,user_email,user_system_role")
    .order("user_id", { ascending: true });

  if (error) return err(error.message);
  return ok(data ?? []);
}

/**
 * Mencari pengguna berdasarkan alamat email
 * 
 * @param email - Alamat email yang akan dicari
 * @returns Data pengguna atau null jika tidak ditemukan, error jika terjadi kesalahan
 */
export async function findUserByEmailRepo(
  email: string
): Promise<Result<UserRow | null>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("users")
    .select("user_id,user_name,user_email,user_system_role")
    .eq("user_email", email)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ?? null);
}

/**
 * Membuat pengguna baru di database
 * 
 * @param input - Data pengguna baru yang akan dibuat
 * @returns Hasil operasi pembuatan pengguna
 */
export async function createUserRepo(input: {
  name: string;
  email: string;
  password: string; // NOTE: idealnya sudah di-hash dari service
  role: UserRow["user_system_role"];
}): Promise<Result<null>> {
  const sb = supabaseServer();
  const { error } = await sb.from("users").insert({
    user_name: input.name,
    user_email: input.email,
    user_password: input.password, // ganti dengan hashed_password kalau sudah hashing
    user_system_role: input.role,
  });
  if (error) return err(error.message);
  return ok(null);
}

/**
 * Memperbarui informasi pengguna di database
 * 
 * @param input - Data pengguna yang akan diperbarui
 * @returns Hasil operasi pembaruan pengguna
 */
export async function updateUserRepo(input: {
  id: number;
  name?: string;
  role?: UserRow["user_system_role"];
  password?: string; // optional
}): Promise<Result<null>> {
  const sb = supabaseServer();

  const updatePayload: Record<string, unknown> = {};
  if (input.name) updatePayload.user_name = input.name;
  if (input.role) updatePayload.user_system_role = input.role;
  if (input.password) updatePayload.user_password = input.password; // hash idealnya

  if (Object.keys(updatePayload).length === 0) {
    return err("Tidak ada perubahan");
  }

  const { error } = await sb
    .from("users")
    .update(updatePayload)
    .eq("user_id", input.id);

  if (error) return err(error.message);
  return ok(null);
}

/**
 * Menghapus pengguna dari database
 * 
 * @param id - ID pengguna yang akan dihapus
 * @returns Hasil operasi penghapusan pengguna
 */
export async function deleteUserRepo(id: number): Promise<Result<null>> {
  const sb = supabaseServer();
  const { error } = await sb.from("users").delete().eq("user_id", id);
  if (error) return err(error.message);
  return ok(null);
}
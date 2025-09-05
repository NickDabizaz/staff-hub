"use server";

import { cookies } from "next/headers";
import { SessionUser, Result, ok, err } from "../types/userTypes";
import {
  createUserRepo,
  deleteUserRepo,
  findUserByEmailRepo,
  listUsersRepo,
  updateUserRepo,
} from "../data/usersRepo";

/**
 * Memastikan bahwa pengguna memiliki hak akses admin
 * 
 * @param user - Data pengguna yang akan diverifikasi
 * @returns Hasil verifikasi, error jika bukan admin
 */
function ensureAdmin(user: SessionUser | null): Result<null> {
  if (!user || user.role !== "ADMIN") return err("FORBIDDEN");
  return ok(null);
}

/**
 * Mengambil data pengguna yang sedang login
 * 
 * @returns Data pengguna yang sedang login atau null jika tidak ada
 */
async function currentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

/**
 * Service untuk mengambil daftar semua pengguna
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @returns Daftar pengguna atau error jika tidak memiliki akses
 */
export async function listUsersService(): Promise<Result<unknown>> {
  const me = await currentUser();
  
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await listUsersRepo();
}

/**
 * Service untuk membuat pengguna baru
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * Memeriksa apakah email sudah terdaftar sebelum membuat pengguna baru
 * 
 * @param input - Data pengguna baru yang akan dibuat
 * @returns Hasil operasi pembuatan pengguna
 */
export async function createUserService(input: {
  name    : string;
  email   : string;
  password: string;
  role    : "ADMIN" | "PM" | "STAFF";
}): Promise<Result<null>> {
  const me = await currentUser();
  
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  const existed = await findUserByEmailRepo(input.email);
  if (!existed.ok) return existed;
  if (existed.data) return err("Email sudah terdaftar");

  return await createUserRepo({
    name    : input.name,
    email   : input.email,
    password: input.password,  
    role    : input.role,
  });
}

/**
 * Service untuk memperbarui informasi pengguna
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @param input - Data pengguna yang akan diperbarui
 * @returns Hasil operasi pembaruan pengguna
 */
export async function updateUserService(input: {
  id       : number;
  name    ?: string;
  role    ?: "ADMIN" | "PM" | "STAFF";
  password?: string;
}): Promise<Result<null>> {
  const me = await currentUser();

  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await updateUserRepo(input);
}

/**
 * Service untuk menghapus pengguna
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @param id - ID pengguna yang akan dihapus
 * @returns Hasil operasi penghapusan pengguna
 */
export async function deleteUserService(id: number): Promise<Result<null>> {
  const me = await currentUser();

  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await deleteUserRepo(id);
}
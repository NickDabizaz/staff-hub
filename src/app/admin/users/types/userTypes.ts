import { Result } from "@/lib/result";

/**
 * Tipe data untuk role pengguna
 * Mendefinisikan nilai-nilai yang valid untuk role pengguna
 */
export type Role = "ADMIN" | "PM" | "STAFF";

/**
 * Interface untuk struktur data baris pengguna di database
 * Mendefinisikan properti-properti yang dimiliki setiap pengguna
 */
export type UserRow = {
  user_id         : number;
  user_name       : string;
  user_email      : string;
  user_system_role: Role;
};

/**
 * Interface untuk struktur data pengguna dalam sesi
 * Digunakan untuk menyimpan informasi pengguna yang sedang login
 */
export type SessionUser = {
  id   : number;
  name : string;
  email: string;
  role : Role;
};

export { ok, err } from "@/lib/result";
export type { Result, Ok, Err } from "@/lib/result";
"use server";

import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

/**
 * Fungsi untuk menangani proses login pengguna
 * Memvalidasi kredensial pengguna dan membuat sesi login jika berhasil
 * 
 * @param payload - Objek yang berisi email dan password pengguna
 * @returns Mengarahkan pengguna ke halaman yang sesuai berdasarkan hasil autentikasi
 */
export async function loginAction(payload: { email: string; password: string }) {
  const email = payload?.email ?? "";
  const password = payload?.password ?? "";
  const sb = supabaseServer();
  const { data: user, error } = await sb
    .from("users")
    .select("user_id,user_name,user_email,user_password,user_system_role")
    .eq("user_email", email)
    .single();

  // Jika terjadi kesalahan atau pengguna tidak ditemukan atau password tidak cocok
  if (error || !user || user.user_password !== password) {
    const c = await cookies();
    c.set("sb_login_error", "Email atau password salah", { path: "/login", maxAge: 5 });
    redirect("/login");
  }

  // Jika autentikasi berhasil, buat cookie sesi pengguna
  const c = await cookies();
  c.set(
    "sb_user",
    JSON.stringify({
      id: user.user_id,
      name: user.user_name,
      role: user.user_system_role,
      email: user.user_email,
    }),
    { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 }
  );
  redirect("/");
}
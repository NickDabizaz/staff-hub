import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

/**
 * Handler untuk route logout yang menangani penghapusan sesi pengguna
 * Fungsi ini akan menghapus cookie sesi pengguna dan mengarahkan kembali ke halaman login
 * 
 * @returns Mengarahkan pengguna ke halaman login setelah sesi dihapus
 */
export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set("sb_user", "", { path: "/", maxAge: 0 });
  redirect("/login");
}
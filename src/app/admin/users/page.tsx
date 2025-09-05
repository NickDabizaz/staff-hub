import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import UsersAdmin from "@/app/admin/users/components/UsersAdmin"; // Updated to glassy component

/**
 * Halaman utama untuk manajemen pengguna
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @returns Komponen UsersAdmin dengan data pengguna awal
 */
export default async function UsersPage() {
  // Memeriksa autentikasi pengguna
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  // Jika tidak ada pengguna yang login, arahkan ke halaman login
  if (!user) redirect("/login");
  // Jika pengguna bukan admin, arahkan ke halaman utama
  if (user.role !== "ADMIN") redirect("/");

  // Mengambil data pengguna awal dari database
  const sb = supabaseServer();
  const { data: users } = await sb
    .from("users")
    .select("user_id,user_name,user_email,user_system_role")
    .order("user_id", { ascending: true });

  // Menyerahkan tampilan kepada komponen UsersAdmin
  return <UsersAdmin initialUsers={users ?? []} />;
}
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UsersAdmin from "@/app/admin/users/components/UsersAdmin";
import { supabaseServer } from "@/lib/supabase-server";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const sb = supabaseServer();
  const { data: users } = await sb
    .from("users")
    .select("user_id,user_name,user_email,user_system_role")
    .order("user_id", { ascending: true });

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link href="/admin" className="underline text-sm">Kembali</Link>
      </header>

      <UsersAdmin initialUsers={users ?? []} />
    </main>
  );
}

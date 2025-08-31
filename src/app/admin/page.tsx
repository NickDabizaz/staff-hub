import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <nav className="space-x-3 text-sm">
          <Link href="/admin/users" className="underline">Users</Link>
          <Link href="/" className="underline">Dashboard</Link>
          <Link href="/logout" className="underline">Logout</Link>
        </nav>
      </header>

      <section className="border rounded p-4">
        <h2 className="font-medium">Ringkasan</h2>
        <p className="text-sm text-gray-600">Kelola data pengguna, tim, dan pengaturan sistem.</p>
      </section>
    </main>
  );
}

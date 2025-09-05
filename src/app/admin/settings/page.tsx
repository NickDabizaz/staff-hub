import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JobRolesManagement } from "./components/job-roles-management";

export default async function AdminSettings() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-blue-400 hover:underline">
            ← Kembali ke Menu Admin
          </Link>
          <h1 className="text-2xl font-semibold mt-2">Pengaturan</h1>
        </div>
        <nav className="space-x-3 text-sm">
          <Link href="/logout" className="underline">
            Logout
          </Link>
        </nav>
      </header>

      <section className="border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Kelola Job Roles</h2>
        <JobRolesManagement />
      </section>

      <section className="border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Preferensi Dasar</h2>
        <p className="text-white/60">Pengaturan preferensi dasar akan datang di sini.</p>
      </section>
    </main>
  );
}
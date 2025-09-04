import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  // definisi menu
  const menus = [
    {
      href: "/admin/dashboard",
      title: "Dashboard",
      subtitle: "Halaman utama untuk ringkasan aktivitas dan laporan.",
    },
    {
      href: "/admin/users",
      title: "Users",
      subtitle: "Kelola data pengguna dan hak akses.",
    },
    {
      href: "/admin/teams",
      title: "Teams",
      subtitle: "Kelola tim dan anggotanya.",
    },
    {
      href: "/admin/projects",
      title: "Projects",
      subtitle: "Kelola project dan tim yang mengerjakan project.",
    },
  ];

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Menu Admin</h1>
        <nav className="space-x-3 text-sm">
          <Link href="/logout" className="underline">
            Logout
          </Link>
        </nav>
      </header>

      <section>
        <section className="mx-auto max-w-7xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="group block rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={m.title}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{m.title}</h3>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">{m.subtitle}</p>
            </a>
          ))}
        </section>
      </section>
    </main>
  );
}

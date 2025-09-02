import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
        <Link href="/admin" className="underline text-sm">
          Kembali
        </Link>
      </header>
    </main>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listTeamsService } from "./services/teamService";
import { listUsersService } from "../users/services/userService";
import TeamsAdmin from "./components/TeamsAdmin";

// Main page for team management
// Only accessible to admin users
export default async function TeamsPage() {
  // Authentication check
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  // Fetch initial data for teams and users
  const teamsRes = await listTeamsService();
  const teams = teamsRes.ok ? teamsRes.data : [];

  const usersRes = await listUsersService();
  const users = usersRes.ok ? usersRes.data : [];

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Link href="/admin" className="underline text-sm">
          Kembali
        </Link>
      </header>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
        <TeamsAdmin initialTeams={teams} initialUsers={users || []} />
      </section>
    </main>
  );
}
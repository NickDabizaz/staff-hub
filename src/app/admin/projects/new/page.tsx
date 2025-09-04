import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listTeamsService } from "@/app/admin/teams/services/teamService";
import CreateProjectForm from "../components/CreateProjectForm";

export default async function NewProjectPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const teamsRes = await listTeamsService();
  const teams = teamsRes.ok ? teamsRes.data : [];

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href="/admin/projects" className="underline text-sm">
          Kembali
        </Link>
      </header>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold">Tambah Project Baru</h3>
        </div>
        
        <CreateProjectForm teams={teams} />
      </section>
    </main>
  );
}
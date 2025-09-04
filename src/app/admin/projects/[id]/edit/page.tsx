import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getProjectService } from "@/app/admin/projects/services/projectService";
import { listTeamsService } from "@/app/admin/teams/services/teamService";
import EditProjectForm from "./components/EditProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const projectId = Number(id);
  if (isNaN(projectId)) {
    redirect("/admin/projects");
  }

  const projectRes = await getProjectService(projectId);
  const project = projectRes.ok ? projectRes.data : null;

  if (!project) {
    redirect("/admin/projects");
  }

  const teamsRes = await listTeamsService();
  const teams = teamsRes.ok ? teamsRes.data : [];

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href={`/admin/projects/${projectId}`} className="underline text-sm">
          Kembali
        </Link>
      </header>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold">Edit Project</h3>
        </div>
        
        <EditProjectForm project={project} teams={teams} />
      </section>
    </main>
  );
}
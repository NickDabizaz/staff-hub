import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProjectService } from "../services/projectService";
import { listTeamsService } from "@/app/admin/teams/services/teamService";
import ProjectDetail from "./components/ProjectDetail";
import Sidebar from "@/app/admin/components/Sidebar";
import Header from "@/app/admin/components/Header";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import DeleteProjectButton from "./components/DeleteProjectButton";

/**
 * Halaman detail proyek
 * Menampilkan informasi lengkap tentang proyek tertentu
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @param params - Parameter URL yang berisi ID proyek
 * @returns Komponen ProjectDetail dengan data proyek dan tim
 */
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  // Memeriksa autentikasi pengguna
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  // Memvalidasi ID proyek
  const projectId = Number(id);
  if (isNaN(projectId)) {
    redirect("/admin/projects");
  }

  // Mengambil data proyek
  const projectRes = await getProjectService(projectId);
  const project = projectRes.ok ? projectRes.data : null;

  // Jika proyek tidak ditemukan, arahkan kembali ke daftar proyek
  if (!project) {
    redirect("/admin/projects");
  }

  // Mengambil data tim
  const teamsRes = await listTeamsService();
  const teams = teamsRes.ok ? teamsRes.data : [];

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6 space-y-6">
          <header>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Projects</h1>
                <p className="mt-1 text-slate-400">Detail proyek dan informasi terkait.</p>
              </div>
            </div>
          </header>

          <section className="bg-slate-800/50 border border-slate-800 rounded-lg">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Detail Project</h3>
                <div className="flex gap-2">
                  <Link 
                    href={`/admin/projects`}
                    className="inline-flex items-center justify-center bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-slate-500 transition-all duration-300 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Link>
                  <Link 
                    href={`/admin/projects/${project.project_id}/edit`}
                    className="inline-flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-sky-500 transition-all duration-300 text-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Link>
                  <DeleteProjectButton 
                    project_id={project.project_id}
                    project_name={project.project_name}
                  />
                </div>
              </div>
            </div>
            <div className="p-4">
              <ProjectDetail project={project} teams={teams} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
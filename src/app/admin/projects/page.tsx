import { listTeamsService } from "@/app/admin/teams/services/teamService";
import { listProjectsService } from "./services/projectService";
import ProjectsList from "./components/ProjectsList";
import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Halaman utama untuk manajemen proyek
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * Menampilkan daftar semua proyek dengan opsi untuk menambah proyek baru
 * 
 * @returns Komponen ProjectsList dengan data proyek dan tim
 */
export default async function ProjectsPage() {
  // Mengambil data tim dan proyek
  const teamsRes = await listTeamsService();
  const teams = teamsRes.ok ? teamsRes.data : [];

  const projectsRes = await listProjectsService();
  const projects = projectsRes.ok ? projectsRes.data : [];

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6 space-y-6">
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="mt-1 text-slate-400">Lihat semua proyek yang ada di sistem.</p>
          </div>
          <Link 
            href="/admin/projects/new" 
            className="inline-flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-sky-500 transition-all duration-300 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Project
          </Link>
        </div>
      </header>

      <section className="bg-slate-800/50 border border-slate-800 rounded-lg">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold">Daftar Projects</h3>
        </div>
        <div className="p-4">
          <ProjectsList projects={projects} teams={teams} />
        </div>
      </section>
    </main>
  );
}
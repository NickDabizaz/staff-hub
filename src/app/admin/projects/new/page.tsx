import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listTeamsService } from "@/app/admin/teams/services/teamService";
import CreateProjectForm from "../components/CreateProjectForm";
import Sidebar from "@/app/admin/components/Sidebar";
import Header from "@/app/admin/components/Header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Halaman untuk membuat proyek baru
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * Menyediakan form untuk menambahkan proyek baru dengan tim yang menangani
 * 
 * @returns Komponen CreateProjectForm dengan data tim
 */
export default async function NewProjectPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  // Memeriksa autentikasi pengguna
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

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
                <p className="mt-1 text-slate-400">Tambahkan proyek baru dengan tim yang menangani.</p>
              </div>
            </div>
          </header>

          <section className="bg-slate-800/50 border border-slate-800 rounded-lg">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Tambah Project Baru</h3>
                <Link 
                  href="/admin/projects"
                  className="inline-flex items-center justify-center bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-slate-500 transition-all duration-300 text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Link>
              </div>
            </div>
            <div className="p-4">
              <CreateProjectForm teams={teams} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
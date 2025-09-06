import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import { KanbanProvider } from "./components/kanban-context";
import { KanbanBoard } from "./components/kanban-board";
import Navbar from "@/components/Navbar";

/**
 * Halaman detail proyek untuk pengguna reguler
 * Menampilkan informasi proyek dan board Kanban untuk manajemen tugas
 * Hanya dapat diakses oleh pengguna yang telah login
 * 
 * @param params - Parameter URL yang berisi ID proyek
 * @returns Halaman detail proyek dengan board Kanban
 */
export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Menunggu params untuk mendapatkan id
  const { id } = await params;
  
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const currentUser = raw ? JSON.parse(raw) : null;

  // Memeriksa autentikasi pengguna
  if (!currentUser) {
    redirect("/login");
  }

  // Mengambil data proyek dari database berdasarkan ID
  const sb = supabaseServer();
  
  const { data: project, error } = await sb
    .from('projects')
    .select(`
      project_id,
      project_name,
      project_description,
      project_deadline
    `)
    .eq('project_id', id)
    .single();

  // Jika terjadi error atau proyek tidak ditemukan, tampilkan pesan error
  if (error || !project) {
    return (
      <>
        <Navbar user={currentUser} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Link href="/" className="inline-flex items-center text-sm text-sky-400 hover:text-sky-300 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">Project Tidak Ditemukan</h1>
            </div>
          </header>
          
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white/80">Project tidak ditemukan</h3>
            <p className="mt-2 text-white/60">Project dengan ID {id} tidak ditemukan.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <KanbanProvider>
      <>
        <Navbar user={currentUser} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Link href="/" className="inline-flex items-center text-sm text-sky-400 hover:text-sky-300 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">{project.project_name}</h1>
              <p className="mt-1 text-slate-400">{project.project_description || 'Tidak ada deskripsi'}</p>
            </div>
          </header>

          <KanbanBoard 
            projectId={project.project_id} 
            currentUser={currentUser} 
          />
        </main>
      </>
    </KanbanProvider>
  );
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import { KanbanProvider } from "./kanban-context";
import { KanbanBoard } from "./kanban-board";

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

  if (!currentUser) {
    redirect("/login");
  }

  // Ambil data project dari database berdasarkan ID
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

  if (error || !project) {
    return (
      <main className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-blue-400 hover:underline">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-semibold mt-2">Project Tidak Ditemukan</h1>
          </div>
          <nav className="space-x-3 text-sm">
            <a href="/logout" className="underline">
              Logout
            </a>
          </nav>
        </header>
        
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white/80">Project tidak ditemukan</h3>
          <p className="mt-2 text-white/60">Project dengan ID {id} tidak ditemukan.</p>
        </div>
      </main>
    );
  }

  return (
    <KanbanProvider>
      <main className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-blue-400 hover:underline">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-semibold mt-2">{project.project_name}</h1>
          </div>
          <nav className="space-x-3 text-sm">
            <a href="/logout" className="underline">
              Logout
            </a>
          </nav>
        </header>

        <section className="border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{project.project_name}</h2>
              <p className="mt-2 text-white/60">{project.project_description || 'Tidak ada deskripsi'}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-400">
              Active
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-white/60">Tanggal Deadline</h3>
              <p className="mt-1">{project.project_deadline || 'Tidak ditentukan'}</p>
            </div>
          </div>
        </section>

        <KanbanBoard 
          projectId={project.project_id} 
          currentUser={currentUser} 
        />
      </main>
    </KanbanProvider>
  );
}
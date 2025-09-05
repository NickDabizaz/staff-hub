import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import ProjectList from "@/components/user/ProjectList";

/**
 * Halaman dashboard utama untuk pengguna reguler
 * Menampilkan daftar proyek yang ditugaskan kepada pengguna yang sedang login
 * 
 * @returns Halaman dashboard dengan daftar proyek pengguna
 */
export default async function Dashboard() {
  // Memeriksa autentikasi pengguna
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const currentUser = raw ? JSON.parse(raw) : null;

  // Jika tidak ada pengguna yang login, arahkan ke halaman login
  if (!currentUser) {
    redirect("/login");
  }

  // Jika pengguna adalah admin, arahkan ke dashboard admin
  if (currentUser?.role === "ADMIN") {
    redirect("/admin");
  }

  // Mengambil data proyek dari database untuk pengguna yang sedang login
  const sb = supabaseServer();
  
  // Query untuk mendapatkan proyek yang terkait dengan pengguna
  // Kita perlu melakukan join beberapa tabel untuk mendapatkan proyek yang terkait:
  // 1. Mendapatkan team_id dari team_members berdasarkan user_id
  // 2. Mendapatkan project_id dari project_teams berdasarkan team_id
  // 3. Mendapatkan detail proyek dari projects berdasarkan project_id
  
  const { data: teamMembers, error: teamMembersError } = await sb
    .from('team_members')
    .select('team_id')
    .eq('user_id', currentUser.id);

  if (teamMembersError) {
    console.error('Error fetching team members:', teamMembersError);
  }

  const teamIds = teamMembers?.map(tm => tm.team_id) || [];
  
  if (teamIds.length > 0) {
    const { data: projectTeams, error: projectTeamsError } = await sb
      .from('project_teams')
      .select('project_id')
      .in('team_id', teamIds);

    if (projectTeamsError) {
      console.error('Error fetching project teams:', projectTeamsError);
    }

    const projectIds = projectTeams?.map(pt => pt.project_id) || [];
    
    if (projectIds.length > 0) {
      const { data: projects, error: projectsError } = await sb
        .from('projects')
        .select(`
          project_id,
          project_name,
          project_description,
          project_deadline
        `)
        .in('project_id', projectIds);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      // Memformat data proyek untuk komponen ProjectList
      const formattedProjects = projects?.map(project => ({
        id: project.project_id.toString(),
        title: project.project_name,
        description: project.project_description || 'Tidak ada deskripsi',
        status: 'Active' // Untuk sekarang kita set status sebagai Active
      })) || [];

      return (
        <main className="p-6 space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-sm text-white/60">Halo, {currentUser.name}</p>
            </div>
            <nav className="space-x-3 text-sm">
              <a href="/logout" className="underline">
                Logout
              </a>
            </nav>
          </header>

          <section>
            <h2 className="text-xl font-semibold mb-4">Daftar Project</h2>
            <ProjectList projects={formattedProjects} />
          </section>
        </main>
      );
    }
  }

  // Jika pengguna tidak memiliki proyek
  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-white/60">Halo, {currentUser.name}</p>
        </div>
        <nav className="space-x-3 text-sm">
          <a href="/logout" className="underline">
            Logout
          </a>
        </nav>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Daftar Project</h2>
        <ProjectList projects={[]} />
      </section>
    </main>
  );
}
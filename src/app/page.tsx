import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import ProjectList from "@/components/user/ProjectList";
import Navbar from "@/components/Navbar";

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
  
  let formattedProjects = [];
  
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
      // First, get project details
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

      // Then, get task counts for each project to calculate progress
      const { data: tasksData, error: tasksError } = await sb
        .from('tasks')
        .select(`
          project_id,
          task_status
        `)
        .in('project_id', projectIds);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Process projects with task data to calculate progress
      const projectTaskMap = tasksData?.reduce((acc: any, task: any) => {
        if (!acc[task.project_id]) {
          acc[task.project_id] = { total: 0, completed: 0 };
        }
        acc[task.project_id].total += 1;
        if (task.task_status === 'DONE') {
          acc[task.project_id].completed += 1;
        }
        return acc;
      }, {}) || {};

      // Memformat data proyek untuk komponen ProjectList
      formattedProjects = projects?.map((project: any) => {
        const taskStats = projectTaskMap[project.project_id] || { total: 0, completed: 0 };
        const progressPercentage = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
        
        return {
          id: project.project_id.toString(),
          title: project.project_name,
          description: project.project_description || 'Tidak ada deskripsi',
          status: 'Active', // Untuk sekarang kita set status sebagai Active
          deadline: project.project_deadline,
          progress: progressPercentage
        };
      }) || [];
    }
  }

  return (
    <>
      <Navbar user={currentUser} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Selamat Datang Kembali, {currentUser.name}!</h1>
          <p className="mt-1 text-slate-400">Berikut adalah daftar proyek yang sedang Anda kerjakan.</p>
        </header>

        {/* Projects Section */}
        <section>
          <ProjectList projects={formattedProjects} />
        </section>
      </main>
    </>
  );
}
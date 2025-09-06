import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { differenceInDays } from "date-fns";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatCard from "./components/StatCard";
import OverdueTasksSection from "./components/OverdueTasksSection";
import DueSoonTasksSection from "./components/DueSoonTasksSection";
import ProjectProgressSection from "./components/ProjectProgressSection";

/**
 * Interface untuk struktur data tugas terlambat
 * Mendefinisikan properti yang dimiliki setiap tugas terlambat
 */
interface OverdueTask {
  task_id: number;
  task_title: string;
  project_name: string;
  assignee_name: string | null;
  task_due_date: string;
  days_overdue: number;
}

/**
 * Interface untuk struktur data tugas yang akan jatuh tempo
 * Mendefinisikan properti yang dimiliki setiap tugas yang akan jatuh tempo
 */
interface DueSoonTask {
  task_id: number;
  task_title: string;
  project_name: string;
  assignee_name: string | null;
  task_due_date: string;
  days_until_due: number;
}

/**
 * Interface untuk struktur data progress proyek
 * Mendefinisikan properti yang dimiliki setiap proyek beserta progressnya
 */
interface ProjectProgress {
  project_id: number;
  project_name: string;
  project_deadline: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
}

/**
 * Halaman dashboard administrator yang menampilkan ringkasan aktivitas sistem
 * Menampilkan statistik proyek, tugas terlambat, dan tugas yang akan jatuh tempo
 * 
 * @returns Halaman dashboard admin dengan berbagai komponen statistik
 */
export default async function AdminDashboardPage() {
  // Memeriksa autentikasi pengguna - hanya admin yang dapat mengakses halaman ini
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const sb = supabaseServer();

  // Mengambil data tugas yang terlambat
  const { data: overdueTasks } = await sb
    .from("tasks")
    .select(`
      task_id,
      task_title,
      task_due_date,
      projects(project_name),
      users(user_name)
    `)
    .lt("task_due_date", new Date().toISOString())
    .neq("task_status", "DONE")
    .order("task_due_date", { ascending: true });

  // Mengubah format data tugas terlambat
  const transformedOverdueTasks: OverdueTask[] = (overdueTasks || []).map((task: any) => ({
    task_id: task.task_id,
    task_title: task.task_title,
    project_name: task.projects && task.projects.length > 0 ? task.projects[0].project_name : "Proyek tidak ditemukan",
    assignee_name: task.users?.user_name || "Tidak di-assign",
    task_due_date: task.task_due_date,
    days_overdue: Math.abs(differenceInDays(new Date(), new Date(task.task_due_date)))
  }));

  // Mengambil data tugas yang akan jatuh tempo dalam 7 hari
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  const { data: dueSoonTasks } = await sb
    .from("tasks")
    .select(`
      task_id,
      task_title,
      task_due_date,
      projects(project_name),
      users(user_name)
    `)
    .gte("task_due_date", new Date().toISOString())
    .lte("task_due_date", oneWeekFromNow.toISOString())
    .neq("task_status", "DONE")
    .order("task_due_date", { ascending: true });

  // Mengubah format data tugas yang akan jatuh tempo
  const transformedDueSoonTasks: DueSoonTask[] = (dueSoonTasks || []).map((task: any) => ({
    task_id: task.task_id,
    task_title: task.task_title,
    project_name: task.projects && task.projects.length > 0 ? task.projects[0].project_name : "Proyek tidak ditemukan",
    assignee_name: task.users?.user_name || "Tidak di-assign",
    task_due_date: task.task_due_date,
    days_until_due: differenceInDays(new Date(task.task_due_date), new Date())
  }));

  // Mengambil data progress proyek
  const { data: projects } = await sb
    .from("projects")
    .select(`
      project_id,
      project_name,
      project_deadline,
      tasks(task_id, task_status)
    `)
    .order("project_deadline", { ascending: true });

  // Mengubah format data progress proyek
  const transformedProjects: ProjectProgress[] = (projects || []).map((project: any) => {
    const totalTasks = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter((t: any) => t.task_status === "DONE").length || 0;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      project_id: project.project_id,
      project_name: project.project_name,
      project_deadline: project.project_deadline,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      progress_percentage: progressPercentage
    };
  });

  // Menghitung statistik ringkasan
  const totalProjects = projects?.length || 0;
  const totalTasks = projects?.reduce((sum: number, project: any) => sum + (project.tasks?.length || 0), 0) || 0;
  const overdueTasksCount = transformedOverdueTasks.length;
  const dueSoonTasksCount = transformedDueSoonTasks.length;

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Proyek" value={totalProjects || 0} />
            <StatCard title="Total Tugas" value={totalTasks || 0} />
            <StatCard title="Tugas Terlambat" value={overdueTasksCount || 0} isOverdue={true} />
            <StatCard title="Jatuh Tempo 7 Hari" value={dueSoonTasksCount || 0} />
          </div>

          {/* Tugas Terlambat */}
          <OverdueTasksSection tasks={transformedOverdueTasks} />

          {/* Tugas yang Akan Jatuh Tempo */}
          <DueSoonTasksSection tasks={transformedDueSoonTasks} />

          {/* Progress Proyek */}
          <ProjectProgressSection projects={transformedProjects} />
        </main>
      </div>
    </div>
  );
}
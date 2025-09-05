import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isFuture, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";

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
  const transformedOverdueTasks: OverdueTask[] = (overdueTasks || []).map(task => ({
    task_id: task.task_id,
    task_title: task.task_title,
    project_name: task.projects?.project_name || "Proyek tidak ditemukan",
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
  const transformedDueSoonTasks: DueSoonTask[] = (dueSoonTasks || []).map(task => ({
    task_id: task.task_id,
    task_title: task.task_title,
    project_name: task.projects?.project_name || "Proyek tidak ditemukan",
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
  const transformedProjects: ProjectProgress[] = (projects || []).map(project => {
    const totalTasks = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter(t => t.task_status === "DONE").length || 0;
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
  const totalTasks = projects?.reduce((sum, project) => sum + (project.tasks?.length || 0), 0) || 0;
  const overdueTasksCount = transformedOverdueTasks.length;
  const dueSoonTasksCount = transformedDueSoonTasks.length;

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
        <Link href="/admin" className="underline text-sm">
          Kembali
        </Link>
      </header>

      {/* Kartu Ringkasan Statistik */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Proyek</CardDescription>
            <CardTitle className="text-3xl">{totalProjects}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tugas</CardDescription>
            <CardTitle className="text-3xl">{totalTasks}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tugas Terlambat</CardDescription>
            <CardTitle className="text-3xl">{overdueTasksCount}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Jatuh Tempo 7 Hari</CardDescription>
            <CardTitle className="text-3xl">{dueSoonTasksCount}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      {/* Tugas Terlambat */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Tugas Terlambat</CardTitle>
            <CardDescription>Daftar tugas yang melewati tenggat waktu</CardDescription>
          </CardHeader>
          <CardContent>
            {transformedOverdueTasks.length > 0 ? (
              <div className="space-y-4">
                {transformedOverdueTasks.map(task => (
                  <div key={task.task_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{task.task_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.project_name} • {task.assignee_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {task.days_overdue} hari terlambat
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Jatuh tempo: {format(new Date(task.task_due_date), "dd MMM yyyy", { locale: id })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Tidak ada tugas terlambat</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Tugas yang Akan Jatuh Tempo */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Jatuh Tempo dalam 7 Hari</CardTitle>
            <CardDescription>Daftar tugas yang akan jatuh tempo dalam seminggu ke depan</CardDescription>
          </CardHeader>
          <CardContent>
            {transformedDueSoonTasks.length > 0 ? (
              <div className="space-y-4">
                {transformedDueSoonTasks.map(task => (
                  <div key={task.task_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{task.task_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.project_name} • {task.assignee_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={task.days_until_due <= 2 ? "destructive" : "default"}>
                        {task.days_until_due} hari lagi
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Jatuh tempo: {format(new Date(task.task_due_date), "dd MMM yyyy", { locale: id })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Tidak ada tugas yang akan jatuh tempo dalam 7 hari ke depan</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Progress Proyek */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Progress Proyek</CardTitle>
            <CardDescription>Persentase penyelesaian setiap proyek</CardDescription>
          </CardHeader>
          <CardContent>
            {transformedProjects.length > 0 ? (
              <div className="space-y-4">
                {transformedProjects.map(project => (
                  <div key={project.project_id} className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{project.project_name}</h3>
                      <span className="text-sm">{project.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          project.progress_percentage < 30 ? 'bg-red-500' : 
                          project.progress_percentage < 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${project.progress_percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {project.completed_tasks} dari {project.total_tasks} tugas selesai
                      </span>
                      <span>
                        Deadline: {format(new Date(project.project_deadline), "dd MMM yyyy", { locale: id })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Tidak ada proyek</p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
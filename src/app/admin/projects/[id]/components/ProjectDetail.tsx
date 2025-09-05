import Link from "next/link";
import type { ProjectWithTeams } from "@/app/admin/projects/types/projectTypes";
import type { TeamWithMembers } from "@/app/admin/teams/types/teamTypes";

/**
 * Komponen untuk menampilkan detail proyek
 * Menampilkan informasi lengkap tentang proyek termasuk deskripsi, deadline, dan tim yang menangani
 * 
 * @param project - Data proyek yang akan ditampilkan
 * @param teams - Daftar tim untuk referensi nama tim
 * @returns Komponen detail proyek dengan informasi lengkap
 */
export default function ProjectDetail({ 
  project, 
  teams 
}: { 
  project: ProjectWithTeams; 
  teams: TeamWithMembers[]; 
}) {
  /**
   * Fungsi utilitas untuk mendapatkan nama tim berdasarkan ID
   * 
   * @param teamId - ID tim yang dicari
   * @returns Nama tim atau placeholder jika tidak ditemukan
   */
  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.team_id === teamId);
    return team ? team.team_name : `Team #${teamId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{project.project_name}</h2>
        <Link 
          href={`/admin/projects/${project.project_id}/edit`}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
        >
          Edit Project
        </Link>
      </div>

      {project.project_description && (
        <div className="rounded-xl bg-white/5 p-4">
          <h3 className="font-medium mb-2">Deskripsi</h3>
          <p className="text-sm">{project.project_description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 p-4">
          <h3 className="font-medium mb-2">Deadline</h3>
          <p className="text-sm">
            {new Date(project.project_deadline).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-4">
          <h3 className="font-medium mb-2">Tim yang Menangani</h3>
          <div className="flex flex-wrap gap-2">
            {project.project_teams.length === 0 ? (
              <p className="text-sm text-neutral-400">Belum ada tim yang ditugaskan</p>
            ) : (
              project.project_teams.map((pt) => (
                <span 
                  key={pt.team_id} 
                  className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm"
                >
                  {getTeamName(pt.team_id)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
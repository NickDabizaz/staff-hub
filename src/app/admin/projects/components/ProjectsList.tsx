import Link from "next/link";
import type { ProjectWithTeams } from "../types/projectTypes";
import type { TeamWithMembers } from "@/app/admin/teams/types/teamTypes";

/**
 * Komponen untuk menampilkan daftar proyek dalam format tabel
 * Menampilkan informasi dasar setiap proyek seperti nama, deadline, dan tim yang menangani
 * 
 * @param projects - Daftar proyek yang akan ditampilkan
 * @param teams - Daftar tim untuk referensi nama tim
 * @returns Tabel daftar proyek atau pesan jika tidak ada proyek
 */
export default function ProjectsList({ 
  projects, 
  teams 
}: { 
  projects: ProjectWithTeams[]; 
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
    <div className="overflow-hidden rounded-xl border border-white/10">
      {projects.length === 0 ? (
        <div className="py-10 text-center text-neutral-400">
          Belum ada project.{' '}
          <Link href="/admin/projects/new" className="text-white underline">
            Tambah project pertama
          </Link>
          .
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <Th>Nama Project</Th>
              <Th>Deadline</Th>
              <Th>Tim</Th>
              <Th center>Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.project_id} className="border-t border-white/10">
                <Td>
                  <div className="font-medium">{project.project_name}</div>
                  {project.project_description && (
                    <div className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {project.project_description}
                    </div>
                  )}
                </Td>
                <Td>
                  <div>{new Date(project.project_deadline).toLocaleDateString('id-ID')}</div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {project.project_teams.length === 0 ? (
                      <span className="text-xs text-neutral-400">-</span>
                    ) : (
                      project.project_teams.map((pt) => (
                        <span 
                          key={pt.team_id} 
                          className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-xs"
                        >
                          {getTeamName(pt.team_id)}
                        </span>
                      ))
                    )}
                  </div>
                </Td>
                <Td center>
                  <Link 
                    href={`/admin/projects/${project.project_id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 text-sm"
                  >
                    Detail
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/**
 * Komponen sel header tabel
 * 
 * @param children - Konten yang akan ditampilkan di sel header
 * @param center - Apakah konten harus di tengah
 * @returns Elemen sel header tabel
 */
function Th({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <th className={`px-4 py-3 font-semibold text-left ${center ? "text-center" : ""}`}>
      {children}
    </th>
  );
}

/**
 * Komponen sel data tabel
 * 
 * @param children - Konten yang akan ditampilkan di sel data
 * @param center - Apakah konten harus di tengah
 * @returns Elemen sel data tabel
 */
function Td({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 align-middle ${center ? "text-center" : ""}`}
    >
      {children}
    </td>
  );
}
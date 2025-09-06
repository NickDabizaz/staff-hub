"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { deleteProjectAction } from "../actions";
import type { ProjectWithTeams } from "../types/projectTypes";
import type { TeamWithMembers } from "@/app/admin/teams/types/teamTypes";
import { Trash2 } from "lucide-react";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /**
   * Handler untuk menghapus proyek
   * Menampilkan konfirmasi dan menghapus proyek jika dikonfirmasi
   * 
   * @param projectId - ID proyek yang akan dihapus
   * @param projectName - Nama proyek yang akan dihapus (untuk menampilkan di konfirmasi)
   */
  const handleDeleteProject = async (projectId: number, projectName: string) => {
    const res = await Swal.fire({
      icon: "warning",
      title: `Hapus Project "${projectName}"?`,
      text: "Anda tidak akan dapat mengembalikan proyek ini!",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!res.isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("project_id", String(projectId));

      await deleteProjectAction(fd);

      await Swal.fire({
        icon: "success",
        title: "Project dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      // Menyegarkan halaman untuk menampilkan perubahan
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setError(msg);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      {projects.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          Belum ada project.{' '}
          <Link href="/admin/projects/new" className="text-sky-400 underline">
            Tambah project pertama
          </Link>
          .
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3">Nama Project</th>
              <th scope="col" className="px-6 py-3">Deadline</th>
              <th scope="col" className="px-6 py-3">Tim</th>
              <th scope="col" className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {projects.map((project) => (
              <tr key={project.project_id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{project.project_name}</div>
                  {project.project_description && (
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {project.project_description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>{new Date(project.project_deadline).toLocaleDateString('id-ID')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {project.project_teams.length === 0 ? (
                      <span className="text-xs text-slate-400">-</span>
                    ) : (
                      project.project_teams.map((pt) => (
                        <span 
                          key={pt.team_id} 
                          className="inline-flex items-center rounded-full bg-slate-700 text-slate-300 px-2 py-1 text-xs"
                        >
                          {getTeamName(pt.team_id)}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <Link 
                    href={`/admin/projects/${project.project_id}`}
                    className="font-medium text-sky-400 hover:text-sky-300"
                  >
                    Detail
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.project_id, project.project_name)}
                    disabled={loading}
                    className="font-medium text-red-500 hover:text-red-400"
                    title="Hapus Project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && <div className="text-sm text-red-400 p-4">{error}</div>}
    </div>
  );
}

/**
 * Komponen sel header tabel
 * 
 * @param children - Konten yang akan ditampilkan di sel header
 * @param center - Apakah konten harus di tengah
 * @param classNameOverride - Class CSS tambahan
 * @returns Elemen sel header tabel
 */
function Th({
  children,
  center,
  classNameOverride,
}: {
  children: React.ReactNode;
  center?: boolean;
  classNameOverride?: string;
}) {
  return (
    <th className={`${classNameOverride ?? "px-4 py-3 font-semibold"} ${center ? "text-center" : ""}`}>
      {children}
    </th>
  );
}

/**
 * Komponen sel data tabel
 * 
 * @param children - Konten yang akan ditampilkan di sel data
 * @param className - Class CSS tambahan
 * @param center - Apakah konten harus di tengah
 * @param colSpan - Jumlah kolom yang akan digabung
 * @returns Elemen sel data tabel
 */
function Td({
  children,
  className = "",
  center = false,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
  colSpan?: number;
}) {
  return (
    <td
      className={`px-4 py-3 align-middle ${center ? "text-center" : ""} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}
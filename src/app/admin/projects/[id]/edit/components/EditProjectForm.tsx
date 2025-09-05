"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import type { ProjectWithTeams } from "@/app/admin/projects/types/projectTypes";
import type { TeamWithMembers } from "@/app/admin/teams/types/teamTypes";
import { updateProjectAction } from "../../../actions";

/**
 * Komponen form untuk mengedit proyek yang sudah ada
 * Menyediakan field untuk memperbarui nama proyek, deskripsi, deadline, dan tim yang menangani
 * 
 * @param project - Data proyek yang akan diedit
 * @param teams - Daftar tim yang tersedia untuk ditugaskan ke proyek
 * @returns Form edit proyek dengan validasi dan submit handler
 */
export default function EditProjectForm({ 
  project,
  teams 
}: { 
  project: ProjectWithTeams;
  teams: TeamWithMembers[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState(project.project_name);
  const [description, setDescription] = useState(project.project_description || "");
  const [deadline, setDeadline] = useState<Date | undefined>(
    project.project_deadline ? parseISO(project.project_deadline) : undefined
  );
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>(
    project.project_teams.map(pt => pt.team_id)
  );

  /**
   * Handler untuk perubahan pemilihan tim
   * Menambahkan atau menghapus tim dari daftar tim yang ditugaskan
   * 
   * @param teamId - ID tim yang diubah pemilihannya
   * @param checked - Status pemilihan tim (dipilih atau tidak)
   */
  const handleTeamChange = (teamId: number, checked: boolean) => {
    if (checked) {
      setSelectedTeamIds(prev => [...prev, teamId]);
    } else {
      setSelectedTeamIds(prev => prev.filter(id => id !== teamId));
    }
  };

  /**
   * Handler untuk submit form edit proyek
   * Memvalidasi input dan mengirim data ke server untuk diperbarui
   * 
   * @param e - Event submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!name.trim()) {
      setError("Nama project wajib diisi");
      return;
    }
    
    if (!deadline) {
      setError("Deadline wajib diisi");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.set("project_id", project.project_id.toString());
      fd.set("project_name", name);
      fd.set("project_description", description);
      fd.set("project_deadline", format(deadline, "yyyy-MM-dd"));
      fd.set("team_ids", JSON.stringify(selectedTeamIds));

      await updateProjectAction(fd);

      await Swal.fire({
        icon: "success",
        title: "Project berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      // Reset form dan kembali ke halaman daftar proyek
      router.push("/admin/projects");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setError(msg);
      await Swal.fire({ icon: "error", title: "Gagal", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nama Project</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
          placeholder="Nama project"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
          placeholder="Deskripsi project"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Deadline</label>
        <DatePicker 
          date={deadline} 
          onDateChange={setDeadline} 
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tim yang Menangani</label>
        <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-white/10 rounded-xl bg-white/5">
          {teams.length === 0 ? (
            <p className="text-sm text-neutral-400">Belum ada tim yang bisa dipilih</p>
          ) : (
            teams.map((team) => (
              <div key={team.team_id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`team-${team.team_id}`}
                  checked={selectedTeamIds.includes(team.team_id)}
                  onChange={(e) => handleTeamChange(team.team_id, e.target.checked)}
                  className="mr-3 h-4 w-4 rounded border-white/10 bg-white/5 text-white focus:ring-white/30"
                />
                <label htmlFor={`team-${team.team_id}`} className="text-sm">
                  {team.team_name}
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold shadow hover:shadow-lg active:scale-[.98] disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  createTeamAction,
  addTeamMemberAction,
  removeTeamMemberAction,
} from "../actions";
import TeamDetailModal from "./TeamDetailModal";
import type { UserRow } from "@/app/admin/users/types/userTypes";
import type { TeamWithMembers, TeamMemberRow } from "../types/teamTypes";
import {
  Search,
  RefreshCw,
  Plus,
  ChevronDown,
  Shield,
  Users,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "@/app/admin/components/Sidebar";
import Header from "@/app/admin/components/Header";

/**
 * Komponen utama untuk antarmuka administrasi tim
 * Menyediakan fitur untuk menambah, mencari, dan mengelola tim beserta anggotanya
 * 
 * @param initialTeams - Data tim awal yang diteruskan dari server
 * @param initialUsers - Data pengguna awal yang diteruskan dari server
 * @returns Antarmuka pengelolaan tim dengan berbagai fitur
 */
export default function TeamsAdmin({
  initialTeams,
  initialUsers,
}: {
  initialTeams: TeamWithMembers[];
  initialUsers: UserRow[];
}) {
  const router = useRouter();

  // Manajemen state UI
  const [teams, setTeams] = useState<TeamWithMembers[]>(initialTeams);
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk pencarian
  const [query, setQuery] = useState("");

  // State form untuk membuat tim baru
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [pmId, setPmId] = useState<number | "">("");
  const [memberIds, setMemberIds] = useState<number[]>([]);

  // State untuk modal detail tim
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);

  // Memperbarui daftar tim dan pengguna ketika props berubah
  useEffect(() => {
    setTeams(initialTeams);
  }, [initialTeams]);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Memfilter pengguna untuk pemilihan PM dan anggota
  const pmOptions = useMemo(
    () => users.filter((u) => u.user_system_role === "PM"),
    [users]
  );
  const memberOptions = useMemo(() => users, [users]);

  /**
   * Membuka modal detail tim
   * 
   * @param team - Data tim yang akan ditampilkan detailnya
   */
  function openDetailModal(team: TeamWithMembers) {
    setSelectedTeam(team);
    setDetailModalOpen(true);
  }

  /**
   * Memperbarui tim dalam daftar setelah diedit
   * 
   * @param updatedTeam - Data tim yang telah diperbarui
   */
  async function updateTeamInList(updatedTeam: TeamWithMembers) {
    setTeams((prev) =>
      prev.map((t) => (t.team_id === updatedTeam.team_id ? updatedTeam : t))
    );
    // Menyegarkan data dari server untuk memastikan konsistensi
    router.refresh();
  }

  /**
   * Menghandle pengiriman form pembuatan tim
   * 
   * @param e - Event pengiriman form
   */
  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim() || !pmId) return;
    setLoading(true);
    setError(null);
    try {
      // Membuat objek payload
      const payload: any = {
        team_name: teamName.trim(),
        pm_user_id: String(pmId),
        member_user_ids: JSON.stringify(memberIds),
      };

      // Membuat FormData dari objek
      const fd = new FormData();
      for (const key in payload) {
        if (payload[key] !== undefined) {
          fd.append(key, payload[key]);
        }
      }

      const created = await createTeamAction(fd);

      setTeams((arr) => [...arr, created]);
      setTeamModalOpen(false);
      setTeamName("");
      setPmId("");
      setMemberIds([]);
      await Swal.fire({
        icon: "success",
        title: "Tim dibuat",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e: any) {
      setError(e?.message ?? "Gagal membuat tim");
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: String(e?.message || e),
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Menambahkan anggota ke tim
   * 
   * @param team_id - ID tim tujuan
   * @param user_id - ID pengguna yang akan ditambahkan
   */
  async function handleAddMember(team_id: number, user_id: number) {
    if (!user_id) return;
    setLoading(true);
    setError(null);
    try {
      // Membuat objek payload
      const payload: any = {
        team_id: String(team_id),
        user_id: String(user_id),
        role: "STAFF",
      };

      // Membuat FormData dari objek
      const fd = new FormData();
      for (const key in payload) {
        if (payload[key] !== undefined) {
          fd.append(key, payload[key]);
        }
      }

      const newMember: TeamMemberRow = await addTeamMemberAction(fd);
      setTeams((arr) =>
        arr.map((t) =>
          t.team_id === team_id
            ? { ...t, members: [...t.members, newMember] }
            : t
        )
      );
    } catch (e: any) {
      setError(e?.message ?? "Gagal tambah member");
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: String(e?.message || e),
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Menghapus anggota dari tim
   * 
   * @param team_id - ID tim asal
   * @param team_member_id - ID anggota tim yang akan dihapus
   */
  async function handleRemoveMember(team_id: number, team_member_id: number) {
    setLoading(true);
    setError(null);
    try {
      // Membuat objek payload
      const payload = { team_member_id: String(team_member_id) };

      // Membuat FormData dari objek
      const fd = new FormData();
      fd.append("team_member_id", payload.team_member_id);

      await removeTeamMemberAction(fd);
      setTeams((arr) =>
        arr.map((t) =>
          t.team_id === team_id
            ? {
                ...t,
                members: t.members.filter(
                  (m) => m.team_member_id !== team_member_id
                ),
              }
            : t
        )
      );
    } catch (e: any) {
      setError(e?.message ?? "Gagal hapus member");
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: String(e?.message || e),
      });
    } finally {
      setLoading(false);
    }
  }

  // Memfilter tim berdasarkan query pencarian
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      const matchQuery = q
        ? t.team_name.toLowerCase().includes(q) ||
          t.members.some(
            (m) =>
              m.user.user_name.toLowerCase().includes(q) ||
              m.user.user_email.toLowerCase().includes(q)
          )
        : true;
      return matchQuery;
    });
  }, [teams, query]);

  // ===== UI (Mengikuti desain referensi) =====
  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6 space-y-6">
          <header>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Teams</h1>
                <p className="mt-1 text-slate-400">Tambah, cari, dan kelola tim beserta anggotanya.</p>
              </div>
            </div>
          </header>

          {/* Controls and Team Table */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-lg">
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-slate-800">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama tim atau anggota..."
                  className="w-full text-sm pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                <button
                  onClick={() => router.refresh()}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 transition"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setTeamModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-sky-500 transition-all duration-300 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Team
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Team ID</th>
                    <th scope="col" className="px-6 py-3">Nama</th>
                    <th scope="col" className="px-6 py-3">Anggota</th>
                    <th scope="col" className="px-6 py-3">PM</th>
                    <th scope="col" className="px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                        Memuat…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                        Tidak ada data yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => {
                      const pms = t.members.filter(
                        (m) => m.team_member_role === "PM"
                      );
                      const pmName = pms[0]?.user?.user_name ?? "-";
                      return (
                        <tr key={t.team_id}>
                          <td className="px-6 py-4">{t.team_id}</td>
                          <td className="px-6 py-4 font-medium text-white">{t.team_name}</td>
                          <td className="px-6 py-4">{t.members.length}</td>
                          <td className="px-6 py-4">{pmName}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openDetailModal(t)}
                              className="font-medium text-sky-400 hover:text-sky-300"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </main>
      </div>

      {/* Create Team Modal */}
      {teamModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setTeamModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Buat Tim Baru</h2>
              <button 
                onClick={() => setTeamModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="team-name" className="block text-sm font-medium text-slate-300 mb-1">Nama Tim</label>
                  <input
                    type="text"
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Contoh: Squad Billing"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="project-manager" className="block text-sm font-medium text-slate-300 mb-1">Project Manager (PM)</label>
                  <select
                    id="project-manager"
                    value={pmId === "" ? "" : String(pmId)}
                    onChange={(e) =>
                      setPmId(e.target.value ? Number(e.target.value) : "")
                    }
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Pilih PM</option>
                    {pmOptions.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.user_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Anggota (Opsional)</label>
                  <div className="max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-md p-2 space-y-2">
                    {memberOptions
                      .filter(u => u.user_system_role !== "ADMIN" && u.user_id !== pmId)
                      .map((u) => (
                        <label 
                          key={u.user_id} 
                          className="flex items-center space-x-3 p-2 rounded hover:bg-slate-700/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={memberIds.includes(u.user_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMemberIds(prev => [...prev, u.user_id]);
                              } else {
                                setMemberIds(prev => prev.filter(id => id !== u.user_id));
                              }
                            }}
                            className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
                          />
                          <span className="text-sm">{u.user_name} ({u.user_email})</span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center p-4 bg-slate-800/50 border-t border-slate-800 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 bg-transparent rounded-md hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-500 transition disabled:opacity-50"
                >
                  {loading ? "Membuat..." : "Buat Tim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      {detailModalOpen && selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          users={users}
          onClose={() => setDetailModalOpen(false)}
          onUpdateTeam={updateTeamInList}
        />
      )}
    </div>
  );
}
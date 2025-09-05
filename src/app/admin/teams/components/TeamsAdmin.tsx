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
} from "lucide-react";

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

  // ===== UI (Glassy) =====
  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-neutral-100">
      {/* Heading */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-lg font-medium opacity-90">Kelola Teams</h2>
          <p className="text-sm opacity-60">
            Tambah, cari, dan kelola tim beserta anggotanya.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <section className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-6">
        <div className="flex-1">
          <div className="relative group">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama tim atau anggota"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-10 py-3 placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70 group-focus-within:opacity-100" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            <RefreshCw className="size-4" /> Refresh
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm"
            onClick={() => setTeamModalOpen(true)}
            disabled={loading}
          >
            <Plus className="size-4" /> Tambah Team
          </button>
        </div>
      </section>

      {/* Teams Section */}
      <section className="mt-6">
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <Th>Team ID</Th>
                <Th>Nama</Th>
                <Th center>Anggota</Th>
                <Th>PM</Th>
                <Th center>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-neutral-400"
                  >
                    Memuat…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-neutral-400"
                  >
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
                    <tr key={t.team_id} className="border-t border-white/10">
                      <Td className="w-16">{t.team_id}</Td>
                      <Td>
                        <div className="font-medium">{t.team_name}</div>
                      </Td>
                      <Td center>{t.members.length}</Td>
                      <Td>{pmName}</Td>
                      <Td center>
                        <button
                          onClick={() => openDetailModal(t)}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                        >
                          <Users className="size-4" />
                          Detail
                        </button>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

      {/* Create Team Modal */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Buat Tim</h3>
              <button
                className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/10"
                onClick={() => setTeamModalOpen(false)}
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <FloatingInput
                label="Nama Tim"
                value={teamName}
                onChange={setTeamName}
                placeholder="Contoh: Squad Billing"
                icon={<Shield className="size-4" />}
                required
              />

              {/* PM select */}
              <div>
                <span className="mb-1 block text-xs uppercase tracking-wider text-neutral-300">
                  Project Manager (PM)
                </span>
                <div className="relative">
                  <select
                    value={pmId === "" ? "" : String(pmId)}
                    onChange={(e) =>
                      setPmId(e.target.value ? Number(e.target.value) : "")
                    }
                    required
                    className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-3 pr-9 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="">Pilih PM</option>
                    {pmOptions.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.user_name} ({u.user_email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 opacity-70" />
                </div>
              </div>

              {/* Members multiselect */}
              <div>
                <span className="mb-1 block text-xs uppercase tracking-wider text-neutral-300">
                  Anggota (opsional)
                </span>
                <div className="relative">
                  <select
                    multiple
                    value={memberIds.map(String)}
                    onChange={(e) => {
                      const vals = Array.from(e.target.selectedOptions).map(
                        (o) => Number(o.value)
                      );
                      setMemberIds(vals);
                    }}
                    className="h-40 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {memberOptions.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.user_name} ({u.user_email})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  PM akan otomatis ditambahkan sebagai anggota (role PM).
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                  onClick={() => setTeamModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm"
                >
                  <Plus className="size-4" /> Buat Tim
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

/* ==== Small UI helpers ==== */

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
    <th
      className={`${classNameOverride ?? "px-4 py-3 font-semibold"} ${
        center ? "text-center" : ""
      }`}
    >
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
      className={`px-4 py-3 align-middle ${
        center ? "text-center" : ""
      } ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

/**
 * Komponen input floating dengan ikon
 * 
 * @param label - Label untuk input
 * @param value - Nilai input
 * @param onChange - Handler perubahan nilai
 * @param type - Tipe input (default: text)
 * @param placeholder - Placeholder input
 * @param icon - Ikon yang akan ditampilkan
 * @param className - Class CSS tambahan
 * @param disabled - Apakah input dinonaktifkan
 * @param required - Apakah input wajib diisi
 * @returns Elemen input floating
 */
function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
  className = "",
  disabled = false,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className={`relative block ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-3 placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60"
      />
      <span className="absolute left-3 -top-2 bg-neutral-950 px-1 text-[10px] uppercase tracking-wider text-neutral-300">
        {label}
      </span>
    </label>
  );
}

/**
 * Komponen untuk menampilkan anggota tim inline dengan fungsi tambah/hapus
 * 
 * @param team - Data tim
 * @param allUsers - Daftar semua pengguna
 * @param onAdd - Handler untuk menambah anggota
 * @param onRemove - Handler untuk menghapus anggota
 * @returns Elemen untuk menampilkan dan mengelola anggota tim
 */
function TeamMembersInline({
  team,
  allUsers,
  onAdd,
  onRemove,
}: {
  team: TeamWithMembers;
  allUsers: UserRow[];
  onAdd: (userId: number) => void;
  onRemove: (teamMemberId: number) => void;
}) {
  const [addingUserId, setAddingUserId] = useState<number | "">("");
  const candidates = allUsers.filter(
    (u) => !team.members.some((m) => m.user.user_id === u.user_id)
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {team.members.map((m) => (
          <span
            key={m.team_member_id}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs"
            title={m.user.user_email}
          >
            {m.user.user_name}
            {m.team_member_role === "PM" && (
              <span className="ml-1 rounded bg-amber-500/20 px-1 text-[10px] text-amber-300">
                PM
              </span>
            )}
            {m.team_member_role !== "PM" && (
              <button
                className="ml-1 rounded bg-red-500/10 px-1 text-[10px] text-red-300 hover:bg-red-500/20"
                onClick={() => onRemove(m.team_member_id)}
                title="Hapus"
              >
                x
              </button>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={addingUserId === "" ? "" : String(addingUserId)}
          onChange={(e) =>
            setAddingUserId(e.target.value ? Number(e.target.value) : "")
          }
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs"
        >
          <option value="">+ anggota</option>
          {candidates.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.user_name}
            </option>
          ))}
        </select>
        <button
          className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
          onClick={() => {
            if (addingUserId !== "") {
              onAdd(Number(addingUserId));
              setAddingUserId("");
            }
          }}
        >
          Tambah
        </button>
      </div>
    </div>
  );
}
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
import type { UserRow } from "@/app/admin/users/types/userTypes";
import type { TeamWithMembers, TeamMemberRow } from "../types/teamTypes";
import {
  Search,
  RefreshCw,
  Plus,
  UserPlus,
  Mail,
  KeyRound,
  ChevronDown,
  Edit2,
  Ban,
  ArrowLeft,
  Shield,
  Users,
} from "lucide-react";

export default function TeamsAdmin({
  initialTeams,
  initialUsers,
}: {
  initialTeams: TeamWithMembers[];
  initialUsers: UserRow[];
}) {
  const router = useRouter();

  // UI state
  const [teams, setTeams] = useState<TeamWithMembers[]>(initialTeams);
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [query, setQuery] = useState("");

  // form
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [pmId, setPmId] = useState<number | "">("");
  const [memberIds, setMemberIds] = useState<number[]>([]);

  useEffect(() => {
    setTeams(initialTeams);
  }, [initialTeams]);
  
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // ==== Teams handlers ====
  const pmOptions = useMemo(() => users.filter((u) => u.user_system_role === "PM"), [users]);
  const memberOptions = useMemo(() => users, [users]);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim() || !pmId) return;
    setLoading(true);
    setError(null);
    try {
      // Buat objek payload
      const payload: any = {
        team_name: teamName.trim(),
        pm_user_id: String(pmId),
        member_user_ids: JSON.stringify(memberIds)
      };
      
      // Buat FormData dari objek
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
      await Swal.fire({ icon: "success", title: "Tim dibuat", timer: 1200, showConfirmButton: false });
    } catch (e: any) {
      setError(e?.message ?? "Gagal membuat tim");
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(team_id: number, user_id: number) {
    if (!user_id) return;
    setLoading(true);
    setError(null);
    try {
      // Buat objek payload
      const payload: any = {
        team_id: String(team_id),
        user_id: String(user_id),
        role: "STAFF"
      };
      
      // Buat FormData dari objek
      const fd = new FormData();
      for (const key in payload) {
        if (payload[key] !== undefined) {
          fd.append(key, payload[key]);
        }
      }
      
      const newMember: TeamMemberRow = await addTeamMemberAction(fd);
      setTeams((arr) =>
        arr.map((t) => (t.team_id === team_id ? { ...t, members: [...t.members, newMember] } : t))
      );
    } catch (e: any) {
      setError(e?.message ?? "Gagal tambah member");
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(team_id: number, team_member_id: number) {
    setLoading(true);
    setError(null);
    try {
      // Buat objek payload
      const payload = { team_member_id: String(team_member_id) };
      
      // Buat FormData dari objek
      const fd = new FormData();
      fd.append("team_member_id", payload.team_member_id);
      
      await removeTeamMemberAction(fd);
      setTeams((arr) =>
        arr.map((t) =>
          t.team_id === team_id
            ? { ...t, members: t.members.filter((m) => m.team_member_id !== team_member_id) }
            : t
        )
      );
    } catch (e: any) {
      setError(e?.message ?? "Gagal hapus member");
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      const matchQuery = q
        ? t.team_name.toLowerCase().includes(q) ||
          t.members.some(m => 
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
                  const pms = t.members.filter((m) => m.team_member_role === "PM");
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
                        <TeamMembersInline
                          team={t}
                          allUsers={memberOptions}
                          onAdd={(uid) => handleAddMember(t.team_id, uid)}
                          onRemove={(mid) => handleRemoveMember(t.team_id, mid)}
                        />
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
                    onChange={(e) => setPmId(e.target.value ? Number(e.target.value) : "")}
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
                      const vals = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
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
                <p className="mt-1 text-xs text-neutral-400">PM akan otomatis ditambahkan sebagai anggota (role PM).</p>
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
    </div>
  );
}

/* ==== Small UI helpers ==== */

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
              <span className="ml-1 rounded bg-amber-500/20 px-1 text-[10px] text-amber-300">PM</span>
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
          onChange={(e) => setAddingUserId(e.target.value ? Number(e.target.value) : "")}
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
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "../actions";
import type { UserRow, Role } from "../types/userTypes";
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
} from "lucide-react";

type FormState = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "STAFF",
};

import type { TeamWithMembers, TeamMemberRow } from "@/app/admin/teams/types/teamTypes";
import { createTeamAction, addTeamMemberAction, removeTeamMemberAction } from "@/app/admin/teams/actions";

export default function UsersAdmin({
  initialUsers,
  initialTeams,
}: {
  initialUsers: UserRow[];
  initialTeams: TeamWithMembers[];
}) {
  const router = useRouter();

  // UI state
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");

  // form
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Teams state
  const [teams, setTeams] = useState<TeamWithMembers[]>(initialTeams);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [pmId, setPmId] = useState<number | "">("");
  const [memberIds, setMemberIds] = useState<number[]>([]);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);
  useEffect(() => {
    setTeams(initialTeams);
  }, [initialTeams]);

  function onFormChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  function startEdit(u: UserRow) {
    setEditingUser(u);
    setForm({
      name: u.user_name,
      email: u.user_email,
      password: "",
      role: u.user_system_role,
    });
  }

  function cancelEdit() {
    setEditingUser(null);
    setForm(emptyForm);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchQuery = q
        ? u.user_name.toLowerCase().includes(q) ||
          u.user_email.toLowerCase().includes(q)
        : true;
      const matchRole = roleFilter ? u.user_system_role === roleFilter : true;
      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.set("name", form.name);
      fd.set("email", form.email);
      fd.set("role", form.role);
      if (form.password) fd.set("password", form.password);

      if (editingUser) {
        fd.set("id", String(editingUser.user_id));
        await updateUserAction(fd);

        // Optimistic kecil
        setUsers((arr) =>
          arr.map((x) =>
            x.user_id === editingUser.user_id
              ? { ...x, user_name: form.name, user_system_role: form.role }
              : x
          )
        );

        await Swal.fire({
          icon: "success",
          title: "Tersimpan",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await createUserAction(fd);
        await Swal.fire({
          icon: "success",
          title: "User ditambahkan",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      cancelEdit();
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      setError(msg);
      await Swal.fire({ icon: "error", title: msg });
    } finally {
      setLoading(false);
    }
  }

  // ==== Teams handlers ====
  const pmOptions = useMemo(() => users.filter((u) => u.user_system_role === "PM"), [users]);
  const memberOptions = useMemo(() => users, [users]);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim() || !pmId) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("team_name", teamName.trim());
      fd.set("pm_user_id", String(pmId));
      fd.set("member_user_ids", JSON.stringify(memberIds));

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
      const fd = new FormData();
      fd.set("team_id", String(team_id));
      fd.set("user_id", String(user_id));
      fd.set("role", "STAFF");
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
      const fd = new FormData();
      fd.set("team_member_id", String(team_member_id));
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

  async function deactivateUser(u: UserRow) {
    const res = await Swal.fire({
      icon: "warning",
      title: `Nonaktifkan ${u.user_email}?`,
      showCancelButton: true,
      confirmButtonText: "Ya, nonaktifkan",
      cancelButtonText: "Batal",
    });
    if (!res.isConfirmed) return;

    try {
      const fd = new FormData();
      fd.set("id", String(u.user_id));
      await deleteUserAction(fd);

      // Optimistic kecil
      setUsers((arr) => arr.filter((x) => x.user_id !== u.user_id));
      await Swal.fire({
        icon: "success",
        title: "User dinonaktifkan",
        timer: 1000,
        showConfirmButton: false,
      });

      router.refresh();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: e instanceof Error ? e.message : "Gagal menonaktifkan user",
      });
    }
  }

  // ===== UI (Glassy) =====
  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-neutral-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition"
            >
              <ArrowLeft className="size-4" /> Kembali
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Heading */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-medium opacity-90">Kelola Users</h2>
            <p className="text-sm opacity-60">
              Tambah, cari, filter, dan kelola status user.
            </p>
          </div>
        </div>

        {/* Add / Edit User Card */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="size-5 opacity-80" />
            <h3 className="font-semibold">
              {editingUser ? "Edit User" : "Tambah User"}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-12">
            <FloatingInput
              className="md:col-span-3"
              icon={<UserPlus className="size-4" />}
              label="Nama"
              value={form.name}
              onChange={(v) => onFormChange("name", v)}
              placeholder="Nama"
            />
            <FloatingInput
              className="md:col-span-4"
              icon={<Mail className="size-4" />}
              type="email"
              label="Email"
              value={form.email}
              onChange={(v) => onFormChange("email", v)}
              placeholder="Email"
              disabled={!!editingUser}
            />
            <FloatingInput
              className="md:col-span-3"
              icon={<KeyRound className="size-4" />}
              type="password"
              label={editingUser ? "Password (opsional)" : "Password"}
              value={form.password}
              onChange={(v) => onFormChange("password", v)}
              placeholder="Password"
              required={!editingUser}
            />
            <RoleSelect
              className="md:col-span-2"
              value={form.role}
              onChange={(v) => onFormChange("role", v as Role)}
            />

            <div className="md:col-span-12 mt-2 flex items-center gap-3">
              {editingUser && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                  disabled={loading}
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold shadow hover:shadow-lg active:scale-[.98] disabled:opacity-60"
              >
                <Plus className="size-4" /> {editingUser ? "Update" : "Tambah"}
              </button>
              {loading && (
                <span className="text-xs opacity-70">Menyimpan…</span>
              )}
            </div>
          </form>
        </section>

        {/* Toolbar */}
        <section className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1">
            <div className="relative group">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau email"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-10 py-3 placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70 group-focus-within:opacity-100" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "")}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="">Semua Role</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PM">PM</option>
              <option value="STAFF">STAFF</option>
            </select>

            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              <RefreshCw className="size-4" /> Refresh
            </button>
          </div>
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-black/60 backdrop-blur">
                <tr className="text-left text-xs uppercase tracking-wider text-neutral-400">
                  <Th>#</Th>
                  <Th>Nama</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
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
                  filtered.map((u) => (
                    <tr
                      key={u.user_id}
                      className="border-t border-white/5 hover:bg-white/[0.03]"
                    >
                      <Td className="w-16">{u.user_id}</Td>
                      <Td>
                        <div className="font-medium">{u.user_name}</div>
                      </Td>
                      <Td className="max-w-[320px] truncate">{u.user_email}</Td>
                      <Td>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                          <Shield className="size-3" /> {u.user_system_role}
                        </span>
                      </Td>
                      <Td center>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEdit(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
                            disabled={loading}
                          >
                            <Edit2 className="size-4" /> Edit
                          </button>
                          <button
                            onClick={() => deactivateUser(u)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 border border-red-500/30 text-red-300/90 hover:bg-red-500/10"
                            disabled={loading}
                          >
                            <Ban className="size-4" /> Nonaktifkan
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Teams Section */}
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Teams</h2>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm"
              onClick={() => setTeamModalOpen(true)}
              disabled={loading}
            >
              <Plus className="size-4" /> Tambah Team
            </button>
          </div>

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
                {teams.length === 0 ? (
                  <tr>
                    <Td className="py-6 text-center text-neutral-400" colSpan={5}>
                      Belum ada tim
                    </Td>
                  </tr>
                ) : (
                  teams.map((t) => {
                    const pms = t.members.filter((m) => m.team_member_role === "PM");
                    const pmName = pms[0]?.user?.user_name ?? "-";
                    return (
                      <tr key={t.team_id} className="border-t border-white/10">
                        <Td className="w-16">{t.team_id}</Td>
                        <Td>
                          <div className="font-medium">
                            {/* Link ke detail (belum fungsional) */}
                            <Link href={`#`} className="underline decoration-dotted hover:decoration-solid">
                              {t.team_name}
                            </Link>
                          </div>
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
      </main>

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

function RoleSelect({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const roles = [
    { value: "STAFF", label: "STAFF" },
    { value: "PM", label: "PM" },
    { value: "ADMIN", label: "ADMIN" },
  ];
  return (
    <div className={`relative ${className}`}>
      <span className="absolute -top-2 left-3 bg-neutral-950 px-1 text-[10px] uppercase tracking-wider text-neutral-300">
        Role
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-3 pr-9 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 opacity-70" />
      </div>
    </div>
  );
}

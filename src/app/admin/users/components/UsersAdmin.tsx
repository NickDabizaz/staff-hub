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

/**
 * Interface untuk definisi state form pengguna
 * Mendefinisikan struktur data yang digunakan dalam form tambah/edit pengguna
 */
type FormState = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

/**
 * State awal untuk form kosong
 * Digunakan sebagai nilai default saat membuat form baru
 */
const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "STAFF",
};

/**
 * Komponen utama untuk antarmuka administrasi pengguna
 * Menyediakan fitur untuk menambah, mengedit, mencari, dan mengelola pengguna
 * 
 * @param initialUsers - Data pengguna awal yang diteruskan dari server
 * @returns Antarmuka pengelolaan pengguna dengan berbagai fitur
 */
export default function UsersAdmin({
  initialUsers,
}: {
  initialUsers: UserRow[];
}) {
  const router = useRouter();

  // Manajemen state UI
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk pencarian dan filter
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");

  // State form untuk menambah/mengedit pengguna
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Memperbarui daftar pengguna ketika props berubah
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  /**
   * Menghandle perubahan nilai field pada form
   * 
   * @param key - Nama field yang berubah
   * @param val - Nilai baru untuk field tersebut
   */
  function onFormChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  /**
   * Memulai proses edit pengguna
   * Mengisi form dengan data pengguna yang akan diedit
   * 
   * @param u - Data pengguna yang akan diedit
   */
  function startEdit(u: UserRow) {
    setEditingUser(u);
    // Menghapus domain staffhub.com jika ada saat mengedit
    const emailWithoutDomain = u.user_email.endsWith('@staffhub.com') 
      ? u.user_email.replace('@staffhub.com', '') 
      : u.user_email;
      
    setForm({
      name: u.user_name,
      email: emailWithoutDomain,
      password: "",
      role: u.user_system_role,
    });
  }

  /**
   * Membatalkan proses edit dan mereset form
   */
  function cancelEdit() {
    setEditingUser(null);
    setForm(emptyForm);
  }

  // Memfilter daftar pengguna berdasarkan query pencarian dan filter role
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

  /**
   * Menghandle pengiriman form untuk menambah/memperbarui pengguna
   * 
   * @param e - Event pengiriman form
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Membuat objek payload
      const payload: any = {};
      payload.name = form.name;
      
      // Untuk pengguna baru, menambahkan domain staffhub.com
      // Untuk edit pengguna, menggunakan email asli
      const email = editingUser ? form.email : `${form.email}@staffhub.com`;
      payload.email = email;
      
      payload.role = form.role;
      if (form.password) payload.password = form.password;

      // Membuat FormData dari objek
      const fd = new FormData();
      for (const key in payload) {
        if (payload[key] !== undefined) {
          fd.append(key, payload[key]);
        }
      }

      if (editingUser) {
        fd.append("id", String(editingUser.user_id));
        await updateUserAction(fd);

        // Update optimis
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

  /**
   * Menonaktifkan pengguna
   * 
   * @param u - Data pengguna yang akan dinonaktifkan
   */
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
      // Membuat objek payload
      const payload = { id: u.user_id };
      
      // Membuat FormData dari objek
      const fd = new FormData();
      fd.append("id", String(payload.id));
      
      await deleteUserAction(fd);

      // Update optimis
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
            <FloatingInputWithDomain
              className="md:col-span-4"
              icon={<Mail className="size-4" />}
              label="Email"
              value={form.email}
              onChange={(v) => onFormChange("email", v)}
              placeholder="username"
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

        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
      </main>
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
 * Komponen dropdown pemilihan role
 * 
 * @param value - Nilai role yang dipilih
 * @param onChange - Handler perubahan nilai
 * @param className - Class CSS tambahan
 * @returns Elemen dropdown pemilihan role
 */
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

/**
 * Komponen input floating dengan domain email
 * 
 * @param label - Label untuk input
 * @param value - Nilai input
 * @param onChange - Handler perubahan nilai
 * @param placeholder - Placeholder input
 * @param icon - Ikon yang akan ditampilkan
 * @param className - Class CSS tambahan
 * @param disabled - Apakah input dinonaktifkan
 * @returns Elemen input floating dengan domain email
 */
function FloatingInputWithDomain({
  label,
  value,
  onChange,
  placeholder,
  icon,
  className = "",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  // Menghapus domain staffhub.com jika ada saat menampilkan di input
  const displayValue = value.endsWith('@staffhub.com') 
    ? value.replace('@staffhub.com', '') 
    : value;

  return (
    <label className={`relative block ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
        {icon}
      </span>
      <div className="flex">
        <input
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-l-xl bg-white/5 border border-white/10 border-r-0 pl-9 pr-3 py-3 placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60"
        />
        <div className="flex items-center rounded-r-xl bg-white/5 border border-white/10 px-3 text-sm">
          @staffhub.com
        </div>
      </div>
      <span className="absolute left-3 -top-2 bg-neutral-950 px-1 text-[10px] uppercase tracking-wider text-neutral-300">
        {label}
      </span>
    </label>
  );
}
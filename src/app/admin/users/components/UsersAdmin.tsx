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
import Sidebar from "@/app/admin/components/Sidebar";
import Header from "@/app/admin/components/Header";

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
                <h1 className="text-3xl font-bold text-white">Users</h1>
                <p className="mt-1 text-slate-400">Tambah, cari, filter, dan kelola status user.</p>
              </div>
            </div>
          </header>

          {/* Add User Form */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-4">
              {editingUser ? "Edit User" : "Tambah User Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-1">
                <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1">Nama</label>
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={(e) => onFormChange("name", e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>
              <div className="lg:col-span-1">
                <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                <div className="flex">
                  <input
                    type="text"
                    id="email"
                    value={form.email}
                    onChange={(e) => onFormChange("email", e.target.value)}
                    placeholder="username"
                    disabled={!!editingUser}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                  <div className="flex items-center rounded-r-md bg-slate-800 border border-l-0 border-slate-700 px-3 text-sm">
                    @staffhub.com
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1">
                  {editingUser ? "Password (opsional)" : "Password"}
                </label>
                <input
                  type="password"
                  id="password"
                  value={form.password}
                  onChange={(e) => onFormChange("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  required={!editingUser}
                />
              </div>
              <div className="lg:col-span-1">
                <label htmlFor="role" className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => onFormChange("role", e.target.value as Role)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="PM">PM</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <div className="flex gap-2">
                  {editingUser && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 inline-flex items-center justify-center bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-slate-500 transition-all duration-300 text-sm"
                      disabled={loading}
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-sky-500 transition-all duration-300 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" /> {editingUser ? "Update" : "Tambah"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* User Table */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-lg">
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-slate-800">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama atau email..."
                  className="w-full text-sm pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as Role | "")}
                  className="w-full sm:w-auto text-sm px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Semua Role</option>
                  <option value="STAFF">STAFF</option>
                  <option value="PM">PM</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button
                  onClick={() => router.refresh()}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 transition"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">#</th>
                    <th scope="col" className="px-6 py-3">Nama</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Role</th>
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
                    filtered.map((u) => (
                      <tr key={u.user_id}>
                        <td className="px-6 py-4">{u.user_id}</td>
                        <td className="px-6 py-4 font-medium text-white">{u.user_name}</td>
                        <td className="px-6 py-4">{u.user_email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.user_system_role === "ADMIN" 
                              ? "bg-sky-500/10 text-sky-400" 
                              : u.user_system_role === "PM" 
                                ? "bg-indigo-500/10 text-indigo-400" 
                                : "bg-slate-500/10 text-slate-400"
                          }`}>
                            {u.user_system_role}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <button
                            onClick={() => startEdit(u)}
                            className="font-medium text-sky-400 hover:text-sky-300"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deactivateUser(u)}
                            className="font-medium text-red-500 hover:text-red-400"
                            disabled={loading}
                          >
                            Nonaktifkan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </main>
      </div>
    </div>
  );
}
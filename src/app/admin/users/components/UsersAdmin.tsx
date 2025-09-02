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

export default function UsersAdmin({
  initialUsers,
}: {
  initialUsers: UserRow[];
}) {
  const router = useRouter();

    // UI state
  const [users, setUsers]     = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

    // filters
  const [query, setQuery]           = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");

    // form
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

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

        // Optimistic kecil untuk UX; data final tetap di-refresh
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

      // Optimistic kecil untuk UX
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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kelola Users</h2>
        <Link href="/admin" className="text-sm underline">
          Kembali
        </Link>
      </div>

      {/* Form Create / Edit */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-3 border p-4 rounded"
      >
        <input
          name="name"
          placeholder="Nama"
          className="border rounded p-2"
          required
          value={form.name}
          onChange={(e) => onFormChange("name", e.target.value)}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border rounded p-2 disabled:bg-gray-100"
          required={!editingUser}
          disabled={!!editingUser}
          value={form.email}
          onChange={(e) => onFormChange("email", e.target.value)}
        />
        <input
          name="password"
          type="password"
          placeholder={editingUser ? "Password (opsional)" : "Password"}
          className="border rounded p-2"
          required={!editingUser}
          value={form.password}
          onChange={(e) => onFormChange("password", e.target.value)}
        />
        <select
          name="role"
          className="border rounded p-2"
          value={form.role}
          onChange={(e) => onFormChange("role", e.target.value as Role)}
        >
          <option value="STAFF">STAFF</option>
          <option value="PM">PM</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <div className="flex gap-2">
          {editingUser && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-300 text-black rounded p-2 w-full"
              disabled={loading}
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="bg-black text-white rounded p-2 w-full disabled:opacity-60"
            disabled={loading}
          >
            {editingUser ? "Update" : "Tambah"}
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          placeholder="Cari nama atau email"
          className="border rounded p-2 flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "")}
        >
          <option value="">Semua Role</option>
          <option value="STAFF">STAFF</option>
          <option value="PM">PM</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button
          onClick={() => router.refresh()}
          className="border rounded px-3"
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-3 text-center">
                  Memuat...
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((u) => (
                <tr key={u.user_id}>
                  <td className="p-2 border">{u.user_id}</td>
                  <td className="p-2 border">{u.user_name}</td>
                  <td className="p-2 border">{u.user_email}</td>
                  <td className="p-2 border">{u.user_system_role}</td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => startEdit(u)}
                      className="underline"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deactivateUser(u)}
                      className="underline text-red-600"
                      disabled={loading}
                    >
                      Nonaktifkan
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-3 text-center">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

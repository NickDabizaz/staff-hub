"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { createUserAction, deleteUserAction, updateUserAction } from "../actions";

export type UserRow = {
  user_id: number;
  user_name: string;
  user_email: string;
  user_system_role: "ADMIN" | "PM" | "STAFF";
};

export default function UsersAdmin({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("");

  // Note: after each server action, page revalidates and refreshes; local state is a fallback UX
  async function onCreateUser(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await createUserAction(formData);
      // Optimistic: append minimal row
      setUsers((u) => [
        ...u,
        {
          user_id: Math.max(0, ...u.map((x) => x.user_id)) + 1,
          user_name: String(formData.get("name") || ""),
          user_email: String(formData.get("email") || ""),
          user_system_role: String(formData.get("role") || "STAFF") as UserRow["user_system_role"],
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menambah user";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchQuery = query
        ? u.user_name.toLowerCase().includes(query.toLowerCase()) ||
          u.user_email.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchRole = role ? u.user_system_role === role : true;
      return matchQuery && matchRole;
    });
  }, [users, query, role]);

  async function updateUser(u: UserRow) {
    const { value: formValues, isConfirmed } = await Swal.fire<{ name: string; role: string}>({
      title: "Edit User",
      html: `
        <div style="display:flex; flex-direction:column; gap:8px; text-align:left">
          <label style="font-size:12px">Nama</label>
          <input id="swal-name" class="swal2-input" style="margin:0" value="${u.user_name.replaceAll("\"","&quot;")}">
          <label style="font-size:12px">Role</label>
          <select id="swal-role" class="swal2-select" style="margin:0">
            <option value="STAFF" ${u.user_system_role === "STAFF" ? "selected" : ""}>STAFF</option>
            <option value="PM" ${u.user_system_role === "PM" ? "selected" : ""}>PM</option>
            <option value="ADMIN" ${u.user_system_role === "ADMIN" ? "selected" : ""}>ADMIN</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const name = (document.getElementById("swal-name") as HTMLInputElement)?.value?.trim() || "";
        const role = (document.getElementById("swal-role") as HTMLSelectElement)?.value || "";
        if (!name) {
          Swal.showValidationMessage("Nama wajib diisi");
          return;
        }
        if (!["ADMIN","PM","STAFF"].includes(role)) {
          Swal.showValidationMessage("Role tidak valid");
          return;
        }
        return { name, role };
      },
    });

    if (!isConfirmed || !formValues) return;

    const fd = new FormData();
    fd.set("id", String(u.user_id));
    fd.set("name", formValues.name);
    fd.set("role", formValues.role);
    try {
      await updateUserAction(fd);
      setUsers((arr) => arr.map((x) => (x.user_id === u.user_id ? { ...x, user_name: formValues.name, user_system_role: formValues.role as UserRow["user_system_role"] } : x)));
      await Swal.fire({ icon: "success", title: "Tersimpan", timer: 1000, showConfirmButton: false });
    } catch {
      await Swal.fire({ icon: "error", title: "Gagal mengupdate user" });
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
    const fd = new FormData();
    fd.set("id", String(u.user_id));
    try {
      await deleteUserAction(fd);
      setUsers((arr) => arr.filter((x) => x.user_id !== u.user_id));
      await Swal.fire({ icon: "success", title: "User dinonaktifkan", timer: 1000, showConfirmButton: false });
    } catch {
      await Swal.fire({ icon: "error", title: "Gagal menonaktifkan user" });
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kelola Users</h2>
        <Link href="/admin" className="text-sm underline">Kembali</Link>
      </div>

  <form action={onCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-3 border p-4 rounded">
        <input name="name" placeholder="Nama" className="border rounded p-2" required />
        <input name="email" type="email" placeholder="Email" className="border rounded p-2" required />
        <input name="password" type="password" placeholder="Password" className="border rounded p-2" required />
        <select name="role" className="border rounded p-2">
          <option value="STAFF">STAFF</option>
          <option value="PM">PM</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button type="submit" className="bg-black text-white rounded p-2">Tambah</button>
      </form>

      <div className="flex gap-3">
        <input
          placeholder="Cari nama atau email"
          className="border rounded p-2 flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="border rounded p-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Semua Role</option>
          <option value="STAFF">STAFF</option>
          <option value="PM">PM</option>
          <option value="ADMIN">ADMIN</option>
        </select>
  <button onClick={() => window.location.reload()} className="border rounded px-3">Refresh</button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

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
                <td colSpan={5} className="p-3 text-center">Memuat...</td>
              </tr>
            ) : filtered.length ? (
              filtered.map((u) => (
                <tr key={u.user_id}>
                  <td className="p-2 border">{u.user_id}</td>
                  <td className="p-2 border">{u.user_name}</td>
                  <td className="p-2 border">{u.user_email}</td>
                  <td className="p-2 border">{u.user_system_role}</td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => updateUser(u)} className="underline">Edit</button>
                    <button onClick={() => deactivateUser(u)} className="underline text-red-600">Nonaktifkan</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-3 text-center">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

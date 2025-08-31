"use client";

import { useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Gagal login" }));
        setError(j.error || "Gagal login");
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 border p-6 rounded">
      <h1 className="text-xl font-semibold">Login</h1>

      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full border rounded p-2"
          placeholder="you@company.com"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Password</label>
        <input
          name="password"
          type="password"
          required
          className="w-full border rounded p-2"
          placeholder="••••••••"
        />
      </div>

  {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={loading} type="submit" className="w-full rounded bg-black text-white py-2 disabled:opacity-50">
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}

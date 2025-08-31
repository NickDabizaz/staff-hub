"use client";

import { loginAction } from "../actions";

export default function LoginForm() { 
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await loginAction({
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    });
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

  {/* Error akan ditampilkan via cookie sb_login_error jika diperlukan */}

  <button type="submit" className="w-full rounded bg-black text-white py-2">Masuk</button>
    </form>
  );
}

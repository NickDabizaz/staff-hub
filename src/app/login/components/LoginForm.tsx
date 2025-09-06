"use client";

import { useState } from "react";
import { loginAction } from "../actions";
import { Eye, EyeOff, LayoutDashboard } from "lucide-react";

/**
 * Komponen form login yang menangani input pengguna dan mengirimkan data ke server
 * Form ini memiliki field untuk email dan password dengan validasi dasar
 */
export default function LoginForm() { 
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Fungsi untuk menangani pengiriman form login
   * Mengekstrak data dari form dan mengirimkannya ke action login
   * 
   * @param e - Event pengiriman form
   */
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await loginAction({
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    });
  }

  return (
    <div className="w-full max-w-md z-10">
      {/* Card Container */}
      <div className="bg-slate-950/60 border border-slate-800 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transform transition-all duration-500 ease-out">
        
        {/* Header dengan Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
            <LayoutDashboard className="text-sky-400 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-50 mt-4">Staff Hub</h1>
          <p className="text-slate-400 mt-1">Masuk untuk melanjutkan ke dasbor Anda</p>
        </div>
  
        {/* Form Login */}
        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input 
              type="email" 
              id="email" 
              name="email"
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
              required
            />
          </div>
  
          {/* Input Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <a href="#" className="text-sm text-sky-400 hover:text-sky-300 hover:underline">Lupa Password?</a>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                name="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                required
              />
              {/* Tombol Show/Hide Password */}
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-sky-400 focus:outline-none" 
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Tombol Submit */}
          <button 
            type="submit"
            className="w-full bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300 disabled:opacity-50"
          >
            Masuk
          </button>
        </form>
      </div>
      <p className="text-center text-xs text-slate-600 mt-6">© 2025 Staff Hub. All rights reserved.</p>
    </div>
  );
}
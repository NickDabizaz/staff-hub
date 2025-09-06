"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown ketika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
      <div></div> {/* Spacer kosong untuk menjaga layout */}
      <div className="relative" ref={dropdownRef}>
        <button
          id="user-menu-button"
          type="button"
          className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="hidden sm:inline text-sm font-medium text-slate-300">Admin</span>
          <svg
            className="hidden sm:inline h-4 w-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {isDropdownOpen && (
          <div
            id="user-menu"
            className="absolute right-0 mt-2 w-48 origin-top-right bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 focus:outline-none"
          >
            <Link
              href="/login"
              className="block px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
            >
              Logout
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
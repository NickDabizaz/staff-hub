"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({ user }: { user: any }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
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

  const handleLogout = () => {
    // Redirect to logout endpoint
    router.push("/logout");
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M3 9h18"></path>
                <path d="M9 21V9"></path>
              </svg>
            </div>
            <Link href="/" className="text-xl font-bold text-slate-50">Staff Hub</Link>
          </div>
          
          {/* User Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button 
                id="user-menu-button" 
                type="button" 
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="hidden sm:inline text-sm font-medium text-slate-300">{user.name}</span>
                <svg className="hidden sm:inline h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  id="user-menu" 
                  className="absolute right-0 mt-2 w-48 origin-top-right bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 focus:outline-none"
                >
                  <Link href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Profil Anda</Link>
                  <Link href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Pengaturan</Link>
                  <div className="border-t border-slate-700 my-1"></div>
                  <Link href="/logout" className="block px-4 py-2 text-sm text-red-400 hover:bg-slate-700">Logout</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
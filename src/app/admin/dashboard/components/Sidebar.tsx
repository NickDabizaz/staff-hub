"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Users2, Folder, Settings } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Teams",
    href: "/admin/teams",
    icon: Users2,
  },
  {
    title: "Projects",
    href: "/admin/projects",
    icon: Folder,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="text-sky-500 w-7 h-7" />
          <span className="text-xl font-bold text-slate-50">Staff Hub</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-white bg-slate-800/50"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Navbar() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  return (
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              StaffHub
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {user?.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Admin Dashboard
                  </Link>
                </>
              )}
              {user?.role === "USER" && (
                <>
                  <Link
                    href="/user"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    My Projects
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm hidden md:inline">Hi, {user.name}</span>
                <Link
                  href="/logout"
                  className="text-sm rounded border px-3 py-1 hover:bg-gray-50"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm rounded border px-3 py-1 hover:bg-gray-50"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
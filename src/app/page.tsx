import { cookies } from "next/headers";

export default function Dashboard() {
  const raw = cookies().get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  return (
    <main className="p-6 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        {user && (
          <a
            href="/logout"
            className="text-sm rounded border px-3 py-1 hover:bg-gray-50"
          >
            Logout
          </a>
        )}
      </div>

      {user ? (
        <p>
          Halo, {user.name} ({user.role})
        </p>
      ) : (
        <p>
          Belum login.{" "}
          <a className="underline" href="/login">
            Login
          </a>
        </p>
      )}
    </main>
  );
}

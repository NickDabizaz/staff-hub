import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (user?.role === "ADMIN") {
    redirect("/admin");
  }

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

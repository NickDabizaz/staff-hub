import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listTeamsService } from "./services/teamService";
import { listUsersService } from "../users/services/userService";
import TeamsAdmin from "./components/TeamsAdmin";

/**
 * Halaman utama untuk manajemen tim
 * Hanya dapat diakses oleh pengguna dengan role ADMIN
 * 
 * @returns Komponen TeamsAdmin dengan data awal tim dan pengguna
 */
export default async function TeamsPage() {
  // Memeriksa autentikasi pengguna
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  // Jika tidak ada pengguna yang login, arahkan ke halaman login
  if (!user) redirect("/login");
  // Jika pengguna bukan admin, arahkan ke halaman utama
  if (user.role !== "ADMIN") redirect("/");

  // Mengambil data awal untuk tim dan pengguna
  const teamsRes = await listTeamsService();
  const teams = teamsRes.ok ? teamsRes.data : [];

  const usersRes = await listUsersService();
  const users = usersRes.ok ? usersRes.data : [];

  return (
    <TeamsAdmin initialTeams={teams} initialUsers={users || []} />
  );
}
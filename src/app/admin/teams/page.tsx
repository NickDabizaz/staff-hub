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
  // Mengambil data awal untuk tim dan pengguna
  const teamsRes = await listTeamsService();
  const teams = teamsRes.ok ? teamsRes.data : [];

  const usersRes = await listUsersService();
  const users = usersRes.ok ? usersRes.data : [];

  return (
    <TeamsAdmin initialTeams={teams} initialUsers={users || []} />
  );
}
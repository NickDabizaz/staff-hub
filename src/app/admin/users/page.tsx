import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import UsersAdmin from "@/app/admin/users/components/UsersAdmin"; // komponennya di-update jadi glassy
import { listTeamsService } from "@/app/admin/teams/services/teamService";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const sb = supabaseServer();
  const { data: users } = await sb
    .from("users")
    .select("user_id,user_name,user_email,user_system_role")
    .order("user_id", { ascending: true });

  const teamsRes = await listTeamsService();
  const teams = teamsRes.ok ? teamsRes.data : [];

  // Biarkan komponen yang handle header & layout glassy full-bleed
  return <UsersAdmin initialUsers={users ?? []} initialTeams={teams} />;
}

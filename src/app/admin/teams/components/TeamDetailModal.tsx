"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { UserRow } from "@/app/admin/users/types/userTypes";
import { TeamWithMembers } from "../types/teamTypes";
import { updateTeamPMAction, updateTeamMembersAction } from "../actions";
import {
  Search,
  X,
  User,
  Shield,
  Users,
  Save,
  Briefcase,
} from "lucide-react";

/**
 * Props untuk komponen modal detail tim
 */
interface TeamDetailModalProps {
  team: TeamWithMembers;
  users: UserRow[];
  onClose: () => void;
  onUpdateTeam: (updatedTeam: TeamWithMembers) => void;
}

/**
 * Komponen modal untuk melihat dan mengedit detail tim
 * Memungkinkan pemilihan PM dan pengelolaan anggota tim
 * 
 * @param team - Data tim yang akan ditampilkan detailnya
 * @param users - Daftar semua pengguna
 * @param onClose - Handler untuk menutup modal
 * @param onUpdateTeam - Handler untuk memperbarui data tim
 * @returns Modal detail tim dengan fungsi edit
 */
const TeamDetailModal = ({
  team,
  users,
  onClose,
  onUpdateTeam,
}: TeamDetailModalProps) => {
  // State untuk PM dan anggota tim
  const [selectedPMId, setSelectedPMId] = useState<number>(
    team.members.find((m) => m.team_member_role === "PM")?.user.user_id ||
      users.filter((u) => u.user_system_role === "PM")[0]?.user_id ||
      0
  );

  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>(
    team.members
      .filter((m) => m.team_member_role === "STAFF")
      .map((m) => m.user.user_id)
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // State untuk job roles
  const [jobRoles, setJobRoles] = useState<
    { job_role_id: number; job_role_name: string }[]
  >([]);
  const [memberJobRoles, setMemberJobRoles] = useState<
    Record<number, number[]>
  >({});

  // Memfilter pengguna berdasarkan query pencarian
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.user_name.toLowerCase().includes(query) ||
      user.user_email.toLowerCase().includes(query)
    );
  });

  // Menemukan PM saat ini
  const currentPM = team.members.find((m) => m.team_member_role === "PM");

  /**
   * Handler untuk menyimpan perubahan
   */
  const handleSave = async () => {
    if (!selectedPMId) {
      await Swal.fire({
        icon: "error",
        title: "PM harus dipilih",
        text: "Setiap tim harus memiliki seorang Project Manager",
      });
      return;
    }

    setSaving(true);
    try {
      // Membuat FormData untuk memperbarui PM
      const pmFormData = new FormData();
      pmFormData.append("team_id", String(team.team_id));
      pmFormData.append("pm_user_id", String(selectedPMId));

      // Memperbarui PM
      await updateTeamPMAction(pmFormData);

      // Membuat FormData untuk memperbarui anggota
      const membersFormData = new FormData();
      membersFormData.append("team_id", String(team.team_id));
      membersFormData.append(
        "member_user_ids",
        JSON.stringify(selectedMemberIds)
      );

      // Memperbarui anggota
      await updateTeamMembersAction(membersFormData);

      // Membuat objek tim yang diperbarui
      const pmUser = users.find((u) => u.user_id === selectedPMId);
      const memberUsers = users.filter((u) =>
        selectedMemberIds.includes(u.user_id)
      );

      const updatedTeam: TeamWithMembers = {
        ...team,
        members: [
          ...(pmUser
            ? [
                {
                  team_member_id: 0, // ID dummy, akan diperbarui oleh server
                  team_id: team.team_id,
                  team_member_role: "PM",
                  user: {
                    user_id: pmUser.user_id,
                    user_name: pmUser.user_name,
                    user_email: pmUser.user_email,
                    user_system_role: pmUser.user_system_role,
                  },
                },
              ]
            : []),
          ...memberUsers.map((user) => ({
            team_member_id: 0, // ID dummy, akan diperbarui oleh server
            team_id: team.team_id,
            team_member_role: "STAFF",
            user: {
              user_id: user.user_id,
              user_name: user.user_name,
              user_email: user.user_email,
              user_system_role: user.user_system_role,
            },
          })),
        ],
      };

      onUpdateTeam(updatedTeam);

      await Swal.fire({
        icon: "success",
        title: "Perubahan disimpan",
        timer: 1500,
        showConfirmButton: false,
      });

      onClose();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: error?.message || "Terjadi kesalahan saat menyimpan perubahan",
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handler untuk mengaktifkan/menonaktifkan seleksi anggota
   * 
   * @param userId - ID pengguna yang akan di-toggle
   */
  const toggleMember = (userId: number) => {
    // Mencegah PM ditambahkan sebagai anggota biasa
    if (userId === selectedPMId) return;

    // Memeriksa apakah pengguna sudah menjadi anggota
    const isCurrentlyMember = selectedMemberIds.includes(userId);

    setSelectedMemberIds((prev) => {
      const newSelected = isCurrentlyMember
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];

      return newSelected;
    });
  };

  /**
   * Handler untuk mengatur job roles anggota
   * 
   * @param userId - ID pengguna
   * @param jobRoleIds - Daftar ID job role yang akan diatur
   */
  const setMemberJobRolesHandler = async (
    userId: number,
    jobRoleIds: number[]
  ) => {
    try {
      // Menemukan team_member_id untuk pengguna ini
      const teamMember = team.members.find((m) => m.user.user_id === userId);

      // Mengimpor client supabase secara dinamis
      const { supabaseServer } = await import("@/lib/supabase-server");
      const sb = supabaseServer();

      // Memastikan kita memiliki team_member_id yang valid:
      // 1) jika ada di prop team -> pakai itu
      // 2) jika tidak ada, cek ke DB apakah sudah jadi member
      // 3) jika belum ada juga, barulah insert
      let actualTeamMemberId = teamMember?.team_member_id ?? 0;

      if (actualTeamMemberId === 0) {
        // Cek ke DB apakah sudah ada baris team_members untuk (team_id,user_id)
        const { data: existingMember, error: existingErr } = await sb
          .from("team_members")
          .select("team_member_id")
          .eq("team_id", team.team_id)
          .eq("user_id", userId)
          .maybeSingle();

        if (!existingErr && existingMember?.team_member_id) {
          actualTeamMemberId = existingMember.team_member_id;
        }
      }

      if (actualTeamMemberId === 0) {
        const { data: newMember, error: addError } = await sb
          .from("team_members")
          .insert({
            team_id: team.team_id,
            user_id: userId,
            team_member_role: "STAFF",
          })
          .select("team_member_id")
          .single();

        if (addError) throw new Error(addError.message);
        actualTeamMemberId = newMember.team_member_id;
      }

      // Menghapus semua job role yang ada untuk anggota tim ini
      const { error: deleteError } = await sb
        .from("team_member_roles")
        .delete()
        .eq("team_member_id", actualTeamMemberId);

      if (deleteError) throw new Error(deleteError.message);

      // Menambahkan job role baru jika ada
      if (jobRoleIds.length > 0) {
        const rows = jobRoleIds.map((job_role_id) => ({
          team_member_id: actualTeamMemberId,
          job_role_id,
        }));

        const { error: insertError } = await sb
          .from("team_member_roles")
          .insert(rows);

        if (insertError) throw new Error(insertError.message);
      }

      // Memperbarui state lokal secara langsung untuk UI yang responsif
      setMemberJobRoles((prev) => {
        const newMemberJobRoles = { ...prev };
        newMemberJobRoles[userId] = [...jobRoleIds]; // Membuat salinan baru untuk memastikan re-render
        return newMemberJobRoles;
      });
    } catch (error: any) {
      console.error("Failed to set member job roles:", error);
      await Swal.fire({
        icon: "error",
        title: "Gagal menyimpan job roles",
        text: error?.message || "Terjadi kesalahan saat menyimpan job roles",
      });
    }
  };

  // Mengambil job roles dengan caching
  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        // Memeriksa apakah kita sudah memiliki job roles di cache global
        const cachedJobRoles = sessionStorage.getItem("jobRoles");
        if (cachedJobRoles) {
          setJobRoles(JSON.parse(cachedJobRoles));
          return;
        }

        // Mengimpor client supabase secara dinamis
        const { supabaseServer } = await import("@/lib/supabase-server");
        const sb = supabaseServer();

        const { data, error } = await sb
          .from("job_roles")
          .select("job_role_id, job_role_name")
          .order("job_role_name");

        if (!error && data) {
          setJobRoles(data);
          // Menyimpan job roles di cache untuk penggunaan di masa depan
          sessionStorage.setItem("jobRoles", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to fetch job roles:", error);
      }
    };

    fetchJobRoles();
  }, []);

  // Mengambil job roles untuk anggota tim
  useEffect(() => {
    const fetchMemberJobRoles = async () => {
      try {
        // Mengimpor client supabase secara dinamis
        const { supabaseServer } = await import("@/lib/supabase-server");
        const sb = supabaseServer();

        // Mengambil job roles untuk setiap anggota tim
        const jobRolesMap: Record<number, number[]> = {};
        for (const member of team.members) {
          const { data, error } = await sb
            .from("team_member_roles")
            .select("job_role_id")
            .eq("team_member_id", member.team_member_id);

          if (!error && data) {
            jobRolesMap[member.user.user_id] = data.map(
              (item) => item.job_role_id
            );
          }
        }

        // Juga menambahkan anggota yang dipilih tetapi belum disimpan
        for (const userId of selectedMemberIds) {
          if (!(userId in jobRolesMap)) {
            jobRolesMap[userId] = [];
          }
        }

        setMemberJobRoles(jobRolesMap);
      } catch (error) {
        console.error("Failed to fetch member job roles:", error);
      }
    };

    fetchMemberJobRoles();
  }, [team, selectedMemberIds]);

  // Memperbarui state job roles ketika anggota yang dipilih berubah
  useEffect(() => {
    // Memastikan semua anggota yang dipilih memiliki entri dalam state job roles
    if (selectedMemberIds && Array.isArray(selectedMemberIds)) {
      const newState: Record<number, number[]> = { ...memberJobRoles };
      let hasChanges = false;

      selectedMemberIds.forEach((userId) => {
        if (!(userId in newState)) {
          newState[userId] = [];
          hasChanges = true;
        }
      });

      // Juga memastikan pengguna yang tidak lagi dipilih dihapus dari state
      Object.keys(newState).forEach((userIdStr) => {
        const userId = parseInt(userIdStr);
        if (
          !selectedMemberIds.includes(userId) &&
          team.members.some((m) => m.user.user_id === userId)
        ) {
          // Menghapus job roles untuk pengguna yang tidak lagi dipilih
          delete newState[userId];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setMemberJobRoles(newState);
      }
    }
  }, [selectedMemberIds, memberJobRoles, team.members]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-900 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Detail Tim: {team.team_name}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* PM Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              <h4 className="font-medium">Project Manager</h4>
            </div>
            
            <div className="space-y-2">
              {users
                .filter((u) => u.user_system_role === "PM")
                .map((user) => (
                  <label
                    key={user.user_id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      selectedPMId === user.user_id
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-slate-700 bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pm"
                      checked={selectedPMId === user.user_id}
                      onChange={() => setSelectedPMId(user.user_id)}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-medium text-white">{user.user_name}</div>
                      <div className="text-sm text-slate-400">
                        {user.user_email}
                      </div>
                    </div>
                    {currentPM?.user.user_id === user.user_id && (
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                        Saat Ini
                      </span>
                    )}
                  </label>
                ))}
            </div>
            
            {currentPM && selectedPMId !== currentPM.user.user_id && (
              <div className="mt-3 text-sm text-amber-400">
                * Perubahan PM akan diterapkan saat Anda menyimpan
              </div>
            )}
          </div>
          
          {/* Members Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <h4 className="font-medium">Anggota Tim</h4>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anggota..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            
            {/* Members List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers
                .filter(
                  (u) =>
                    u.user_system_role !== "ADMIN" && u.user_id !== selectedPMId
                ) // Mengecualikan pengguna ADMIN dan PM
                .map((user) => {
                  const isMember = selectedMemberIds.includes(user.user_id);
                  const isCurrentMember = team.members.some(
                    (m) =>
                      m.user.user_id === user.user_id &&
                      m.team_member_role === "STAFF"
                  );
                  
                  return (
                    <div
                      key={user.user_id}
                      className={`flex flex-col rounded-lg border p-3 ${
                        isMember
                          ? "border-slate-600 bg-slate-700"
                          : "border-slate-700 bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isMember}
                          onChange={() => toggleMember(user.user_id)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500"
                        />
                        <User className="h-5 w-5 text-slate-400" />
                        <div className="flex-1">
                          <div className="font-medium text-white">{user.user_name}</div>
                          <div className="text-sm text-slate-400">
                            {user.user_email}
                          </div>
                        </div>
                        <div className="text-xs rounded bg-slate-700 px-2 py-1">
                          {user.user_system_role}
                        </div>
                        {isCurrentMember && (
                          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                            Saat Ini
                          </span>
                        )}
                      </div>
                      
                      {isMember && (
                        <div className="mt-3 pl-7">
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium">Job Roles</span>
                          </div>
                          {jobRoles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {jobRoles.map((role) => {
                                // Memastikan userJobRoles didefinisikan untuk setiap pengguna
                                const userJobRoles =
                                  memberJobRoles[user.user_id] || [];
                                return (
                                  <label
                                    key={`${user.user_id}-${role.job_role_id}`}
                                    className="flex items-center gap-1 text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={userJobRoles.includes(
                                        role.job_role_id
                                      )}
                                      onChange={(e) => {
                                        const newJobRoles = e.target.checked
                                          ? [
                                              ...userJobRoles,
                                              role.job_role_id,
                                            ]
                                          : userJobRoles.filter(
                                              (id) => id !== role.job_role_id
                                            );
                                        setMemberJobRolesHandler(
                                          user.user_id,
                                          newJobRoles
                                        );
                                      }}
                                      className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500"
                                    />
                                    <span className="text-slate-300">{role.job_role_name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">
                              Memuat job roles...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-4 bg-slate-800/50 border-t border-slate-800 rounded-b-lg">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
            disabled={saving}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;
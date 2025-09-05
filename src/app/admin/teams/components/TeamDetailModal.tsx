"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { UserRow } from "@/app/admin/users/types/userTypes";
import { TeamWithMembers, TeamMemberRow } from "../types/teamTypes";
import { updateTeamPMAction, updateTeamMembersAction, getTeamMemberRolesAction, setTeamMemberRolesAction } from "../actions";
import { Search, X, User, Shield, Users, Save, Briefcase } from "lucide-react";

interface TeamDetailModalProps {
  team: TeamWithMembers;
  users: UserRow[];
  onClose: () => void;
  onUpdateTeam: (updatedTeam: TeamWithMembers) => void;
}

const TeamDetailModal = ({
  team,
  users,
  onClose,
  onUpdateTeam,
}: TeamDetailModalProps) => {
  // State untuk PM dan anggota
  const [selectedPMId, setSelectedPMId] = useState<number>(
    team.members.find((m) => m.team_member_role === "PM")?.user.user_id || 
    users.filter(u => u.user_system_role === "PM")[0]?.user_id || 0
  );
  
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>(
    team.members
      .filter((m) => m.team_member_role === "STAFF")
      .map((m) => m.user.user_id)
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  
  // State untuk job roles
  const [jobRoles, setJobRoles] = useState<{job_role_id: number, job_role_name: string}[]>([]);
  const [memberJobRoles, setMemberJobRoles] = useState<Record<number, number[]>>({});

  // Filter user berdasarkan query pencarian
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.user_name.toLowerCase().includes(query) ||
      user.user_email.toLowerCase().includes(query)
    );
  });

  // Cari PM saat ini
  const currentPM = team.members.find((m) => m.team_member_role === "PM");

  // Handler untuk menyimpan perubahan
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
      // Buat FormData untuk update PM
      const pmFormData = new FormData();
      pmFormData.append("team_id", String(team.team_id));
      pmFormData.append("pm_user_id", String(selectedPMId));
      
      // Update PM
      await updateTeamPMAction(pmFormData);

      // Buat FormData untuk update anggota
      const membersFormData = new FormData();
      membersFormData.append("team_id", String(team.team_id));
      membersFormData.append("member_user_ids", JSON.stringify(selectedMemberIds));
      
      // Update anggota
      await updateTeamMembersAction(membersFormData);

      // Buat objek team yang diperbarui
      const pmUser = users.find((u) => u.user_id === selectedPMId);
      const memberUsers = users.filter((u) => selectedMemberIds.includes(u.user_id));
      
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

  // Handler untuk toggle anggota
  const toggleMember = (userId: number) => {
    // Jangan biarkan PM ditambahkan sebagai anggota biasa
    if (userId === selectedPMId) return;
    
    console.log('Toggling member:', userId);
    
    // Periksa apakah user sudah menjadi anggota
    const isCurrentlyMember = selectedMemberIds.includes(userId);
    
    setSelectedMemberIds((prev) => {
      const newSelected = isCurrentlyMember
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      
      console.log('New selected members:', newSelected);
      return newSelected;
    });
  };

  // Handler untuk mengatur job roles anggota
  const setMemberJobRolesHandler = async (userId: number, jobRoleIds: number[]) => {
    try {
      console.log('Setting job roles for user:', userId, 'roles:', jobRoleIds);
      
      // Temukan team_member_id untuk user ini (dari prop team yang mungkin stale)
      let teamMember = team.members.find(m => m.user.user_id === userId);

      // Import supabase client dynamically
      const { supabaseServer } = await import('@/lib/supabase-server');
      const sb = supabaseServer();
      
      // Pastikan kita punya team_member_id yang valid:
      // 1) jika ada di prop team -> pakai itu
      // 2) jika tidak ada, cek ke DB apakah sudah jadi member
      // 3) jika belum ada juga, barulah insert
      let actualTeamMemberId = teamMember?.team_member_id ?? 0;

      if (actualTeamMemberId === 0) {
        // Cek ke DB apakah sudah ada baris team_members untuk (team_id,user_id)
        const { data: existingMember, error: existingErr } = await sb
          .from('team_members')
          .select('team_member_id')
          .eq('team_id', team.team_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingErr && existingMember?.team_member_id) {
          actualTeamMemberId = existingMember.team_member_id;
          console.log('Found existing team member ID:', actualTeamMemberId);
        }
      }

      if (actualTeamMemberId === 0) {
        console.log('Adding new team member for user:', userId);
        const { data: newMember, error: addError } = await sb
          .from('team_members')
          .insert({
            team_id: team.team_id,
            user_id: userId,
            team_member_role: 'STAFF'
          })
          .select('team_member_id')
          .single();

        if (addError) throw new Error(addError.message);
        actualTeamMemberId = newMember.team_member_id;
        console.log('New team member created with ID:', actualTeamMemberId);
      }
      
      // Hapus semua job role yang ada untuk team member ini
      console.log('Deleting existing job roles for team member:', actualTeamMemberId);
      const { error: deleteError } = await sb
        .from("team_member_roles")
        .delete()
        .eq("team_member_id", actualTeamMemberId);
      
      if (deleteError) throw new Error(deleteError.message);
      
      // Tambahkan job role baru jika ada
      if (jobRoleIds.length > 0) {
        console.log('Inserting new job roles:', jobRoleIds);
        const rows = jobRoleIds.map(job_role_id => ({
          team_member_id: actualTeamMemberId,
          job_role_id
        }));
        
        const { error: insertError } = await sb
          .from("team_member_roles")
          .insert(rows);
          
        if (insertError) throw new Error(insertError.message);
      }
      
      // Update state lokal secara langsung untuk UI yang responsif
      console.log('Updating local state for user:', userId);
      setMemberJobRoles(prev => {
        // Pastikan kita membuat objek baru untuk memicu re-render
        const newMemberJobRoles = { ...prev };
        newMemberJobRoles[userId] = [...jobRoleIds]; // Buat salinan baru untuk memastikan re-render
        console.log('Updated state:', newMemberJobRoles);
        return newMemberJobRoles;
      });
      
      console.log('Job roles successfully updated for user:', userId);
    } catch (error: any) {
      console.error('Failed to set member job roles:', error);
      await Swal.fire({
        icon: "error",
        title: "Gagal menyimpan job roles",
        text: error?.message || "Terjadi kesalahan saat menyimpan job roles",
      });
    }
  };

  // Fetch job roles with caching
  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        // Check if we already have job roles in a global cache
        const cachedJobRoles = sessionStorage.getItem('jobRoles');
        if (cachedJobRoles) {
          setJobRoles(JSON.parse(cachedJobRoles));
          return;
        }
        
        // Import supabase client dynamically
        const { supabaseServer } = await import('@/lib/supabase-server');
        const sb = supabaseServer();
        
        const { data, error } = await sb
          .from('job_roles')
          .select('job_role_id, job_role_name')
          .order('job_role_name');
          
        if (!error && data) {
          setJobRoles(data);
          // Cache the job roles for future use
          sessionStorage.setItem('jobRoles', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to fetch job roles:', error);
      }
    };

    fetchJobRoles();
  }, []);

  // Fetch job roles for team members
  useEffect(() => {
    const fetchMemberJobRoles = async () => {
      try {
        console.log('Fetching member job roles for team:', team.team_id);
        
        // Import supabase client dynamically
        const { supabaseServer } = await import('@/lib/supabase-server');
        const sb = supabaseServer();
        
        // Fetch job roles for each team member
        const jobRolesMap: Record<number, number[]> = {};
        for (const member of team.members) {
          const { data, error } = await sb
            .from("team_member_roles")
            .select("job_role_id")
            .eq("team_member_id", member.team_member_id);
            
          if (!error && data) {
            jobRolesMap[member.user.user_id] = data.map(item => item.job_role_id);
          }
        }
        
        // Tambahkan juga untuk selected members yang belum tersimpan
        for (const userId of selectedMemberIds) {
          if (!(userId in jobRolesMap)) {
            jobRolesMap[userId] = [];
          }
        }
        
        console.log('Fetched job roles map:', jobRolesMap);
        setMemberJobRoles(jobRolesMap);
      } catch (error) {
        console.error('Failed to fetch member job roles:', error);
      }
    };

    fetchMemberJobRoles();
  }, [team, selectedMemberIds]);

  // Update job roles state when selected members change
  useEffect(() => {
    // Pastikan semua selected members memiliki entry dalam state job roles
    if (selectedMemberIds && Array.isArray(selectedMemberIds)) {
      const newState: Record<number, number[]> = { ...memberJobRoles };
      let hasChanges = false;
      
      selectedMemberIds.forEach(userId => {
        if (!(userId in newState)) {
          newState[userId] = [];
          hasChanges = true;
        }
      });
      
      // Juga pastikan user yang tidak lagi dipilih dihapus dari state
      Object.keys(newState).forEach(userIdStr => {
        const userId = parseInt(userIdStr);
        if (!selectedMemberIds.includes(userId) && team.members.some(m => m.user.user_id === userId)) {
          // Hapus job roles untuk user yang tidak lagi dipilih
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-900 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Detail Tim: {team.team_name}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* PM Section */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="size-5 text-amber-400" />
            <h4 className="font-medium">Project Manager</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {users
              .filter((u) => u.user_system_role === "PM")
              .map((user) => (
                <label
                  key={user.user_id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    selectedPMId === user.user_id
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="pm"
                    checked={selectedPMId === user.user_id}
                    onChange={() => setSelectedPMId(user.user_id)}
                    className="size-4"
                  />
                  <div>
                    <div className="font-medium">{user.user_name}</div>
                    <div className="text-sm text-neutral-400">{user.user_email}</div>
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
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="size-5 text-blue-400" />
            <h4 className="font-medium">Anggota Tim</h4>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari anggota..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          
          {/* Members List */}
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {filteredUsers
              .filter((u) => u.user_system_role !== "ADMIN" && u.user_id !== selectedPMId) // Exclude ADMIN users and PM
              .map((user) => {
                const isMember = selectedMemberIds.includes(user.user_id);
                const isCurrentMember = team.members.some(
                  (m) => m.user.user_id === user.user_id && m.team_member_role === "STAFF"
                );
                
                return (
                  <div 
                    key={user.user_id}
                    className={`flex flex-col rounded-lg border p-3 ${
                      isMember
                        ? "border-white/20 bg-white/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isMember}
                        onChange={() => toggleMember(user.user_id)}
                        className="size-4"
                      />
                      <User className="size-5 text-neutral-400" />
                      <div className="flex-1">
                        <div className="font-medium">{user.user_name}</div>
                        <div className="text-sm text-neutral-400">{user.user_email}</div>
                      </div>
                      <div className="text-xs rounded bg-white/10 px-2 py-1">
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
                          <Briefcase className="size-4 text-neutral-400" />
                          <span className="text-sm font-medium">Job Roles</span>
                        </div>
                        {jobRoles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {jobRoles.map((role) => {
                              // Pastikan userJobRoles didefinisikan untuk setiap user
                              const userJobRoles = memberJobRoles[user.user_id] || [];
                              return (
                                <label 
                                  key={`${user.user_id}-${role.job_role_id}`} 
                                  className="flex items-center gap-1 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={userJobRoles.includes(role.job_role_id)}
                                    onChange={(e) => {
                                      const newJobRoles = e.target.checked
                                        ? [...userJobRoles, role.job_role_id]
                                        : userJobRoles.filter(id => id !== role.job_role_id);
                                      setMemberJobRolesHandler(user.user_id, newJobRoles);
                                    }}
                                    className="size-4"
                                  />
                                  <span>{role.job_role_name}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-400">Memuat job roles...</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10"
            disabled={saving}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 font-semibold hover:bg-white/90 disabled:opacity-70"
          >
            <Save className="size-4" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;

"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { UserRow } from "@/app/admin/users/types/userTypes";
import { TeamWithMembers, TeamMemberRow } from "../types/teamTypes";
import { updateTeamPMAction, updateTeamMembersAction } from "../actions";
import { Search, X, User, Shield, Users, Save } from "lucide-react";

interface TeamDetailModalProps {
  team: TeamWithMembers;
  users: UserRow[];
  onClose: () => void;
  onUpdateTeam: (updatedTeam: TeamWithMembers) => void;
}

export default function TeamDetailModal({
  team,
  users,
  onClose,
  onUpdateTeam,
}: TeamDetailModalProps) {
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
    
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

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
                  <label
                    key={user.user_id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      isMember
                        ? "border-white/20 bg-white/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
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
                  </label>
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
}
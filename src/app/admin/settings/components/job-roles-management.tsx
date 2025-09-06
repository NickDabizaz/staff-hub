"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseServer } from "@/lib/supabase-server";

interface JobRole {
  job_role_id: number;
  job_role_name: string;
}

export function JobRolesManagement() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [newJobRole, setNewJobRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobRoles();
  }, []);

  const getSupabaseClient = () => {
    // Create a new client instance for client-side usage
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error("Missing Supabase environment variables");
    }
    
    return supabaseServer();
  };

  const fetchJobRoles = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("job_roles")
        .select("job_role_id, job_role_name")
        .order("job_role_name");

      if (error) throw error;
      setJobRoles(data || []);
    } catch (err) {
      setError("Gagal memuat data job roles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJobRole = async () => {
    if (!newJobRole.trim()) return;

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("job_roles")
        .insert({ job_role_name: newJobRole.trim() })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setJobRoles([...jobRoles, data]);
        setNewJobRole("");
      }
    } catch (err) {
      setError("Gagal menambahkan job role");
      console.error(err);
    }
  };

  const handleDeleteJobRole = async (jobRoleId: number) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("job_roles")
        .delete()
        .eq("job_role_id", jobRoleId);

      if (error) throw error;

      setJobRoles(jobRoles.filter(role => role.job_role_id !== jobRoleId));
    } catch (err) {
      setError("Gagal menghapus job role");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Memuat data job roles...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newJobRole}
          onChange={(e) => setNewJobRole(e.target.value)}
          placeholder="Nama job role baru"
          onKeyDown={(e) => e.key === "Enter" && handleAddJobRole()}
          className="flex-grow px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
        />
        <Button 
          onClick={handleAddJobRole}
          className="inline-flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-500 transition-all text-sm"
        >
          Tambah
        </Button>
      </div>

      {jobRoles.length === 0 ? (
        <p className="text-slate-400 text-sm">Belum ada job roles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {jobRoles.map((role) => (
            <div 
              key={role.job_role_id} 
              className="flex items-center justify-between bg-slate-700/50 p-3 rounded-md"
            >
              <span className="font-medium text-sm text-white">{role.job_role_name}</span>
              <button
                onClick={() => handleDeleteJobRole(role.job_role_id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return <div>Memuat data job roles...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newJobRole}
          onChange={(e) => setNewJobRole(e.target.value)}
          placeholder="Nama job role baru"
          onKeyDown={(e) => e.key === "Enter" && handleAddJobRole()}
        />
        <Button onClick={handleAddJobRole}>Tambah</Button>
      </div>

      {jobRoles.length === 0 ? (
        <p className="text-gray-500">Belum ada job roles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobRoles.map((role) => (
            <Card key={role.job_role_id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{role.job_role_name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteJobRole(role.job_role_id)}
                  >
                    Hapus
                  </Button>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
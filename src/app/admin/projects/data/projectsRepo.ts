"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { Result, ok, err } from "@/lib/result";
import { ProjectWithTeams } from "../types/projectTypes";

export async function listProjectsRepo(): Promise<Result<ProjectWithTeams[]>> {
  const sb = supabaseServer();
  
  const { data, error } = await sb
    .from("projects")
    .select(
      `project_id,project_name,project_description,project_deadline,
       project_teams:project_teams(team_id)`
    )
    .order("project_id", { ascending: true });

  if (error) return err(error.message);
  return ok(data ?? []);
}

export async function getProjectRepo(projectId: number): Promise<Result<ProjectWithTeams>> {
  const sb = supabaseServer();
  
  const { data, error } = await sb
    .from("projects")
    .select(
      `project_id,project_name,project_description,project_deadline,
       project_teams:project_teams(team_id)`
    )
    .eq("project_id", projectId)
    .single();

  if (error) return err(error.message);
  return ok(data);
}

export async function createProjectRepo(input: {
  project_name: string;
  project_description?: string;
  project_deadline: string;
  team_ids: number[];
}): Promise<Result<ProjectWithTeams>> {
  const sb = supabaseServer();

  // 1) Create project
  const { data: projectCreated, error: projectErr } = await sb
    .from("projects")
    .insert({
      project_name: input.project_name,
      project_description: input.project_description,
      project_deadline: input.project_deadline,
    })
    .select("project_id")
    .single();
    
  if (projectErr || !projectCreated) return err(projectErr?.message ?? "Gagal buat project");

  const project_id = projectCreated.project_id as number;

  // 2) Insert project teams
  if (input.team_ids.length > 0) {
    const rows = input.team_ids.map((team_id) => ({
      project_id,
      team_id,
    }));
    
    const { error: teamErr } = await sb.from("project_teams").insert(rows);
    if (teamErr) return err(teamErr.message);
  }

  // 3) Read back project with teams
  const { data: projectWithTeams, error: fullErr } = await sb
    .from("projects")
    .select(
      `project_id,project_name,project_description,project_deadline,
       project_teams:project_teams(team_id)`
    )
    .eq("project_id", project_id)
    .single();
    
  if (fullErr || !projectWithTeams) return err(fullErr?.message ?? "Gagal baca project");

  return ok(projectWithTeams);
}

export async function updateProjectRepo(input: {
  project_id: number;
  project_name: string;
  project_description?: string;
  project_deadline: string;
  team_ids: number[];
}): Promise<Result<ProjectWithTeams>> {
  const sb = supabaseServer();

  // 1) Update project
  const { error: projectErr } = await sb
    .from("projects")
    .update({
      project_name: input.project_name,
      project_description: input.project_description,
      project_deadline: input.project_deadline,
    })
    .eq("project_id", input.project_id);
    
  if (projectErr) return err(projectErr.message);

  // 2) Delete existing project teams
  const { error: deleteErr } = await sb
    .from("project_teams")
    .delete()
    .eq("project_id", input.project_id);
    
  if (deleteErr) return err(deleteErr.message);

  // 3) Insert new project teams
  if (input.team_ids.length > 0) {
    const rows = input.team_ids.map((team_id) => ({
      project_id: input.project_id,
      team_id,
    }));
    
    const { error: teamErr } = await sb.from("project_teams").insert(rows);
    if (teamErr) return err(teamErr.message);
  }

  // 4) Read back project with teams
  const { data: projectWithTeams, error: fullErr } = await sb
    .from("projects")
    .select(
      `project_id,project_name,project_description,project_deadline,
       project_teams:project_teams(team_id)`
    )
    .eq("project_id", input.project_id)
    .single();
    
  if (fullErr || !projectWithTeams) return err(fullErr?.message ?? "Gagal baca project");

  return ok(projectWithTeams);
}
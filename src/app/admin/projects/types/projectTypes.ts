export type ProjectRow = {
  project_id: number;
  project_name: string;
  project_description: string | null;
  project_deadline: string; // format: YYYY-MM-DD
};

export type ProjectWithTeams = ProjectRow & {
  project_teams: {
    team_id: number;
  }[];
};

export type ProjectTeam = {
  project_team_id: number;
  project_id: number;
  team_id: number;
};
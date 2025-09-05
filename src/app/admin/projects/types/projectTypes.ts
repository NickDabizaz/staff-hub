/**
 * Tipe data untuk baris proyek di database
 * Mendefinisikan struktur data proyek dasar
 */
export type ProjectRow = {
  project_id: number;
  project_name: string;
  project_description: string | null;
  project_deadline: string; // format: YYYY-MM-DD
};

/**
 * Tipe data untuk proyek dengan tim yang menangani
 * Menggabungkan data proyek dasar dengan daftar tim
 */
export type ProjectWithTeams = ProjectRow & {
  project_teams: {
    team_id: number;
  }[];
};

/**
 * Tipe data untuk hubungan antara proyek dan tim
 * Mendefinisikan struktur data relasi many-to-many antara proyek dan tim
 */
export type ProjectTeam = {
  project_team_id: number;
  project_id: number;
  team_id: number;
};
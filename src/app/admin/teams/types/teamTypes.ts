import { Result } from "@/lib/result";

/**
 * Tipe data untuk role anggota tim
 * Mendefinisikan nilai-nilai yang valid untuk role anggota tim
 */
export type TeamMemberRole = "PM" | "STAFF";

/**
 * Interface untuk struktur data baris tim di database
 * Mendefinisikan properti-properti yang dimiliki setiap tim
 */
export type TeamRow = {
  team_id: number;
  team_name: string;
};

/**
 * Interface untuk struktur data pengguna anggota tim
 * Mendefinisikan properti-properti yang dimiliki setiap pengguna anggota tim
 */
export type TeamMemberUser = {
  user_id: number;
  user_name: string;
  user_email: string;
  user_system_role: "ADMIN" | "PM" | "STAFF";
};

/**
 * Interface untuk struktur data anggota tim di database
 * Mendefinisikan properti-properti yang dimiliki setiap anggota tim
 */
export type TeamMemberRow = {
  team_member_id: number;
  team_id: number;
  team_member_role: TeamMemberRole;
  user: TeamMemberUser;
};

/**
 * Interface untuk struktur data tim dengan anggotanya
 * Menggabungkan data tim dan daftar anggotanya
 */
export type TeamWithMembers = TeamRow & {
  members: TeamMemberRow[];
};
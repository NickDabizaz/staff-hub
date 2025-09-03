import { Result } from "@/lib/result";

export type TeamMemberRole = "PM" | "STAFF";

export type TeamRow = {
  team_id: number;
  team_name: string;
};

export type TeamMemberUser = {
  user_id: number;
  user_name: string;
  user_email: string;
  user_system_role: "ADMIN" | "PM" | "STAFF";
};

export type TeamMemberRow = {
  team_member_id: number;
  team_id: number;
  team_member_role: TeamMemberRole;
  user: TeamMemberUser;
};

export type TeamWithMembers = TeamRow & {
  members: TeamMemberRow[];
};


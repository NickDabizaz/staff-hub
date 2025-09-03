import { Result } from "@/lib/result";

export type Role = "ADMIN" | "PM" | "STAFF";

export type UserRow = {
  user_id         : number;
  user_name       : string;
  user_email      : string;
  user_system_role: Role;
};

export type SessionUser = {
  id   : number;
  name : string;
  email: string;
  role : Role;
};

export { ok, err } from "@/lib/result";
export type { Result, Ok, Err } from "@/lib/result";

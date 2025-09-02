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


export type Ok<T>     = { ok: true; data: T };
export type Err       = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err(message: string): Err {
  return { ok: false, error: message };
}

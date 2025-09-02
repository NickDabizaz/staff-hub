"use server";

import { cookies } from "next/headers";
import { SessionUser, Result, ok, err } from "../types/userTypes";
import {
  createUserRepo,
  deleteUserRepo,
  findUserByEmailRepo,
  listUsersRepo,
  updateUserRepo,
} from "../data/usersRepo";

function ensureAdmin(user: SessionUser | null): Result<null> {
  if (!user || user.role !== "ADMIN") return err("FORBIDDEN");
  return ok(null);
}

async function currentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

export async function listUsersService(): Promise<Result<unknown>> {
  const me = await currentUser();
  
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await listUsersRepo();
}

export async function createUserService(input: {
  name    : string;
  email   : string;
  password: string;
  role    : "ADMIN" | "PM" | "STAFF";
}): Promise<Result<null>> {
  const me = await currentUser();
  
  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  const existed = await findUserByEmailRepo(input.email);
  if (!existed.ok) return existed;
  if (existed.data) return err("Email sudah terdaftar");

  return await createUserRepo({
    name    : input.name,
    email   : input.email,
    password: input.password,  
    role    : input.role,
  });
}

export async function updateUserService(input: {
  id       : number;
  name    ?: string;
  role    ?: "ADMIN" | "PM" | "STAFF";
  password?: string;
}): Promise<Result<null>> {
  const me = await currentUser();

  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await updateUserRepo(input);
}

export async function deleteUserService(id: number): Promise<Result<null>> {
  const me = await currentUser();

  const auth = ensureAdmin(me);
  if (!auth.ok) return auth;

  return await deleteUserRepo(id);
}

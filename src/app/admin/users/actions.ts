"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

type SessionUser = { id: number; name: string; email: string; role: "ADMIN" | "PM" | "STAFF" };

function ensureAdmin(user: SessionUser | null) {
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
}

export async function createUserAction(formData: FormData) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const me: SessionUser | null = raw ? JSON.parse(raw) : null;
  ensureAdmin(me);

  const user_name = String(formData.get("name") || "").trim();
  const user_email = String(formData.get("email") || "").trim();
  const user_password = String(formData.get("password") || "").trim();
  const user_system_role = String(formData.get("role") || "STAFF");
  if (!user_name || !user_email || !user_password) return;

  const sb = supabaseServer();
  await sb.from("users").insert({
    user_name,
    user_email,
    user_password,
    user_system_role,
  });
  revalidatePath("/admin/users");
}

export async function updateUserAction(formData: FormData) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const me: SessionUser | null = raw ? JSON.parse(raw) : null;
  ensureAdmin(me);

  const id = Number(formData.get("id"));
  const user_name = String(formData.get("name") || "").trim();
  const user_system_role = String(formData.get("role") || "");
  if (!Number.isFinite(id)) return;

  const update: Record<string, unknown> = {};
  if (user_name) update.user_name = user_name;
  if (user_system_role) update.user_system_role = user_system_role;

  if (Object.keys(update).length === 0) return;
  const sb = supabaseServer();
  await sb.from("users").update(update).eq("user_id", id);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  const me: SessionUser | null = raw ? JSON.parse(raw) : null;
  ensureAdmin(me);

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  const sb = supabaseServer();
  await sb.from("users").delete().eq("user_id", id);
  revalidatePath("/admin/users");
}

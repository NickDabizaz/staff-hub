"use server";

import { redirect } from "next/navigation";
import { supabase } from "../lib/supabase";

export type LoginState = { error?: string };

// React 19 server action signature for useActionState
export async function loginAction(
  _prevState: LoginState,
  payload: { email: string; password: string }
): Promise<LoginState> {
  const { email, password } = payload;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" };
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("user_password")
    .eq("user_email", email)
    .single();

  if (error || !user || user.user_password !== password) {
    return { error: "Email atau password salah" };
  }

  // sukses → langsung redirect (tanpa session/cookie dulu)
  redirect("/");
  return {};
}

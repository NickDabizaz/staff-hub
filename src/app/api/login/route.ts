import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data: user, error } = await supabase
      .from("users")
      .select("user_id,user_name,user_email,user_password,user_system_role")
      .eq("user_email", email)
      .single();

    if (error || !user || user.user_password !== password) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(
      "sb_user",
      JSON.stringify({
        id: user.user_id,
        name: user.user_name,
        role: user.user_system_role,
        email: user.user_email,
      }),
      { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

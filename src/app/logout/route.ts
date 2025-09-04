import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set("sb_user", "", { path: "/", maxAge: 0 });
  redirect("/login");
}

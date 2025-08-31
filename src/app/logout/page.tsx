import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default function LogoutPage() {
  cookies().set("sb_user", "", { path: "/", maxAge: 0 });
  redirect("/login");
}

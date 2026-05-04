import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthEnabled,
  isValidAdminSession,
} from "@/lib/admin-auth";
import { cookies } from "next/headers";

export default async function AdminLoginPage() {
  if (!isAdminAuthEnabled()) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (isValidAdminSession(session)) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-4 text-zinc-950">
      <LoginForm />
    </main>
  );
}

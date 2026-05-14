import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginForm } from "@/components/admin/LoginForm";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthEnabled,
  isValidAdminSession,
} from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (!isAdminAuthEnabled()) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (isValidAdminSession(session)) {
    redirect("/admin");
  }

  return <LoginForm />;
}

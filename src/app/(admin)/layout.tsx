import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/Sidebar";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthEnabled,
  isValidAdminSession,
} from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isAdminAuthEnabled()) {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!isValidAdminSession(session)) {
      redirect("/admin/login");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 md:flex">
      <AdminSidebar />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}

import { UserManager } from "@/components/admin/UserManager";

export default function AdminUsersPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">User Management</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Approve, reject, or manage users who signed up for admin access.
        </p>
      </div>
      <UserManager />
    </div>
  );
}

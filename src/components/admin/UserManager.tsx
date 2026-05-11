"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Shield, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  user_role: string;
  status: string;
  created_at: string;
}

export function UserManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/users");
    if (response.ok) {
      const data = await response.json();
      setUsers(data.users ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function updateUser(id: string, updates: { status?: string; user_role?: string }) {
    setActionId(id);
    setMessage(null);

    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const payload = await response.json();

    setActionId(null);

    if (!response.ok) {
      setMessage(payload.error ?? "Action failed.");
      return;
    }

    setMessage(`User ${updates.status === "approved" ? "approved" : "updated"} successfully.`);
    fetchUsers();
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`Remove "${user.name}" permanently?`)) return;

    setActionId(user.id);
    setMessage(null);

    const response = await fetch(`/api/admin/users?id=${user.id}`, {
      method: "DELETE",
    });

    setActionId(null);

    if (!response.ok) {
      const payload = await response.json();
      setMessage(payload.error ?? "Could not remove user.");
      return;
    }

    setMessage("User removed.");
    fetchUsers();
  }

  const pending = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const rejected = users.filter((u) => u.status === "rejected");

  if (loading) {
    return <p className="p-6 text-sm text-zinc-500">Loading users...</p>;
  }

  return (
    <div className="grid gap-6">
      {message && (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {message}
        </p>
      )}

      {/* Pending Approvals */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-xs font-black text-amber-700">
            {pending.length}
          </span>
          Pending Approvals
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
            No pending requests.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
            {pending.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center gap-4 border-b border-zinc-100 p-4 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
                <span className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                  {user.user_role}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={actionId === user.id}
                    onClick={() => updateUser(user.id, { status: "approved" })}
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionId === user.id}
                    onClick={() => updateUser(user.id, { status: "rejected" })}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Users */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black">
          <Shield className="h-5 w-5 text-green-600" aria-hidden />
          Approved Users ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
            No approved users.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
            {approved.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center gap-4 border-b border-zinc-100 p-4 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                  {user.user_role}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionId === user.id}
                  onClick={() => deleteUser(user)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rejected */}
      {rejected.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-black text-zinc-500">
            Rejected ({rejected.length})
          </h2>
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
            {rejected.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center gap-4 border-b border-zinc-100 p-4 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-bold text-zinc-400 line-through">{user.name}</p>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionId === user.id}
                    onClick={() => updateUser(user.id, { status: "approved" })}
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    Re-approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionId === user.id}
                    onClick={() => deleteUser(user)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

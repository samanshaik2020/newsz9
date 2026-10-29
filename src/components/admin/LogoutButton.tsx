"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/store/use-confirm-store";

export function LogoutButton() {
  const router = useRouter();
  const confirmDialog = useConfirmStore((s) => s.open);

  async function handleLogout() {
    const confirmed = await confirmDialog({
      title: "Sign Out",
      message: "Sign out of the admin dashboard?",
      confirmLabel: "Sign Out",
      cancelLabel: "Stay Signed In",
      variant: "default",
    });
    if (!confirmed) return;

    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button className="text-zinc-900" onClick={handleLogout} size="sm" type="button" variant="outline">
      <LogOut aria-hidden="true" />
      Sign Out
    </Button>
  );
}


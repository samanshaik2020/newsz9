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
      title: "Log out",
      message: "Are you sure you want to log out of the admin dashboard?",
      confirmLabel: "Log out",
      cancelLabel: "Stay",
      variant: "default",
    });
    if (!confirmed) return;

    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button onClick={handleLogout} size="sm" type="button" variant="outline">
      <LogOut aria-hidden="true" />
      Logout
    </Button>
  );
}


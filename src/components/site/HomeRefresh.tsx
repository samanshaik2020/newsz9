"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

const refreshIntervalMs = 60_000;

export function HomeRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let lastRefresh = Date.now();
    const refresh = () => {
      if (document.visibilityState !== "visible" || isPending || Date.now() - lastRefresh < refreshIntervalMs) return;
      lastRefresh = Date.now();
      startTransition(() => router.refresh());
    };

    const timer = window.setInterval(refresh, refreshIntervalMs);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router, isPending, startTransition]);

  return null;
}

"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Wrong password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 py-12">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-700/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-900/40">
            <Shield className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">THE NEWSZ9</h1>
          <p className="mt-1 text-sm text-zinc-400">Admin Access</p>
        </div>

        {/* Card */}
        <form
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-sm"
          onSubmit={handleSubmit}
        >
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Password
            </span>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                autoFocus
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-red-500 focus:bg-zinc-800"
                placeholder="Enter admin password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPwd ? "Hide password" : "Show password"}
                className="absolute right-3 cursor-pointer text-zinc-500 transition-colors hover:text-zinc-200"
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && (
            <p
              className="mt-4 rounded-lg bg-red-900/40 px-4 py-2.5 text-sm font-medium text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            disabled={loading || !password}
            type="submit"
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying…
              </>
            ) : (
              "Enter Dashboard"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          newsz9 © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

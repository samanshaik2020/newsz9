"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, Eye, EyeOff, Lock, LogOut, Mail, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";

type Tab = "login" | "signup";

/* ------------------------------------------------------------------ */
/* Cookie helpers (client-side readable cookies only)                  */
/* ------------------------------------------------------------------ */

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function parseJsonCookie<T>(name: string): T | null {
  const raw = getCookie(name);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

/* ------------------------------------------------------------------ */
/* Input field                                                          */
/* ------------------------------------------------------------------ */

function Field({
  label, type = "text", placeholder, value, onChange, icon, suffix,
}: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ReactNode; suffix?: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-zinc-500">{icon}</span>
        <input
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-red-500 focus:bg-zinc-800"
          placeholder={placeholder} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="absolute right-3 text-zinc-500">{suffix}</span>}
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Already-logged-in banner                                             */
/* ------------------------------------------------------------------ */

function LoggedInBanner({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <div className="grid gap-5 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-500/20">
        <CheckCircle className="h-8 w-8 text-green-400" />
      </div>
      <div>
        <p className="text-lg font-bold text-white">Welcome back, {name}!</p>
        <p className="mt-1 text-sm text-zinc-400">You are signed in to the admin panel.</p>
      </div>
      <a
        href="/admin"
        className="flex h-11 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700"
      >
        Go to Dashboard →
      </a>
      <button
        type="button"
        onClick={onLogout}
        className="flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300"
      >
        <LogOut className="h-3.5 w-3.5" /> Sign out
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pending-approval banner                                              */
/* ------------------------------------------------------------------ */

function PendingBanner({ name }: { name: string }) {
  return (
    <div className="grid gap-5 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-yellow-500/20">
        <Clock className="h-8 w-8 text-yellow-400" />
      </div>
      <div>
        <p className="text-lg font-bold text-white">Hi {name}, you're on the list!</p>
        <p className="mt-1 text-sm text-zinc-400">Your sign-up request is pending approval. You'll get access once an admin approves your account.</p>
      </div>
      <div className="rounded-lg border border-yellow-800/50 bg-yellow-900/20 px-4 py-3 text-xs text-yellow-300">
        No action needed — we'll notify you when access is granted.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login panel                                                          */
/* ------------------------------------------------------------------ */

function LoginPanel({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const payload = (await res.json()) as { error?: string };

    setLoading(false);

    if (!res.ok) {
      setMessage(payload.error ?? "Login failed. Check your password.");
      return;
    }

    onSuccess("Admin");
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <Field
        label="Admin Password" type={showPwd ? "text" : "password"}
        placeholder="Enter admin password" value={password} onChange={setPassword}
        icon={<Lock className="h-4 w-4" />}
        suffix={
          <button type="button" tabIndex={-1} aria-label={showPwd ? "Hide" : "Show"}
            className="cursor-pointer hover:text-zinc-200 transition-colors"
            onClick={() => setShowPwd((v) => !v)}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      {message && (
        <p className="rounded-lg bg-red-900/40 px-4 py-2.5 text-sm font-medium text-red-400" role="alert">
          {message}
        </p>
      )}

      <button disabled={loading || !password} type="submit"
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Signing in…</>
        ) : "Sign in to Dashboard"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Sign-up panel                                                        */
/* ------------------------------------------------------------------ */

function SignUpPanel({ onPending }: { onPending: (name: string) => void }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setMessage({ text: "Passwords do not match.", ok: false }); return; }
    if (password.length < 8)  { setMessage({ text: "Password must be at least 8 characters.", ok: false }); return; }

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    }).catch(() => null);

    setLoading(false);

    if (!res || !res.ok) {
      const data = res ? (await res.json().catch(() => ({})) as { error?: string }) : {};
      setMessage({ text: data.error ?? "Sign-up failed. Please try again.", ok: false });
      return;
    }

    // Cookie is set by the server — reflect it in the UI
    onPending(name);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Field label="Full Name" placeholder="Your display name" value={name} onChange={setName}
        icon={<User className="h-4 w-4" />} />
      <Field label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail}
        icon={<Mail className="h-4 w-4" />} />
      <Field label="Password" type={showPwd ? "text" : "password"} placeholder="Min. 8 characters"
        value={password} onChange={setPassword} icon={<Lock className="h-4 w-4" />}
        suffix={
          <button type="button" tabIndex={-1} className="cursor-pointer hover:text-zinc-200 transition-colors"
            onClick={() => setShowPwd((v) => !v)}>
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />
      <Field label="Confirm Password" type={showPwd ? "text" : "password"} placeholder="Repeat password"
        value={confirm} onChange={setConfirm} icon={<Lock className="h-4 w-4" />} />

      {message && (
        <p role="alert" className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
          message.ok ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
        }`}>{message.text}</p>
      )}

      <button disabled={loading || !name || !email || !password || !confirm} type="submit"
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Requesting…</>
        ) : "Request Access"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Main export                                                          */
/* ------------------------------------------------------------------ */

type AuthState = "idle" | "loggedIn" | "pending";

export function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [userName, setUserName] = useState("");

  // Read cookies on mount to detect existing session
  useEffect(() => {
    const user = parseJsonCookie<{ name: string; email: string; role: string }>("newsz9_user");
    const pending = parseJsonCookie<{ name: string; status: string }>("newsz9_pending");

    if (user?.name) {
      setUserName(user.name);
      setAuthState("loggedIn");
    } else if (pending?.name) {
      setUserName(pending.name);
      setAuthState("pending");
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthState("idle");
    setUserName("");
    router.refresh();
  }

  function handleLoginSuccess(name: string) {
    setUserName(name);
    setAuthState("loggedIn");
    router.push("/admin");
    router.refresh();
  }

  function handlePending(name: string) {
    setUserName(name);
    setAuthState("pending");
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-700/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-red-900/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-900/40">
            <Shield className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">THE NEWSZ9</h1>
          <p className="mt-1 text-sm text-zinc-400">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-sm">
          {authState === "loggedIn" ? (
            <LoggedInBanner name={userName} onLogout={handleLogout} />
          ) : authState === "pending" ? (
            <PendingBanner name={userName} />
          ) : (
            <>
              {/* Tab switcher */}
              <div className="mb-8 flex rounded-xl bg-zinc-800/60 p-1">
                {(["login", "signup"] as Tab[]).map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)}
                    className={[
                      "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
                      tab === t ? "bg-white text-zinc-900 shadow" : "text-zinc-400 hover:text-zinc-200",
                    ].join(" ")}
                  >
                    {t === "login" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              {tab === "login"
                ? <LoginPanel onSuccess={handleLoginSuccess} />
                : <SignUpPanel onPending={handlePending} />
              }
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          newsz9 © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
}

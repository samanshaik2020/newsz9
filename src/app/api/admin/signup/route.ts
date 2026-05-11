import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { PENDING_COOKIE_NAME } from "@/lib/admin-auth";
import { maybeCreateServiceClient } from "@/lib/supabase";

function hashPassword(password: string) {
  // SHA-256 hash of the password (simple, no bcrypt dependency needed)
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const supabase = maybeCreateServiceClient();

  if (supabase) {
    // Check for duplicate email
    const { data: existing } = await supabase
      .from("admin_users")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      const msg =
        existing.status === "approved"
          ? "An account with this email already exists. Please sign in."
          : "A request with this email is already pending approval.";
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    // Insert pending user
    const { error } = await supabase.from("admin_users").insert({
      name,
      email,
      password_hash: hashPassword(password),
      status: "pending",
      user_role: "editor",
    });

    if (error) {
      console.error("[signup] DB error:", error);
      return NextResponse.json(
        { error: "Could not save your request. Please try again." },
        { status: 500 },
      );
    }
  }

  // Set a readable pending cookie so the UI shows the right state
  const response = NextResponse.json({
    ok: true,
    message: "Sign-up request submitted! An admin will approve your access.",
  });

  response.cookies.set(
    PENDING_COOKIE_NAME,
    JSON.stringify({ name, email, status: "pending" }),
    {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  return response;
}

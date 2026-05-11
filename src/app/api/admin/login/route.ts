import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  USER_COOKIE_NAME,
  attachUserCookie,
  createAdminSessionValue,
  isAdminAuthEnabled,
  secureCookieOptions,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminAuthEnabled()) {
    // No password configured — grant access and store a generic user cookie
    const response = NextResponse.json({ ok: true, adminAuthEnabled: false });
    attachUserCookie(response, { name: "Admin", email: "", role: "admin" });
    return response;
  }

  const body = (await request.json()) as { password?: string };

  if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid admin password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, adminAuthEnabled: true });

  // 1. Secure httpOnly session cookie (used by the server to verify auth)
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    ...secureCookieOptions(60 * 60 * 12),
  });

  // 2. Readable user-info cookie (used by the client UI to show the logged-in name)
  response.cookies.set(
    USER_COOKIE_NAME,
    JSON.stringify({ name: "Admin", email: "", role: "admin" }),
    {
      httpOnly: false,
      maxAge: 60 * 60 * 12,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  return response;
}

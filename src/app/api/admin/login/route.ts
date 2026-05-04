import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  isAdminAuthEnabled,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminAuthEnabled()) {
    return NextResponse.json({ ok: true, adminAuthEnabled: false });
  }

  const body = (await request.json()) as { password?: string };

  if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid admin password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, adminAuthEnabled: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

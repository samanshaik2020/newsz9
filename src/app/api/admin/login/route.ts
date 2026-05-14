import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  isAdminAuthEnabled,
  secureCookieOptions,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminAuthEnabled()) {
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json()) as { password?: string };

  if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Wrong password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    ...secureCookieOptions(60 * 60 * 24), // 24 hours
  });

  return response;
}

import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, secureCookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", secureCookieOptions(0));
  return response;
}

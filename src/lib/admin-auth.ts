import { createHmac, timingSafeEqual } from "crypto";
import type { NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME   = "newsz9_admin";
export const USER_COOKIE_NAME    = "newsz9_user";   // readable JSON: { name, email, role }
export const PENDING_COOKIE_NAME = "newsz9_pending"; // signup awaiting approval

// Shared secure cookie options
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: false, // USER_COOKIE readable by client JS
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function secureCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function isAdminAuthEnabled() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "newsz9-local-development-secret"
  );
}

export function createAdminSessionValue() {
  const password = process.env.ADMIN_PASSWORD ?? "";

  return createHmac("sha256", sessionSecret())
    .update(password)
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function isValidAdminSession(value?: string | null) {
  if (!isAdminAuthEnabled()) return true;
  if (!value) return false;

  return safeEqual(value, createAdminSessionValue());
}

export function getCookieValue(header: string | null, name: string) {
  if (!header) return null;

  const cookies = header.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function isAdminRequest(request: Request) {
  return isValidAdminSession(
    getCookieValue(request.headers.get("cookie"), ADMIN_COOKIE_NAME),
  );
}

/** Attach the readable user-info cookie to any NextResponse. */
export function attachUserCookie(
  response: ReturnType<typeof NextResponse.json>,
  user: { name: string; email: string; role: string },
) {
  response.cookies.set(
    USER_COOKIE_NAME,
    JSON.stringify(user),
    cookieOptions(60 * 60 * 12), // 12 h
  );
}

/** Clear all auth cookies (used by logout). */
export function clearAuthCookies(response: ReturnType<typeof NextResponse.json>) {
  const expired = secureCookieOptions(0);
  response.cookies.set(ADMIN_COOKIE_NAME, "", expired);
  response.cookies.set(USER_COOKIE_NAME, "", { ...expired, httpOnly: false });
  response.cookies.set(PENDING_COOKIE_NAME, "", { ...expired, httpOnly: false });
}

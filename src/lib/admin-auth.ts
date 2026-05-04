import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "newsz9_admin";

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

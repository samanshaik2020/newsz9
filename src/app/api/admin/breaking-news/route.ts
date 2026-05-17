import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";
import { clearBreakingNewsCaches } from "@/lib/cache";
import { getAdminBreakingNews } from "@/lib/data";
import { sendPushNotification } from "@/lib/onesignal";
import type { BreakingNewsFormInput } from "@/types";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const items = await getAdminBreakingNews();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const body = (await request.json()) as Partial<BreakingNewsFormInput>;
  const headline = body.headline?.trim() ?? "";

  if (!headline) {
    return NextResponse.json(
      { error: "Headline is required." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("breaking_news")
    .insert({
      headline,
      url: body.url?.trim() || null,
      is_active: body.is_active ?? true,
      expires_at: body.expires_at || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Send push notification for active breaking news
  if (data && (body.is_active ?? true)) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com";
    sendPushNotification({
      title: "BREAKING NEWS",
      message: headline,
      url: body.url?.trim() || siteUrl,
    }).catch(() => {});
  }

  await clearBreakingNewsCaches();

  return NextResponse.json({ item: data }, { status: 201 });
}

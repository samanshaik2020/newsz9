import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";
import { clearBreakingNewsCaches } from "@/lib/cache";
import type { BreakingNewsFormInput } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const { id } = await params;
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
    .update({
      headline,
      url: body.url?.trim() || null,
      is_active: body.is_active ?? true,
      expires_at: body.expires_at || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await clearBreakingNewsCaches();

  return NextResponse.json({ item: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const { id } = await params;
  const { error } = await supabase.from("breaking_news").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await clearBreakingNewsCaches();

  return NextResponse.json({ deleted: true });
}

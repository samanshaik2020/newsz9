import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ tags: data ?? [] });
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const body = (await request.json()) as { name?: string; slug?: string };

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "Tag name is required." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("tags")
    .upsert(
      { name: body.name.trim(), slug: body.slug ?? body.name.trim().toLowerCase().replace(/\s+/g, "-") },
      { onConflict: "slug" },
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ tag: data }, { status: 201 });
}

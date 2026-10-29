import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";
import { clearArticleCaches } from "@/lib/cache";
import { saveEditorialArticle } from "@/lib/publish-article";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request); if (denied) return denied;
  const { supabase, response } = requireServiceClient(); if (!supabase) return response;
  const { data, error } = await supabase.from("articles").select("*,categories(*),authors!articles_author_id_fkey(*)").eq("id", (await params).id).maybeSingle();
  return error || !data ? NextResponse.json({ error: "Article not found." }, { status: 404 }) : NextResponse.json({ article: data });
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request); if (denied) return denied;
  const { supabase, response } = requireServiceClient(); if (!supabase) return response;
  return saveEditorialArticle(supabase, request, (await params).id);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request); if (denied) return denied;
  const { supabase, response } = requireServiceClient(); if (!supabase) return response;
  const { id } = await params;
  const { data: existing } = await supabase.from("articles").select("slug").eq("id", id).maybeSingle();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Could not delete the article." }, { status: 400 });
  await clearArticleCaches({ slug: existing?.slug });
  return NextResponse.json({ deleted: true });
}

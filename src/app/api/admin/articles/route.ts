import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";
import { getAdminArticles } from "@/lib/data";
import { saveEditorialArticle } from "@/lib/publish-article";
export async function GET(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  return NextResponse.json({ articles: await getAdminArticles(200) });
}
export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  const { supabase, response } = requireServiceClient(); if (!supabase) return response;
  return saveEditorialArticle(supabase, request);
}

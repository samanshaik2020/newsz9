import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";
import { clearCategoryCaches } from "@/lib/cache";
import { slugify } from "@/lib/utils";
import type { CategoryFormInput, Language } from "@/types";

const languages = new Set(["en", "te"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const { id } = await params;
  const body = (await request.json()) as Partial<CategoryFormInput>;
  const name = body.name?.trim() ?? "";
  const slug = body.slug ? slugify(body.slug) : slugify(name);
  const language = languages.has(body.language ?? "")
    ? (body.language as Language)
    : "en";

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Category name and slug are required." },
      { status: 400 },
    );
  }

  const { data: existing } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      language,
      description: body.description?.trim() || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await clearCategoryCaches(slug, existing?.slug);

  return NextResponse.json({ category: data });
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
  const { data: existing } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await clearCategoryCaches(existing?.slug);

  return NextResponse.json({ deleted: true });
}

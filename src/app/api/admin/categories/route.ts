import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";
import { clearCategoryCaches } from "@/lib/cache";
import { getCategories } from "@/lib/data";
import { slugify } from "@/lib/utils";
import type { CategoryFormInput, Language } from "@/types";

const languages = new Set(["en", "te"]);

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const categories = await getCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

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

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      language,
      description: body.description?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await clearCategoryCaches(slug);

  return NextResponse.json({ category: data }, { status: 201 });
}

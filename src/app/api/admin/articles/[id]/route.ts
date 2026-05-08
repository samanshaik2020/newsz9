import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";
import { clearCache } from "@/lib/cache";
import { getImageSrc, normalizeArticleContent, slugify } from "@/lib/utils";
import type {
  ArticleFormInput,
  ArticleStatus,
  ArticleTemplate,
  Language,
} from "@/types";

const articleSelect = "*, categories(*), authors(*)";
const templates = new Set(["template_1", "template_2", "template_3", "template_4"]);
const statuses = new Set(["draft", "review", "published", "archived"]);
const languages = new Set(["en", "te"]);

function normalizeArticlePayload(body: Partial<ArticleFormInput>) {
  const status = statuses.has(body.status ?? "")
    ? (body.status as ArticleStatus)
    : "draft";

  return {
    title: body.title?.trim() ?? "",
    slug: body.slug ? slugify(body.slug) : slugify(body.title ?? ""),
    summary: body.summary?.trim() || null,
    content: normalizeArticleContent(body.content ?? ""),
    cover_image: getImageSrc(body.cover_image),
    category_id: body.category_id || null,
    source_url: body.source_url?.trim() || null,
    language: languages.has(body.language ?? "")
      ? (body.language as Language)
      : "en",
    template: templates.has(body.template ?? "")
      ? (body.template as ArticleTemplate)
      : "template_1",
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const { id } = await params;
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  return NextResponse.json({ article: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const { id } = await params;
  const body = (await request.json()) as Partial<ArticleFormInput> & {
    tag_ids?: string[];
    author_id?: string | null;
  };
  const payload = normalizeArticlePayload(body);

  if (!payload.title || !payload.slug || !payload.content) {
    return NextResponse.json(
      { error: "Title, slug, and content are required." },
      { status: 400 },
    );
  }

  // Include author_id in update if provided
  const updatePayload = {
    ...payload,
    ...(body.author_id !== undefined ? { author_id: body.author_id || null } : {}),
  };

  const { data, error } = await supabase
    .from("articles")
    .update(updatePayload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Sync article tags
  if (body.tag_ids !== undefined) {
    await supabase.from("article_tags").delete().eq("article_id", id);
    if (body.tag_ids.length > 0) {
      const tagRows = body.tag_ids.map((tagId) => ({
        article_id: id,
        tag_id: tagId,
      }));
      await supabase.from("article_tags").insert(tagRows);
    }
  }

  // Clear Redis caches when an article is updated
  const keysToInvalidate = [
    "homepage:articles:12",
    "homepage:articles:20",
    "trending:articles:5",
  ];
  if (payload.slug) {
    keysToInvalidate.push(`article:${payload.slug}`);
  }
  await clearCache(...keysToInvalidate);

  return NextResponse.json({ article: data });
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

  // Fetch the article first so we can clear its specific cache key
  const { data: existing } = await supabase
    .from("articles")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Clear Redis caches after deletion
  const keysToInvalidate = [
    "homepage:articles:12",
    "homepage:articles:20",
    "trending:articles:5",
  ];
  if (existing?.slug) {
    keysToInvalidate.push(`article:${existing.slug}`);
  }
  await clearCache(...keysToInvalidate);

  return NextResponse.json({ deleted: true });
}

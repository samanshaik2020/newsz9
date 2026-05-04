import { NextResponse } from "next/server";
import { maybeCreateServiceClient } from "@/lib/supabase";
import { getImageSrc, normalizeArticleContent, slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = maybeCreateServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const secret = process.env.SCRAPER_WEBHOOK_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "SCRAPER_WEBHOOK_SECRET is required in production." },
      { status: 503 },
    );
  }

  if (secret && request.headers.get("x-scraper-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    summary?: string;
    content?: string;
    source_url?: string;
    cover_image?: string;
    language?: "en" | "te";
  };

  if (!body.title || !body.content) {
    return NextResponse.json(
      { error: "title and content are required." },
      { status: 400 },
    );
  }

  if (body.source_url) {
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("source_url", body.source_url)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ skipped: true, reason: "duplicate_source" });
    }
  }

  const { data: botAuthor } = await supabase
    .from("authors")
    .select("id")
    .eq("email", "bot@newsz9.com")
    .maybeSingle();

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: body.title,
      slug: slugify(body.title),
      summary: body.summary ?? null,
      content: normalizeArticleContent(body.content),
      source_url: body.source_url ?? null,
      cover_image: getImageSrc(body.cover_image),
      language: body.language ?? "en",
      template: "template_1",
      status: "review",
      author_id: botAuthor?.id ?? null,
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ article: data }, { status: 201 });
}

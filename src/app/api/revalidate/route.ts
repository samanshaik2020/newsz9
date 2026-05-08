import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { clearCache } from "@/lib/cache";

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    path?: string;
    slug?: string;
    categorySlug?: string;
  };

  const path = body.path ?? "/";
  revalidatePath(path);

  // Clear Redis caches so readers see fresh content
  const keysToInvalidate: string[] = [
    "homepage:articles:12",
    "homepage:articles:20",
    "trending:articles:5",
    "breaking:news",
  ];

  if (body.slug) {
    keysToInvalidate.push(`article:${body.slug}`);
  }

  if (body.categorySlug) {
    keysToInvalidate.push(`category:${body.categorySlug}`);
  }

  await clearCache(...keysToInvalidate);

  return NextResponse.json({ revalidated: true, path, cacheCleared: keysToInvalidate });
}

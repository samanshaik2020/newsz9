import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { clearArticleCaches } from "@/lib/cache";

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

  const keysToInvalidate = await clearArticleCaches({
    slug: body.slug,
    categorySlug: body.categorySlug,
    includeBreakingNews: true,
  });

  return NextResponse.json({ revalidated: true, path, cacheCleared: keysToInvalidate });
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "./utils.ts";

export const MAX_ARTICLE_TAGS = 30;

export function parseTagKeywords(value: string) {
  const seen = new Set<string>();
  return value.split(",").map((keyword) => keyword.trim()).filter(Boolean).map((name) => ({ name, slug: slugify(name) })).filter((tag) => {
    const key = tag.slug || tag.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function resolveKeywordTagIds(supabase: SupabaseClient, tags: ReturnType<typeof parseTagKeywords>): Promise<string[]> {
  if (!tags.length) return [];
  // Reuse existing tags without changing the names used by other articles.
  const saved = await supabase.from("tags").upsert(tags, { onConflict: "slug", ignoreDuplicates: true });
  if (saved.error) throw new Error("Could not save keyword tags.");
  const result = await supabase.from("tags").select("id,slug").in("slug", tags.map((tag) => tag.slug));
  if (result.error || result.data.length !== tags.length) throw new Error("Could not resolve keyword tags.");
  return result.data.map((tag: { id: string }) => tag.id);
}

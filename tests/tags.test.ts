import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseTagKeywords, resolveKeywordTagIds } from "../src/lib/tags.ts";

test("comma-separated keywords trim whitespace, ignore blanks, and deduplicate tags", () => {
  assert.deepEqual(parseTagKeywords(" Politics, ,Technology, politics, local news, "), [
    { name: "Politics", slug: "politics" },
    { name: "Technology", slug: "technology" },
    { name: "local news", slug: "local-news" },
  ]);
  assert.deepEqual(parseTagKeywords("తెలుగు, తాజా వార్తలు, తెలుగు"), [
    { name: "తెలుగు", slug: "తెలుగు" },
    { name: "తాజా వార్తలు", slug: "తాజా-వార్తలు" },
  ]);
  assert.deepEqual(parseTagKeywords(" , , "), []);
});

test("the final keyword is included without requiring Enter or a trailing comma", () => {
  assert.deepEqual(parseTagKeywords("news, local updates").map((tag) => tag.slug), ["news", "local-updates"]);
});

test("resolving an empty tag field clears selection without creating tags", async () => {
  const client = { from() { throw new Error("No query expected"); } } as unknown as SupabaseClient;
  assert.deepEqual(await resolveKeywordTagIds(client, []), []);
});

test("keyword resolution reuses existing tags and does not overwrite their names", async () => {
  const tags = parseTagKeywords("Politics, Technology");
  const client = {
    from(table: string) {
      assert.equal(table, "tags");
      return {
        async upsert(rows: unknown, options: unknown) {
          assert.deepEqual(rows, tags);
          assert.deepEqual(options, { onConflict: "slug", ignoreDuplicates: true });
          return { error: null };
        },
        select() {
          return { async in(column: string, values: string[]) {
            assert.equal(column, "slug");
            assert.deepEqual(values, ["politics", "technology"]);
            return { error: null, data: [{ id: "existing-id", slug: "politics" }, { id: "new-id", slug: "technology" }] };
          } };
        },
      };
    },
  } as unknown as SupabaseClient;
  assert.deepEqual(await resolveKeywordTagIds(client, tags), ["existing-id", "new-id"]);
});

test("tag database failures are surfaced to the article save handler", async () => {
  const client = { from() { return { async upsert() { return { error: { message: "unavailable" } }; } }; } } as unknown as SupabaseClient;
  await assert.rejects(resolveKeywordTagIds(client, parseTagKeywords("news")), /Could not save keyword tags/);
});

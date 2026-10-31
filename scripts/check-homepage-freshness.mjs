// Run after `npm run build`. Requests use a mock database; no live data is changed.
import assert from "node:assert/strict";
import { createRequire } from "node:module";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://freshness-check.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "freshness-check-key";
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const oldDate = "2020-01-01T00:00:00Z";
const recentDate = new Date(Date.now() - 60_000).toISOString();
const story = (id, published_at) => ({
  id, slug: `story-${id}`, title: `స్థానిక ప్రజలకు ఉపయోగపడే తాజా వార్తా వివరాలు ${id}`, summary: "తాజా వివరాలు",
  language: "te", status: "published", published_at, created_at: published_at,
  updated_at: published_at, cover_image: null, views: 0,
});
let rows = [story("old", oldDate)];
let requests = 0;
let unavailable = false;

globalThis.fetch = async (resource, options = {}) => {
  const url = new URL(typeof resource === "string" ? resource : resource.url);
  assert.equal(url.pathname, "/rest/v1/articles");
  assert.equal(options.method ?? "GET", "GET", "Freshness checks must never write stories");
  assert.equal(url.searchParams.get("status"), "eq.published");
  assert.equal(url.searchParams.get("language"), "eq.te");
  assert.equal(url.searchParams.get("order"), "published_at.desc,id.asc");
  const cutoff = Date.parse(url.searchParams.get("published_at").replace(/^lte\./, ""));
  assert.ok(Number.isFinite(cutoff) && cutoff <= Date.now());
  requests++;
  if (unavailable) return Response.json({ code: "42501", message: "private database diagnostic" }, { status: 403 });
  return Response.json(rows.filter((a) => a.status === "published" && a.language === "te" && Date.parse(a.published_at) <= cutoff)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at) || a.id.localeCompare(b.id)));
};

const require = createRequire(import.meta.url);
const { GET } = require("../.next/server/app/api/articles/route.js").routeModule.userland;
const request = () => new Request("http://localhost/api/articles?limit=12");
let response = await GET(request());
assert.equal(response.status, 200);
assert.deepEqual((await response.json()).articles.map((a) => a.id), ["old"]);

// A different server or CMS publishes after this instance has warmed its caches.
rows.push(story("new", recentDate), { ...story("draft", oldDate), status: "draft" },
  { ...story("english", oldDate), language: "en" }, story("scheduled", "2099-01-01T00:00:00Z"));
response = await GET(request());
assert.equal(response.status, 200);
let articles = (await response.json()).articles;
assert.deepEqual(articles.map((a) => a.id), ["new", "old"], "A new publication must appear on the very next request without local cache invalidation");
assert.equal(articles[0].published_at, recentDate);
assert.equal(response.headers.get("cache-control"), "no-store");
assert.equal(requests, 2, "Each latest-list request must read the database");
console.log("PASS new publications appear immediately, newest first; drafts, other languages and future posts stay private");

rows[0] = { ...rows[0], title: "సవరించిన స్థానిక వార్త", updated_at: recentDate };
rows.find((a) => a.id === "new").status = "archived";
response = await GET(request());
articles = (await response.json()).articles;
assert.equal(articles.length, 1);
assert.equal(articles[0].title, "సవరించిన స్థానిక వార్త");
assert.equal(articles[0].published_at, oldDate, "Refreshing must not rewrite the publication date");
console.log("PASS edits and withdrawals appear on the next request while original publication dates are preserved");

unavailable = true;
response = await GET(request());
assert.equal(response.status, 503, "An unavailable database must not look like a successful empty news feed");
assert.equal(response.headers.get("cache-control"), "no-store");
assert.ok(!(await response.text()).includes("private database diagnostic"));
unavailable = false;
rows = [];
response = await GET(request());
assert.equal(response.status, 200);
assert.deepEqual((await response.json()).articles, []);
assert.equal((await GET(new Request("http://localhost/api/articles?limit=0"))).status, 400);
console.log("PASS outages return a non-cacheable 503; valid empty feeds and pagination validation still work");

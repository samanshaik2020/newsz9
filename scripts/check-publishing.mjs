// Run after `npm run build`. All database requests are mocked; no stories are published.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createRequire } from "node:module";

process.env.ADMIN_PASSWORD = "publishing-check-password";
process.env.ADMIN_SESSION_SECRET = "publishing-check-secret";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://publishing-check.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "publishing-check-key";
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const writes = [];
let duplicate = false;
let insertError = null;
const article = { title: "స్థానిక వార్త", content: "<p>స్థానిక ప్రజలకు తాజా సమాచారం.</p>", status: "published" };
globalThis.fetch = async (resource, options = {}) => {
  const url = new URL(typeof resource === "string" ? resource : resource.url);
  assert.equal(url.pathname, "/rest/v1/articles", "No author, category, or other service should be required");
  const method = options.method ?? "GET";
  if (method === "GET") return Response.json(duplicate ? [{ id: "other-story", ...article }] : []);
  assert.equal(method, "POST");
  if (insertError) return Response.json(insertError, { status: 400 });
  writes.push(JSON.parse(options.body));
  return Response.json({ id: "test-story", slug: writes.at(-1).slug }, { status: 201 });
};

const require = createRequire(import.meta.url);
const { POST } = require("../.next/server/app/api/admin/articles/route.js").routeModule.userland;
const cookie = createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(process.env.ADMIN_PASSWORD).digest("hex");
function request(body, authenticated = true) {
  return new Request("http://localhost/api/admin/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(authenticated ? { Cookie: `newsz9_admin=${cookie}` } : {}) },
    body: JSON.stringify(body),
  });
}

const saved = await POST(request(article));
assert.equal(saved.status, 201, JSON.stringify(await saved.json()));
assert.equal(writes.length, 1);
const payload = writes[0];
assert.equal(payload.title, article.title);
assert.equal(payload.content, article.content);
assert.equal(payload.slug, "స్థానిక-వార్త");
assert.equal(payload.author_id, null);
assert.equal(payload.category_id, null);
assert.equal(payload.cover_image, null);
assert.equal(payload.summary, "");
assert.ok(Date.parse(payload.published_at) <= Date.now());
for (const field of ["cover_alt", "image_credit", "sources", "original_reporting", "editorial_reviewed", "ai_assisted", "reviewer_id", "content_kind", "sponsor_name", "correction_note"]) assert.equal(Object.hasOwn(payload, field), false, field);
console.log("PASS published article requires only title and content; slug and publication time are automatic");
console.log("PASS empty optional metadata works with the legacy database schema");

const withDetails = { ...article, cover_alt: "స్థానిక సమావేశం చిత్రం", image_credit: "Original photo, used with permission", ai_assisted: true, content_kind: "analysis" };
const detailsResponse = await POST(request(withDetails));
assert.equal(detailsResponse.status, 201, JSON.stringify(await detailsResponse.json()));
for (const field of ["cover_alt", "image_credit", "ai_assisted", "content_kind"]) assert.equal(writes[1][field], withDetails[field]);
console.log("PASS provided optional image and editorial details are saved without being discarded");

for (const [code, status, message] of [["PGRST204", 503, /storage update is incomplete/], ["23503", 422, /selected author, category, or reviewer/], ["42501", 403, /did not allow/], ["XX000", 500, /Please try again/]]) {
  insertError = { code, message: "private internal database diagnostic" };
  const failure = await POST(request(withDetails));
  assert.equal(failure.status, status, code);
  const result = await failure.json();
  assert.match(result.error, message);
  assert.equal(result.code, code);
  assert.ok(!JSON.stringify(result).includes("private internal"));
}
insertError = null;
console.log("PASS save errors distinguish missing schema, invalid references, permissions, and server failures");

for (const incomplete of [{ ...article, title: "" }, { ...article, content: "" }, { ...article, content: "<p><br></p>" }]) {
  const rejected = await POST(request(incomplete));
  assert.ok([400, 422].includes(rejected.status));
}
assert.equal((await POST(request({ ...article, title: "English headline" }))).status, 422);
assert.equal(writes.length, 2, "Invalid main fields must never reach the insert");
console.log("PASS missing main fields and invalid article language are rejected before a write");

duplicate = true;
assert.equal((await POST(request(article))).status, 409);
assert.equal((await POST(request(article, false))).status, 401);
assert.equal(writes.length, 2);
console.log("PASS duplicate protection and admin authentication remain enforced");

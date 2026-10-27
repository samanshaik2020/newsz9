import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
const origin = process.env.SMOKE_ORIGIN ?? "http://127.0.0.1:3100";
const trust = ["about-us", "contact-us", "privacy-policy", "terms-and-conditions", "disclaimer", "editorial-policy", "corrections-policy", "grievance"];
for (const path of ["/", ...trust.map((p) => "/" + p), "/latest", "/search?q=" + encodeURIComponent("నెల్లూరు")]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="te"/, path);
  const footer = [...html.matchAll(/<footer\b[\s\S]*?<\/footer>/g)].at(-1)?.[0] ?? "";
  assert.ok(footer, `${path}: missing site footer`);
  assert.ok(!/mailto:|tel:|<address\b/i.test(footer), `${path}: footer must not include direct contact details`);
  assert.ok(footer.includes('/branding/newsz9-wordmark.jpeg'), `${path}: original NEWSZ9 logo missing`);
  if (trust.includes(path.slice(1))) {
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";
    assert.match(main, /class="essential-page[^\"]*" lang="en"/, `${path}: English content language missing`);
    assert.ok(!/[\u0C00-\u0C7F]/.test(main.replace(/<[^>]*>/g, "")), `${path}: essential page contains untranslated Telugu text`);
    assert.match(html, /property="og:locale" content="en_IN"/, `${path}: English sharing locale missing`);
  }
  for (const link of trust) assert.ok(html.includes(`href="/${link}"`), `${path}: missing footer ${link}`);
  assert.ok(!html.includes("pagead2.googlesyndication.com/pagead/js"), path);
  if (path === "/") {
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";
    const cards = [...main.matchAll(/<article\b[\s\S]*?<\/article>/g)].map((m) => m[0].match(/href="\/article\/([^\"]+)"/)?.[1]).filter(Boolean);
    assert.ok(cards.length > 0, "homepage should contain real articles");
    assert.equal(new Set(cards).size, cards.length, "homepage must not repeat article cards");
  }
  console.log("PASS", path);
}
for (const [old, target] of [["about", "about-us"], ["contact", "contact-us"], ["privacy", "privacy-policy"]]) {
  const r = await fetch(`${origin}/${old}`, { redirect: "manual" });
  assert.equal(r.status, 308); assert.ok(r.headers.get("location")?.endsWith("/" + target));
}
for (const path of ["/robots.txt", "/sitemap.xml", "/feed.xml", "/ads.txt"]) {
  const r = await fetch(origin + path); assert.equal(r.status, 200, path); console.log("PASS", path);
}
assert.equal((await fetch(origin + "/api/articles?limit=-1")).status, 400);
const health = await fetch(origin + "/article/hba1c-10-6-management-guidelines-diabetes-care-telugu");
assert.equal(health.status, 200);
const healthHtml = await health.text();
assert.match(healthHtml, /name="robots" content="noindex, follow"/);
assert.ok(!healthHtml.includes("Dashboard Setting Recommendations"));
const publicResult = await (await fetch(origin + "/api/articles?lang=en&limit=5")).json();
assert.ok(publicResult.articles.every((a) => a.language === "te"));
assert.equal((await fetch(origin + "/api/admin/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).status, 401);
if (process.env.ADMIN_PASSWORD) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cookie = createHmac("sha256", secret).update(process.env.ADMIN_PASSWORD).digest("hex");
  const headers = { "Content-Type": "application/json", Cookie: `newsz9_admin=${cookie}` };
  const rejected = await fetch(origin + "/api/admin/articles", { method: "POST", headers, body: JSON.stringify({ title: "తెలుగు వార్త", slug: "validation-only", content: "<p>పరిశీలన</p>", language: "te", status: "published" }) });
  assert.equal(rejected.status, 422, "incomplete publication must fail before a database write");
  const result = await rejected.json(); assert.ok(result.issues.length > 0);
  console.log("PASS server publication validation; no story written");
}
console.log("All smoke checks passed.");

import assert from "node:assert/strict";
import test from "node:test";
import { composeHomepage, isPublicArticle, isTeluguCopy, normalizeEditorialInput, normalizedText, publicationDates, publicationIssues } from "../src/lib/editorial.ts";
import { slugify } from "../src/lib/utils.ts";
import type { ArticleFormInput, ArticleListItem, Author, Category } from "../src/types/index.ts";
import { publicAuthor } from "../src/lib/authors.ts";

const author: Author = { id: "writer", name: "గోల్డీ అజిత్", bio: "తెలుగు కథనాల రచనకు బాధ్యత వహిస్తారు.", role: "editor" };
const category: Category = { id: "ap", slug: "andhra-pradesh", name: "ఆంధ్రప్రదేశ్", language: "te" };
function submission(): ArticleFormInput {
  return { title: "ప్రజలకు ఉపయోగపడే స్థానిక వార్తా వివరాలు", slug: "local-report", summary: "అధికారిక ఆధారాలతో స్థానిక పరిణామాల వివరణ.", content: `<p>${"ప్రజలకు ఉపయోగపడే సమాచారాన్ని ఆధారాలతో పరిశీలించాం. ".repeat(45)}</p><h2>ఏం జరిగింది</h2><p>స్థానిక వివరాలు</p><h2>ఆధారాలు ఏమిటి</h2><p>మూలాలను తనిఖీ చేశాం</p>`, cover_image: "/story.webp", cover_alt: "సమావేశానికి హాజరైన ప్రజలు", image_credit: "సొంత చిత్రం; రచయిత అనుమతి", category_id: "ap", language: "te", status: "published", template: "template_1", sources: [{ title: "అధికారిక ప్రకటన", url: "https://example.org/notice" }], original_reporting: "స్థానిక అధికారుల ప్రకటనతో సమాచారాన్ని పోల్చి పరిశీలించాం.", editorial_reviewed: true };
}
function card(i: number): ArticleListItem {
  return { id: String(i), slug: `story-${i}`, title: `స్థానిక వార్త ${i}`, summary: "వివరణ", cover_image: null, language: "te", status: "published", views: i, published_at: "2026-10-01T04:00:00Z", created_at: "2026-10-01T04:00:00Z", categories: category };
}
test("homepage allocates every story once, including duplicate IDs, URLs and headlines", () => {
  const cards = Array.from({ length: 24 }, (_, i) => card(i));
  const layout = composeHomepage([...cards, { ...cards[0], id: "copy-id" }, { ...cards[2], id: "copy-title", slug: "other-url" }], [category]);
  const all = [layout.lead!, ...layout.top, ...layout.latest, ...layout.sections.flatMap((s) => s.articles), ...layout.trending];
  assert.equal(new Set(all.map((a) => a.id)).size, all.length);
  assert.equal(new Set(all.map((a) => a.slug)).size, all.length);
  assert.equal(new Set(all.map((a) => normalizedText(a.title))).size, all.length);
  assert.equal(layout.top.length, 4);
  assert.equal(layout.sections[0].articles.length, 3);
  assert.equal(composeHomepage([], []).lead, undefined);
});
test("public content excludes drafts, English, null, invalid and future dates", () => {
  const base = card(1), now = Date.parse("2026-10-27T00:00:00Z");
  assert.equal(isPublicArticle(base, now), true);
  for (const change of [{ status: "draft" as const }, { language: "en" as const }, { title: "English only" }, { published_at: null }, { published_at: "bad-date" }, { published_at: "2027-01-01T00:00:00Z" }]) assert.equal(isPublicArticle({ ...base, ...change }, now), false);
});
test("editorial gate accepts complete reporting and rejects missing evidence and English copy", () => {
  assert.deepEqual(publicationIssues(submission(), author, category), []);
  const issues = publicationIssues({ ...submission(), sources: [], editorial_reviewed: false, cover_alt: "English description", original_reporting: "" }, { ...author, role: "bot" }, category);
  assert.ok(issues.length >= 5);
  assert.equal(isTeluguCopy("This is an English news article."), false);
  assert.equal(isTeluguCopy("తెలుగు వార్తలు ప్రజలకు ఉపయోగపడాలి."), true);
});
test("health publication requires a real reviewer with credentials and a Telugu bio", () => {
  const health = { ...category, slug: "health", name: "ఆరోగ్యం" };
  assert.ok(publicationIssues(submission(), author, health).some((i) => i.includes("వైద్య")));
  const reviewer = { ...author, id: "reviewer", credentials: "వైద్య పట్టా" };
  assert.deepEqual(publicationIssues(submission(), author, health, reviewer), []);
  assert.ok(publicationIssues(submission(), author, health, { ...reviewer, role: "bot" }).length);
});
test("first publication date is preserved during edits and future imported dates are repaired", () => {
  const now = new Date("2026-10-27T04:00:00Z");
  assert.equal(publicationDates({ published_at: "2026-09-25T04:00:00Z" }, now).published_at, "2026-09-25T04:00:00Z");
  assert.equal(publicationDates({ published_at: "2027-01-01T00:00:00Z" }, now).published_at, now.toISOString());
});
test("sponsored reporting needs disclosure and unsafe source links cannot pass", () => {
  const input = normalizeEditorialInput({ ...submission(), content_kind: "sponsored", sources: [{ title: "మూలం", url: "javascript:alert(1)" }] });
  const issues = publicationIssues(input, author, category);
  assert.ok(issues.some((i) => i.includes("ప్రాయోజకుడి")));
  assert.ok(issues.some((i) => i.includes("మూలం")));
});
test("Telugu headlines generate nonempty stable URLs", () => {
  assert.equal(slugify("నెల్లూరు తాజా వార్తలు!"), "నెల్లూరు-తాజా-వార్తలు");
  assert.equal(normalizedText("<p>సొంత   కథనం!</p>"), normalizedText("సొంత కథనం"));
  assert.notEqual(normalizedText("రాజు"), normalizedText("రాజా"));
});
test("public profiles omit private email and preserve the real record ID", () => {
  const profile = publicAuthor({ ...author, name: "Goldy Ajit", email: "private@example.com" });
  assert.equal(profile?.id, author.id);
  assert.equal(profile?.name, "గోల్డీ అజిత్");
  assert.equal(Object.hasOwn(profile!, "email"), false);
});

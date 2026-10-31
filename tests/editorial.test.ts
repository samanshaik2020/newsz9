import assert from "node:assert/strict";
import test from "node:test";
import { articleWritePayload, composeHomepage, isPublicArticle, isTeluguCopy, normalizeEditorialInput, normalizedText, publicationDates, publicationIssues } from "../src/lib/editorial.ts";
import { slugify } from "../src/lib/utils.ts";
import type { Article, ArticleFormInput, ArticleListItem, Author, Category } from "../src/types/index.ts";
import { authorDisplayName, publicAuthor } from "../src/lib/authors.ts";

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
test("publishing requires a Telugu title and nonempty article content", () => {
  assert.deepEqual(publicationIssues(submission()), []);
  const issues = publicationIssues({ ...submission(), title: "", content: "<p><br></p>" });
  assert.deepEqual(issues, ["Title is required.", "Full Article is required."]);
  assert.ok(issues.every((issue) => !/[\u0C00-\u0C7F]/.test(issue)));
  assert.ok(publicationIssues({ ...submission(), content: "English article content" }).some((issue) => issue.includes("Full Article")));
  assert.equal(isTeluguCopy("This is an English news article."), false);
  assert.equal(isTeluguCopy("తెలుగు వార్తలు ప్రజలకు ఉపయోగపడాలి."), true);
});
test("title and short article content can publish without any secondary fields", () => {
  const input = normalizeEditorialInput({ title: "స్థానిక వార్త", content: "<p>స్థానిక ప్రజలకు తాజా సమాచారం.</p>", status: "published" });
  assert.deepEqual(publicationIssues(input), []);
  assert.equal(input.slug, "sthaanika-vaarta");
  assert.equal(input.author_id, null);
  assert.equal(input.category_id, null);
  assert.equal(input.cover_image, null);
  assert.equal(input.summary, "");
  assert.equal(input.editorial_reviewed, false);
  assert.equal(input.ai_assisted, false);
});

test("empty optional metadata is omitted for legacy database inserts", () => {
  const input = normalizeEditorialInput({ title: "స్థానిక వార్త", content: "<p>స్థానిక ప్రజలకు తాజా సమాచారం.</p>", status: "published" });
  const payload = articleWritePayload({ ...input, published_at: "2026-10-29T04:00:00Z" });
  for (const key of ["cover_alt", "image_credit", "sources", "original_reporting", "editorial_reviewed", "ai_assisted", "reviewer_id", "content_kind", "sponsor_name", "correction_note"]) assert.equal(Object.hasOwn(payload, key), false, key);
  assert.equal(payload.title, input.title);
  assert.equal(payload.content, input.content);
  assert.equal(payload.published_at, "2026-10-29T04:00:00Z");
});

test("provided metadata is kept and existing metadata can still be cleared", () => {
  const input = normalizeEditorialInput({ ...submission(), cover_alt: "", image_credit: "", editorial_reviewed: false });
  const existing = { ...submission(), id: "existing", views: 0, created_at: "2026-10-01T04:00:00Z", published_at: "2026-10-01T04:00:00Z" } as Article;
  const payload = articleWritePayload({ ...input, published_at: existing.published_at }, existing);
  assert.equal(Object.hasOwn(payload, "cover_alt"), true);
  assert.equal(payload.cover_alt, null);
  assert.equal(payload.image_credit, null);
  assert.equal(payload.editorial_reviewed, false);
  const newPayload = articleWritePayload({ ...normalizeEditorialInput({ ...submission(), ai_assisted: true }), published_at: null });
  assert.equal(newPayload.ai_assisted, true);
  assert.equal(newPayload.cover_alt, submission().cover_alt);
});

test("a supplied summary remains consistent with the Telugu reader pages", () => {
  assert.ok(publicationIssues({ ...submission(), summary: "English summary" }).some((issue) => issue.includes("Summary")));
  assert.deepEqual(publicationIssues({ ...submission(), summary: "" }), []);
});
test("first publication date is preserved during edits and future imported dates are repaired", () => {
  const now = new Date("2026-10-27T04:00:00Z");
  assert.equal(publicationDates({ published_at: "2026-09-25T04:00:00Z" }, now).published_at, "2026-09-25T04:00:00Z");
  assert.equal(publicationDates({ published_at: "2027-01-01T00:00:00Z" }, now).published_at, now.toISOString());
});
test("sponsor details are optional and unsafe optional source links are sanitized", () => {
  const input = normalizeEditorialInput({ ...submission(), content_kind: "sponsored", sources: [{ title: "మూలం", url: "javascript:alert(1)" }] });
  assert.deepEqual(publicationIssues(input), []);
  assert.equal(input.sources?.[0].url, "");
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
  assert.equal(authorDisplayName(profile!.name), "Goldy Ajit");
  assert.equal(Object.hasOwn(profile!, "email"), false);
});

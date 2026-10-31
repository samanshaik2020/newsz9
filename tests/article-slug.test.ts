import assert from "node:assert/strict";
import test from "node:test";
import { generateArticleSlug } from "../src/lib/article-slug.ts";
import { normalizeEditorialInput } from "../src/lib/editorial.ts";

test("Telugu headlines get compact Latin slugs without percent-encoding expansion", () => {
  assert.equal(generateArticleSlug("స్థానిక వార్త"), "sthaanika-vaarta");
  assert.equal(generateArticleSlug("తెలంగాణ తాజా వార్తలు"), "telamgaana-taajaa-vaartalu");
  assert.equal(generateArticleSlug("నవంబర్ ౩ వర్షాలు"), "navambar-3-varshaalu");
  assert.equal(generateArticleSlug(" Latest News: India Wins! "), "latest-news-india-wins");
});

test("long Telugu headlines stay descriptive and within 60 shareable characters", () => {
  const title = "తెలంగాణలో విస్తారంగా వర్షాలు నవంబర్ మూడు వరకు ఎల్లో అలర్ట్ జారీ చేసిన వాతావరణ శాఖ";
  const slug = generateArticleSlug(title);
  assert.match(slug, /^telamgaanaloo-vistaaramgaa-varshaalu-/);
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(slug.length <= 60);
  assert.equal(encodeURIComponent(slug).length, slug.length);
  assert.equal(generateArticleSlug(title), slug);
});

test("headlines with the same opening words get different shortened slugs", () => {
  const opening = "తెలంగాణలో విస్తారంగా వర్షాలు నవంబర్ మూడు వరకు ఎల్లో అలర్ట్ ";
  assert.notEqual(generateArticleSlug(opening + "హైదరాబాద్"), generateArticleSlug(opening + "వరంగల్"));
  const longWord = "వార్త".repeat(40);
  assert.ok(generateArticleSlug(longWord).length <= 60);
  assert.notEqual(generateArticleSlug(longWord + "ఒకటి"), generateArticleSlug(longWord + "రెండు"));
});

test("empty headlines remain empty and Telugu conjuncts and vowel signs stay readable", () => {
  assert.equal(generateArticleSlug(" !!! "), "");
  assert.equal(generateArticleSlug("క్షేత్రం శుద్ధి నీరు"), "ksheetram-shuddhi-neeru");
  assert.equal(generateArticleSlug("కా కి కీ కు కూ"), "kaa-ki-kee-ku-koo");
  assert.equal(generateArticleSlug("వాక్\u200dస్వేచ్ఛ"), generateArticleSlug("వాక్స్వేచ్ఛ"));
});

test("server and editor use the same generator while explicit existing URLs are preserved", () => {
  const title = "భద్రాచలం కొత్త గోదావరి వంతెన మూసివేత లోడ్ టెస్టింగ్ ప్రారంభం";
  assert.equal(normalizeEditorialInput({ title }).slug, generateArticleSlug(title));
  assert.equal(normalizeEditorialInput({ title, slug: "   " }).slug, generateArticleSlug(title));
  for (const slug of ["స్థానిక-వార్త", "existing-published-url", "ఇప్పటికే-ప్రచురించిన-పాత-వార్త-యొక్క-అసలు-చిరునామా"]) {
    assert.equal(normalizeEditorialInput({ title, slug }).slug, slug);
  }
});

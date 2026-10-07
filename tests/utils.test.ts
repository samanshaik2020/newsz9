import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeArticleContent,
  processArticleHtml,
  sanitizeArticleHtml,
  slugify,
} from "../src/lib/utils.ts";
import {
  getLanguageFromPath,
  normalizeLanguage,
} from "../src/lib/language.ts";
import {
  createAdminSessionValue,
  isAdminRequest,
  isValidAdminSession,
} from "../src/lib/admin-auth.ts";
import { buildAdminArticleStats } from "../src/lib/article-stats.ts";

test("slugify creates stable article slugs", () => {
  assert.equal(slugify(" Latest News: India Wins! "), "latest-news-india-wins");
});

test("language helpers default to Telugu and infer category language", () => {
  const categories = [
    { id: "cat-national", name: "National", slug: "national", language: "en" as const },
    { id: "cat-telugu", name: "Telugu News", slug: "telugu-news", language: "te" as const },
  ];

  assert.equal(normalizeLanguage(undefined), "te");
  assert.equal(normalizeLanguage("en"), "en");
  assert.equal(normalizeLanguage("bad", "en"), "en");
  assert.equal(getLanguageFromPath("/national", categories), "en");
  assert.equal(getLanguageFromPath("/telugu-news", categories), "te");
});

test("plain article content is escaped and wrapped", () => {
  assert.equal(
    normalizeArticleContent("Hello < breaking news\n\nSecond line"),
    "<p>Hello &lt; breaking news</p><p>Second line</p>",
  );
});

test("article html removes scripts, event handlers, and unsafe URLs", () => {
  const sanitized = sanitizeArticleHtml(
    '<p onclick="alert(1)">Hi <a href="javascript:alert(1)">bad</a><img src="javascript:alert(1)" onerror="alert(1)" alt="x"></p><script>alert(1)</script>',
  );

  assert.equal(sanitized, '<p>Hi <a>bad</a><img alt="x"></p>');
});

test("rendered article html is sanitized before image post-processing", () => {
  const html = processArticleHtml(
    '<img src="https://example.com/news.jpg" onerror="alert(1)"><iframe src="https://example.com"></iframe>',
  );

  assert.equal(
    html,
    '<img src="https://example.com/news.jpg" loading="lazy" decoding="async" width="800" height="450" style="max-width:100%;height:auto">',
  );
});

test("article font sizes survive saving and rendering", () => {
  const editorHtml =
    '<p>Normal <span style="font-size: 1.5rem; color: red">Large</span></p>';
  const savedHtml = normalizeArticleContent(editorHtml);

  assert.equal(
    savedHtml,
    '<p>Normal <span style="font-size:1.5rem">Large</span></p>',
  );
  assert.equal(processArticleHtml(savedHtml), savedHtml);
});

test("article html rejects unsupported and unsafe font sizes", () => {
  assert.equal(
    sanitizeArticleHtml(
      '<span style="font-size:9999px">Huge</span><span style="font-size:expression(alert(1))">Bad</span>',
    ),
    "<span>Huge</span><span>Bad</span>",
  );
});

test("browser font markup keeps sizes and fonts through saving and rendering", () => {
  const savedHtml = normalizeArticleContent(
    '<p><font size="5" face="Georgia">Large serif <b>bold</b></font></p><p><font size="2" face="Mallanna">తెలుగు వార్తలు</font></p>',
  );
  assert.equal(savedHtml,
    '<p><span style="font-size:1.5rem;font-family:Georgia">Large serif <b>bold</b></span></p><p><span style="font-size:0.875rem;font-family:Mallanna">తెలుగు వార్తలు</span></p>',
  );
  assert.equal(processArticleHtml(savedHtml), savedHtml);
});

test("editor font styles, quoted families, and highlights survive repeated saving", () => {
  const savedHtml = normalizeArticleContent(
    '<p><span style="font-family:&quot;Courier New&quot;;font-size:2rem;font-weight:700;font-style:italic;text-decoration-line:underline;background-color:rgb(254, 240, 138)">Formatted text</span></p>',
  );
  assert.equal(savedHtml,
    '<p><span style="font-family:Courier New;font-size:2rem;font-weight:700;font-style:italic;text-decoration-line:underline;background-color:rgb(254, 240, 138)">Formatted text</span></p>',
  );
  assert.equal(normalizeArticleContent(savedHtml), savedHtml);
  assert.equal(processArticleHtml(savedHtml), savedHtml);
});

test("font formatting remains restricted to safe supported values", () => {
  assert.equal(sanitizeArticleHtml(
    '<font size="99" face="bad" onclick="alert(1)">Text</font><span style="font-family:url(https://evil.test);font-style:expression(alert(1));background-color:url(https://evil.test);text-decoration:blink">Bad</span>',
  ), '<span>Text</span><span>Bad</span>');
});

test("admin password sessions validate request cookies", () => {
  const previousPassword = process.env.ADMIN_PASSWORD;
  const previousSecret = process.env.ADMIN_SESSION_SECRET;

  process.env.ADMIN_PASSWORD = "test-password";
  process.env.ADMIN_SESSION_SECRET = "test-secret";

  try {
    const session = createAdminSessionValue();
    const request = new Request("https://newsz9.com/admin", {
      headers: { cookie: `newsz9_admin=${session}` },
    });

    assert.equal(isValidAdminSession(session), true);
    assert.equal(isAdminRequest(request), true);
    assert.equal(isValidAdminSession("bad-session"), false);
  } finally {
    if (previousPassword === undefined) {
      delete process.env.ADMIN_PASSWORD;
    } else {
      process.env.ADMIN_PASSWORD = previousPassword;
    }

    if (previousSecret === undefined) {
      delete process.env.ADMIN_SESSION_SECRET;
    } else {
      process.env.ADMIN_SESSION_SECRET = previousSecret;
    }
  }
});

test("admin article stats include exact status and category totals", () => {
  const categories = [
    { id: "world", name: "World", slug: "world", language: "en" as const },
    { id: "sports", name: "Sports", slug: "sports", language: "en" as const },
  ];
  const articles = [
    { category_id: "sports", status: "published" as const },
    { category_id: "sports", status: "review" as const },
    { categories: categories[0], status: "draft" as const },
    { category_id: null, status: "archived" as const },
  ];

  assert.deepEqual(buildAdminArticleStats(articles, categories), {
    total: 4,
    published: 1,
    review: 1,
    draft: 1,
    archived: 1,
    uncategorized: 1,
    byCategory: [
      { category: categories[1], count: 2 },
      { category: categories[0], count: 1 },
    ],
  });
});

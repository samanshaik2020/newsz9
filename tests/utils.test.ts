import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeArticleContent,
  processArticleHtml,
  sanitizeArticleHtml,
  slugify,
} from "../src/lib/utils.ts";
import {
  createAdminSessionValue,
  isAdminRequest,
  isValidAdminSession,
} from "../src/lib/admin-auth.ts";

test("slugify creates stable article slugs", () => {
  assert.equal(slugify(" Latest News: India Wins! "), "latest-news-india-wins");
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

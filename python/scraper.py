import os
import re
from datetime import datetime, timezone

import feedparser
import google.generativeai as genai
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

RSS_FEEDS = [
    "https://feeds.feedburner.com/ndtvnews-top-stories",
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://www.thehindu.com/news/feeder/default.rss",
]


def required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing environment variable: {name}")
    return value


supabase = create_client(
    required_env("SUPABASE_URL"),
    required_env("SUPABASE_SERVICE_ROLE_KEY"),
)

genai.configure(api_key=required_env("GEMINI_API_KEY"))
model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))


def slug_from_title(title: str) -> str:
    slug = re.sub(r"[^a-z0-9\s-]", "", title.lower())
    slug = re.sub(r"\s+", "-", slug).strip("-")
    return slug[:90] or f"article-{int(datetime.now(timezone.utc).timestamp())}"


def rewrite_article(title: str, content: str) -> str:
    prompt = f"""Rewrite this news article in a fresh, engaging way.
Keep all facts accurate. Write 3-4 concise paragraphs.
Return HTML using only <p> tags.

Title: {title}
Content: {content}
"""
    response = model.generate_content(prompt)
    return response.text.strip()


def get_bot_author_id() -> str | None:
    result = (
        supabase.table("authors")
        .select("id")
        .eq("email", "bot@newsz9.com")
        .limit(1)
        .execute()
    )
    return result.data[0]["id"] if result.data else None


def article_exists(source_url: str) -> bool:
    result = (
        supabase.table("articles")
        .select("id")
        .eq("source_url", source_url)
        .limit(1)
        .execute()
    )
    return bool(result.data)


def scrape_and_post() -> None:
    bot_author_id = get_bot_author_id()

    for feed_url in RSS_FEEDS:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:5]:
            title = entry.get("title", "").strip()
            summary = entry.get("summary", "").strip()
            source_url = entry.get("link", "").strip()

            if not title or not source_url or article_exists(source_url):
                continue

            rewritten = rewrite_article(title, summary or title)
            payload = {
                "title": title,
                "slug": slug_from_title(title),
                "summary": summary[:300],
                "content": rewritten,
                "source_url": source_url,
                "language": "en",
                "template": "template_1",
                "status": "review",
                "author_id": bot_author_id,
            }
            supabase.table("articles").insert(payload).execute()
            print(f"Inserted for review: {title}")


if __name__ == "__main__":
    scrape_and_post()

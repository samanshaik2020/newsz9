import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ArticleRecommendations } from "@/components/site/ArticleRecommendations";
import { ShareButtons } from "@/components/site/ShareButtons";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { getArticleBySlug } from "@/lib/data";
import { NEWSZ9_WORDMARK } from "@/lib/branding";
import { getImageSrc, stripHtml } from "@/lib/utils";
import { maybeCreateClient } from "@/lib/supabase";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found | newsz9" };
  }

  const description = article.summary
    ? stripHtml(article.summary).slice(0, 160)
    : stripHtml(article.content).slice(0, 160);

  const coverImage = getImageSrc(article.cover_image);
  const articleUrl = `${siteUrl}/article/${article.slug}`;

  return {
    title: `${article.title} | newsz9`,
    description,
    keywords: [
      article.categories?.name,
      "newsz9",
      "India news",
      "Telugu news",
      article.language === "te" ? "తెలుగు వార్తలు" : undefined,
    ].filter(Boolean) as string[],
    authors: article.authors ? [{ name: article.authors.name }] : undefined,
    openGraph: {
      title: article.title,
      description,
      url: articleUrl,
      siteName: "NEWSZ9",
      type: "article",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      authors: article.authors ? [article.authors.name] : undefined,
      section: article.categories?.name ?? "News",
      locale: article.language === "te" ? "te_IN" : "en_IN",
      ...(coverImage
        ? {
            images: [
              {
                url: coverImage,
                width: 1200,
                height: 630,
                alt: article.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: coverImage ? "summary_large_image" : "summary",
      title: article.title,
      description,
      ...(coverImage ? { images: [coverImage] } : {}),
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const supabase = maybeCreateClient();
  if (supabase) {
    after(async () => {
      await supabase.rpc("increment_views", { article_id: article.id });
    });
  }

  const articleUrl = `${siteUrl}/article/${article.slug}`;

  // Breadcrumb trail
  const breadcrumbItems = [
    ...(article.categories
      ? [{ label: article.categories.name, href: `/${article.categories.slug}` }]
      : []),
    { label: article.title },
  ];

  // JSON-LD NewsArticle structured data
  const coverImage = getImageSrc(article.cover_image);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary ?? stripHtml(article.content).slice(0, 200),
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at ?? article.published_at ?? article.created_at,
    author: {
      "@type": "Person",
      name: article.authors?.name ?? "newsz9 Desk",
    },
    publisher: {
      "@type": "Organization",
      name: "NEWSZ9",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: new URL(NEWSZ9_WORDMARK.src, siteUrl).toString(),
        width: NEWSZ9_WORDMARK.width,
        height: NEWSZ9_WORDMARK.height,
      },
    },
    ...(coverImage
      ? {
          image: {
            "@type": "ImageObject",
            url: coverImage,
            width: 1200,
            height: 630,
          },
        }
      : {}),
    ...(article.categories
      ? { articleSection: article.categories.name }
      : {}),
    inLanguage: article.language === "te" ? "te" : "en",
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <TemplateRenderer article={article} />
      <div className="mx-auto max-w-6xl px-4 pb-6">
        <ShareButtons
          url={articleUrl}
          title={article.title}
          summary={article.summary}
        />
      </div>
      <Suspense fallback={
        <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500" role="status">
          Loading more stories…
        </div>
      }>
        <ArticleRecommendations article={article} />
      </Suspense>
    </>
  );
}

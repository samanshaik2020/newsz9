"use client";

import { useMemo, useState } from "react";
import { Eye, ImageIcon, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getImageSrc, normalizeArticleContent, slugify } from "@/lib/utils";
import { useConfirmStore } from "@/store/use-confirm-store";
import { useToastStore } from "@/store/use-toast-store";
import type {
  Article,
  ArticleFormInput,
  ArticleStatus,
  ArticleTemplate,
  Author,
  Category,
  Language,
} from "@/types";
import { TagInput } from "./TagInput";
import { TemplatePicker } from "./TemplatePicker";
import { RichTextEditor } from "./RichTextEditor";
import { EditorialChecklist } from "./EditorialChecklist";
import { publicationIssues } from "@/lib/editorial";
import { publicAuthorName } from "@/lib/authors";
import healthDrafts from "../../../content-rewrites/health-review-drafts.json";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

const previewAuthor = {
  id: "preview-author",
  name: "సంపాదక బృందం",
  email: "desk@newsz9.com",
  role: "editor" as const,
};

function formFromArticle(article?: Article): ArticleFormInput {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    summary: article?.summary ?? "",
    content: article?.content ?? "",
    cover_image: article?.cover_image ?? "",
    enable_gallery: article?.enable_gallery ?? false,
    gallery_images: article?.gallery_images ?? [],
    source_url: article?.source_url ?? "",
    category_id: article?.category_id ?? article?.categories?.id ?? "",
    language: "te",
    cover_alt: article?.cover_alt ?? "",
    image_credit: article?.image_credit ?? "",
    sources: article?.sources ?? [],
    original_reporting: article?.original_reporting ?? "",
    editorial_reviewed: article?.editorial_reviewed ?? false,
    ai_assisted: article?.ai_assisted ?? false,
    reviewer_id: article?.reviewer_id ?? null,
    content_kind: article?.content_kind ?? "news",
    sponsor_name: article?.sponsor_name ?? "",
    correction_note: article?.correction_note ?? "",
    template: article?.template ?? "template_1",
    status: article?.status ?? "draft",
  };
}

export function ArticleForm({
  article,
  authors = [],
  availableTags = [],
  categories,
  initialTagIds = [],
  mode = "create",
}: {
  article?: Article;
  authors?: Author[];
  availableTags?: Tag[];
  categories: Category[];
  initialTagIds?: string[];
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const confirmDialog = useConfirmStore((s) => s.open);
  const addToast = useToastStore((s) => s.addToast);
  const [form, setForm] = useState<ArticleFormInput>(() =>
    formFromArticle(article),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(
    article?.author_id ?? "",
  );

  const selectedCategory = categories.find(
    (category) => category.id === form.category_id,
  );
  const replacementDraft = healthDrafts.find((draft) => draft.existing_article_id === article?.id);
  const validCoverImage = getImageSrc(form.cover_image);
  const galleryImages = useMemo(
    () => (Array.isArray(form.gallery_images) ? form.gallery_images : []),
    [form.gallery_images],
  );

  const previewArticle = useMemo<Article>(
    () => ({
      ...form,
      id: article?.id ?? "preview-article",
      title: form.title || "కథనం శీర్షిక ముందస్తు వీక్షణ",
      slug: form.slug || "article-preview",
      summary:
        form.summary ||
        "పూర్తి కథనానికి ముందు సారాంశం ఇక్కడ కనిపిస్తుంది.",
      content: normalizeArticleContent(form.content || "కథనం ముందస్తు వీక్షణ."),
      cover_image: validCoverImage,
      enable_gallery: form.enable_gallery,
      gallery_images: galleryImages,
      source_url: form.source_url || null,
      category_id: form.category_id || null,
      author_id: selectedAuthorId || null,
      language: form.language,
      template: form.template,
      status: form.status,
      views: article?.views ?? 0,
      published_at:
        article?.published_at ??
        (form.status === "published" ? new Date().toISOString() : null),
      created_at: article?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      categories: selectedCategory ?? null,
      authors: authors.find((a) => a.id === selectedAuthorId) ?? previewAuthor,
    }),
    [article, form, galleryImages, selectedCategory, validCoverImage, authors, selectedAuthorId],
  );

  async function handleSubmit() {
    if (form.status === "published") {
      const issues = publicationIssues(form, authors.find((a) => a.id === selectedAuthorId), selectedCategory, authors.find((a) => a.id === form.reviewer_id));
      if (issues.length) { setMessage(issues.join("\n")); addToast("ప్రచురణ తనిఖీలో చూపిన వివరాలు పూర్తి చేయండి.", "error"); return; }
    }
    setIsSaving(true);
    setMessage(null);
    try {
    const endpoint =
      mode === "edit" && article
        ? `/api/admin/articles/${article.id}`
        : "/api/admin/articles";
    const response = await fetch(endpoint, {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        author_id: selectedAuthorId || null,
        tag_ids: selectedTagIds,
      }),
    });
    const payload = (await response.json()) as {
      article?: { id: string; slug: string };
      error?: string;
    };

    if (!response.ok) {
      addToast(payload.error ?? "కథనాన్ని భద్రపరచలేకపోయాం.", "error");
      return;
    }

    // Clear Redis caches so readers see fresh content
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/",
        slug: form.slug,
        categorySlug: selectedCategory?.slug,
      }),
    });

    addToast(mode === "edit" ? "కథనం సవరించబడింది." : "కథనం భద్రపడింది.", "success");
    router.refresh();

    if (mode === "create" && payload.article?.id) {
      router.push(`/admin/articles/${payload.article.id}`);
    }
    } catch {
      addToast("సర్వర్‌తో అనుసంధానం కాలేదు. మీ రచన ఇక్కడే ఉంది; మళ్లీ ప్రయత్నించండి.", "error");
    } finally { setIsSaving(false); }
  }

  async function handleImageUpload(file?: File) {
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as {
      publicUrl?: string;
      error?: string;
    };

    setIsUploading(false);

    if (!response.ok || !payload.publicUrl) {
      setMessage(payload.error ?? "చిత్రాన్ని అప్‌లోడ్ చేయలేకపోయాం.");
      return;
    }

    setForm({ ...form, cover_image: payload.publicUrl });
    setMessage("చిత్రం అప్‌లోడ్ అయింది.");
  }

  async function handleGalleryUpload(files?: FileList | null) {
    if (!files?.length) return;

    setIsGalleryUploading(true);
    setMessage(null);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        publicUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.publicUrl) {
        setMessage(payload.error ?? "ఒక చిత్రాన్ని అప్‌లోడ్ చేయలేకపోయాం.");
        setIsGalleryUploading(false);
        return;
      }

      uploadedUrls.push(payload.publicUrl);
    }

    setForm({
      ...form,
      enable_gallery: true,
      gallery_images: [...galleryImages, ...uploadedUrls],
    });
    setIsGalleryUploading(false);
    setMessage("అదనపు చిత్రంs uploaded.");
  }

  function addGalleryUrl() {
    const imageUrl = getImageSrc(galleryUrl);
    if (!imageUrl) {
      setMessage("సరైన చిత్రం లింకు ఇవ్వండి.");
      return;
    }

    setForm({
      ...form,
      enable_gallery: true,
      gallery_images: [...galleryImages, imageUrl],
    });
    setGalleryUrl("");
    setMessage(null);
  }

  function removeGalleryImage(indexToRemove: number) {
    setForm({
      ...form,
      gallery_images: galleryImages.filter((_, index) => index !== indexToRemove),
    });
  }

  function openPreviewPage() {
    // The preview opens without an opener, so use storage shared across tabs.
    localStorage.setItem("newsz9-article-preview", JSON.stringify(previewArticle));
    window.open("/admin/articles/preview", "_blank", "noopener,noreferrer");
  }

  async function handleDelete() {
    if (!article) return;

    const confirmed = await confirmDialog({
      title: "కథనం తొలగింపు",
      message: "ఈ కథనాన్ని శాశ్వతంగా తొలగించాలా? ఈ చర్యను వెనక్కి తీసుకోలేరు.",
      confirmLabel: "తొలగించండి",
      variant: "danger",
    });
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage(null);

    const response = await fetch(`/api/admin/articles/${article.id}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };

    setIsDeleting(false);

    if (!response.ok) {
      addToast(payload.error ?? "కథనాన్ని తొలగించలేకపోయాం.", "error");
      return;
    }

    addToast("కథనం తొలగించబడింది.", "success");
    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <section className="grid content-start gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              {mode === "edit" ? "కథనం సవరించండి" : "కొత్త కథనం రాయండి"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              చిత్రం, విభాగం, నమూనాను ఎంచుకోండి. ప్రచురణ తనిఖీలు పూర్తి చేసి ముందస్తు వీక్షణ చూడండి.
            </p>
          </div>
          {mode === "edit" ? (
            <Button asChild>
              <Link href="/admin/articles/new">
                <Plus aria-hidden="true" />
                కొత్త కథనం జోడించండి
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 rounded-md border border-zinc-200 bg-white p-5">
          {replacementDraft && <aside className="rounded border border-amber-300 bg-amber-50 p-4"><p>ఈ కథనానికి ఆధారాలతో తెలుగు పునర్రచన ముసాయిదా సిద్ధంగా ఉంది. లోడ్ చేసిన తరువాత రచయిత, చిత్ర హక్కులు, వైద్య సమీక్ష పూర్తి చేయాలి. భద్రపరిచే వరకు ప్రస్తుత కథనం మారదు.</p><button className="mt-3 rounded border bg-white px-4 py-2 font-bold" type="button" onClick={() => {
            const { existing_article_id: _id, ...draft } = replacementDraft;
            void _id; // This identifies the existing record, not an editable article field.
            setForm({ ...form, ...draft, language: "te", status: "review", source_url: draft.sources[0]?.url ?? "" });
          }}>పునర్రచన ముసాయిదా లోడ్ చేయండి</button></aside>}
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            శీర్షిక
            <input
              className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
              onChange={(event) =>
                setForm({
                  ...form,
                  title: event.target.value,
                  slug:
                    form.slug && mode === "edit"
                      ? form.slug
                      : slugify(event.target.value),
                })
              }
              placeholder="కథనం శీర్షిక"
              value={form.title}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            లింకు పేరు
            <input
              className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal text-zinc-600 outline-none focus:border-red-700"
              onChange={(event) =>
                setForm({ ...form, slug: slugify(event.target.value) })
              }
              placeholder="article-slug"
              value={form.slug}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            సారాంశం
            <textarea
              className="min-h-24 rounded-md border border-zinc-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-700"
              onChange={(event) =>
                setForm({ ...form, summary: event.target.value })
              }
              placeholder="కథనం ప్రధాన విషయాన్ని సంక్షిప్తంగా రాయండి"
              value={form.summary ?? ""}
            />
          </label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder="కథనాన్ని తెలుగులో రాయండి. ఉపశీర్షికలు, పేరాలు, జాబితాలు, మూలాల లింకులు జోడించండి."
          />
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="grid gap-3">
              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                ప్రధాన చిత్రం అప్‌లోడ్
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="min-h-11 rounded-md border border-zinc-300 px-4 py-2 text-sm font-normal outline-none file:mr-3 file:rounded file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white focus:border-red-700"
                  disabled={isUploading}
                  onChange={(event) => handleImageUpload(event.target.files?.[0])}
                  type="file"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                ప్రధాన చిత్రం లింకు
                <input
                  className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
                  onChange={(event) =>
                    setForm({ ...form, cover_image: event.target.value })
                  }
                  placeholder="https://..."
                  value={form.cover_image ?? ""}
                />
              </label>
              {isUploading ? (
                <p className="text-sm font-medium text-zinc-600">
                  చిత్రం అప్‌లోడ్ అవుతోంది…
                </p>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
              {validCoverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="ప్రధాన చిత్రం ముందస్తు వీక్షణ"
                  className="h-full min-h-32 w-full object-cover"
                  src={validCoverImage}
                />
              ) : (
                <div className="grid min-h-32 place-items-center text-zinc-500">
                  <ImageIcon className="h-8 w-8" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
          <section className="grid gap-4 rounded-md border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-zinc-900">
                  కథనానికి అదనపు చిత్రాలు
                </h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  ఎంచుకున్న నమూనాలో అదనపు చిత్రాలు చూపడానికి ఈ ఎంపికను ప్రారంభించండి.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-zinc-800">
                <input
                  checked={Boolean(form.enable_gallery)}
                  className="h-5 w-5 accent-red-700"
                  onChange={(event) =>
                    setForm({ ...form, enable_gallery: event.target.checked })
                  }
                  type="checkbox"
                />
                {form.enable_gallery ? "చేతనం" : "నిలిపివేత"}
              </label>
            </div>
            {form.enable_gallery ? (
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-bold text-zinc-800">
                  మరిన్ని చిత్రాలు అప్‌లోడ్ చేయండి
                  <input
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="min-h-11 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-normal outline-none file:mr-3 file:rounded file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white focus:border-red-700"
                    disabled={isGalleryUploading}
                    multiple
                    onChange={(event) => handleGalleryUpload(event.target.files)}
                    type="file"
                  />
                </label>
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <input
                    className="min-h-11 rounded-md border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-red-700"
                    onChange={(event) => setGalleryUrl(event.target.value)}
                    placeholder="అదనపు చిత్రం లింకు ఇవ్వండి"
                    value={galleryUrl}
                  />
                  <Button onClick={addGalleryUrl} type="button" variant="outline">
                    <Plus aria-hidden="true" />
                    లింకు జోడించండి
                  </Button>
                </div>
                {isGalleryUploading ? (
                  <p className="text-sm font-medium text-zinc-600">
                    అదనపు చిత్రాలు అప్‌లోడ్ అవుతున్నాయి…
                  </p>
                ) : null}
                {galleryImages.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {galleryImages.map((image, index) => (
                      <div
                        className="overflow-hidden rounded-md border border-zinc-200 bg-white"
                        key={`${image}-${index}`}
                      >
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={`అదనపు చిత్రం ${index + 1}`}
                            className="aspect-[4/3] w-full object-cover"
                            src={image}
                          />
                          <button
                            aria-label={`అదనపు చిత్రం తొలగించండి ${index + 1}`}
                            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-zinc-950 text-white shadow-sm hover:bg-red-700"
                            onClick={() => removeGalleryImage(index)}
                            type="button"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
                    ఇంకా అదనపు చిత్రాలు జోడించలేదు.
                  </p>
                )}
              </div>
            ) : null}
          </section>
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            మూలం లింకు
            <input
              className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
              onChange={(event) =>
                setForm({ ...form, source_url: event.target.value })
              }
              placeholder="అసలు ఆధారం లింకు"
              value={form.source_url ?? ""}
            />
          </label>
          <TemplatePicker
            onChange={(template: ArticleTemplate) =>
              setForm({ ...form, template })
            }
            value={form.template}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              భాష
              <select
                className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal"
                onChange={(event) =>
                  setForm({ ...form, language: event.target.value as Language })
                }
                value={form.language}
              >
                <option value="te">తెలుగు</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              దశ
              <select
                className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal"
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as ArticleStatus,
                  })
                }
                value={form.status}
              >
                <option value="draft">ముసాయిదా</option>
                <option value="review">సమీక్ష</option>
                <option value="published">ప్రచురించండి</option>
                <option value="archived">భద్రపరిచినవి</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              విభాగం
              <select
                className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal"
                onChange={(event) =>
                  setForm({ ...form, category_id: event.target.value })
                }
                value={form.category_id ?? ""}
              >
                <option value="">విభాగాన్ని ఎంచుకోండి</option>
                {categories.filter((category) => category.language === "te").map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {/* Author selector */}
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            రచయిత
            <select
              className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal"
              onChange={(event) => setSelectedAuthorId(event.target.value)}
              value={selectedAuthorId}
            >
              <option value="">బాధ్యతగల రచయితను ఎంచుకోండి</option>
              {authors.filter((author) => author.role !== "bot").map((author) => (
                <option key={author.id} value={author.id}>
                  {publicAuthorName(author.name)}
                </option>
              ))}
            </select>
          </label>
          {/* Tags */}
          <EditorialChecklist value={form} onChange={setForm} authors={authors} authorId={selectedAuthorId} categories={categories} />
          <TagInput
            availableTags={availableTags}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isSaving} onClick={handleSubmit}>
              <Save aria-hidden="true" />
              {isSaving ? "భద్రపరుస్తున్నాం…" : mode === "edit" ? "మార్పులు భద్రపరచండి" : "కథనం భద్రపరచండి"}
            </Button>
            <Button onClick={openPreviewPage} type="button" variant="outline">
              <Eye aria-hidden="true" />
              ముందస్తు వీక్షణ
            </Button>
            {mode === "edit" && article ? (
              <Button asChild variant="outline">
                <a href={`/admin/articles/${article.id}/preview`}>
                  <Eye aria-hidden="true" />
                  భద్రపరిచిన కథనం వీక్షణ
                </a>
              </Button>
            ) : null}
            {mode === "edit" ? (
              <Button
                disabled={isDeleting}
                onClick={handleDelete}
                type="button"
                variant="destructive"
              >
                <Trash2 aria-hidden="true" />
                {isDeleting ? "తొలగిస్తున్నాం…" : "తొలగించండి"}
              </Button>
            ) : null}
            {message ? (
              <p className="text-sm font-medium text-zinc-700" role="status">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

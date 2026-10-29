"use client";
import { categoryDisplayName } from "@/lib/language";

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
import { ArticleDetails } from "./ArticleDetails";
import { publicationIssues } from "@/lib/editorial";
import { authorDisplayName } from "@/lib/authors";
import healthDrafts from "../../../content-rewrites/health-review-drafts.json";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

const previewAuthor = {
  id: "preview-author",
  name: "Editorial Team",
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
  const [tagKeywords, setTagKeywords] = useState(() => availableTags.filter((tag) => initialTagIds.includes(tag.id)).map((tag) => tag.name).join(", "));
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
      title: form.title || "Article Title Preview",
      slug: form.slug || "article-preview",
      summary:
        form.summary ||
        "The summary appears here before the full article.",
      content: normalizeArticleContent(form.content || "Article preview."),
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
      const issues = publicationIssues(form, authors.find((a) => a.id === selectedAuthorId), selectedCategory);
      if (issues.length) { setMessage(issues.join("\n")); addToast("Complete the required article details before publishing.", "error"); return; }
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
        tag_keywords: tagKeywords,
      }),
    });
    const payload = (await response.json()) as {
      article?: { id: string; slug: string };
      error?: string;
      warning?: string;
    };

    if (!response.ok) {
      addToast(payload.error ?? "Could not save the article.", "error");
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

    addToast(payload.warning ?? (mode === "edit" ? "Article updated." : "Article saved."), payload.warning ? "error" : "success");
    router.refresh();

    if (mode === "create" && payload.article?.id) {
      router.push(`/admin/articles/${payload.article.id}`);
    }
    } catch {
      addToast("Could not connect to the server. Your writing is still here; please try again.", "error");
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
      setMessage(payload.error ?? "Could not upload the image.");
      return;
    }

    setForm({ ...form, cover_image: payload.publicUrl });
    setMessage("Image uploaded.");
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
        setMessage(payload.error ?? "Could not upload an image.");
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
    setMessage("Gallery images uploaded.");
  }

  function addGalleryUrl() {
    const imageUrl = getImageSrc(galleryUrl);
    if (!imageUrl) {
      setMessage("Enter a valid image URL.");
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
      title: "Delete Article",
      message: "Permanently delete this article? This action cannot be undone.",
      confirmLabel: "Delete",
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
      addToast(payload.error ?? "Could not delete the article.", "error");
      return;
    }

    addToast("Article deleted.", "success");
    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <section className="grid content-start gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              {mode === "edit" ? "Edit Article" : "Write a New Article"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Choose an image, category, and layout. Add article details and preview your article.
            </p>
          </div>
          {mode === "edit" ? (
            <Button asChild>
              <Link href="/admin/articles/new">
                <Plus aria-hidden="true" />
                Add New Article
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 rounded-md border border-zinc-200 bg-white p-5">
          {replacementDraft && <aside className="rounded border border-amber-300 bg-amber-50 p-4"><p>A sourced Telugu rewrite draft is available for this article. After loading it, complete the author and image rights details. The current article changes only when you save.</p><button className="mt-3 rounded border bg-white px-4 py-2 font-bold" type="button" onClick={() => {
            const { existing_article_id: _id, ...draft } = replacementDraft;
            void _id; // This identifies the existing record, not an editable article field.
            setForm({ ...form, ...draft, language: "te", status: "review", source_url: draft.sources[0]?.url ?? "" });
          }}>Load Rewrite Draft</button></aside>}
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            Title
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
              placeholder="Article title"
              value={form.title}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            Slug
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
            Summary
            <textarea
              className="min-h-24 rounded-md border border-zinc-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-700"
              onChange={(event) =>
                setForm({ ...form, summary: event.target.value })
              }
              placeholder="Briefly summarize the main points of the article"
              value={form.summary ?? ""}
            />
          </label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder="Write the article in Telugu. Add subheadings, paragraphs, lists, and source links."
          />
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="grid gap-3">
              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                Upload Cover Image
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="min-h-11 rounded-md border border-zinc-300 px-4 py-2 text-sm font-normal outline-none file:mr-3 file:rounded file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white focus:border-red-700"
                  disabled={isUploading}
                  onChange={(event) => handleImageUpload(event.target.files?.[0])}
                  type="file"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                Cover Image URL
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
                  Uploading image…
                </p>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
              {validCoverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Cover image preview"
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
                  Article Gallery
                </h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Enable this option to display additional images in the selected layout.
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
                {form.enable_gallery ? "Enabled" : "Disabled"}
              </label>
            </div>
            {form.enable_gallery ? (
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-bold text-zinc-800">
                  Upload More Images
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
                    placeholder="Enter a gallery image URL"
                    value={galleryUrl}
                  />
                  <Button onClick={addGalleryUrl} type="button" variant="outline">
                    <Plus aria-hidden="true" />
                    Add Link
                  </Button>
                </div>
                {isGalleryUploading ? (
                  <p className="text-sm font-medium text-zinc-600">
                    Uploading gallery images…
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
                            alt={`Gallery image ${index + 1}`}
                            className="aspect-[4/3] w-full object-cover"
                            src={image}
                          />
                          <button
                            aria-label={`Remove gallery image ${index + 1}`}
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
                    No gallery images added yet.
                  </p>
                )}
              </div>
            ) : null}
          </section>
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            Source URL
            <input
              className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
              onChange={(event) =>
                setForm({ ...form, source_url: event.target.value })
              }
              placeholder="Original source URL"
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
              Language
              <select
                className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal"
                onChange={(event) =>
                  setForm({ ...form, language: event.target.value as Language })
                }
                value={form.language}
              >
                <option value="te">Telugu</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Status
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
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Category
              <select
                className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal"
                onChange={(event) =>
                  setForm({ ...form, category_id: event.target.value })
                }
                value={form.category_id ?? ""}
              >
                <option value="">Select a category</option>
                {categories.filter((category) => category.language === "te").map((category) => (
                  <option key={category.id} value={category.id}>
                    {categoryDisplayName(category)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {/* Author selector */}
          <label className="grid gap-2 text-sm font-bold text-zinc-800">
            Author
            <select
              className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal"
              onChange={(event) => setSelectedAuthorId(event.target.value)}
              value={selectedAuthorId}
            >
              <option value="">Select the responsible author</option>
              {authors.filter((author) => author.role !== "bot").map((author) => (
                <option key={author.id} value={author.id}>
                  {authorDisplayName(author.name)}
                </option>
              ))}
            </select>
          </label>
          {/* Tags */}
          <ArticleDetails value={form} onChange={setForm} />
          <TagInput
            value={tagKeywords}
            onChange={setTagKeywords}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isSaving} onClick={handleSubmit}>
              <Save aria-hidden="true" />
              {isSaving ? "Saving…" : mode === "edit" ? "Save Changes" : "Save Article"}
            </Button>
            <Button onClick={openPreviewPage} type="button" variant="outline">
              <Eye aria-hidden="true" />
              Preview
            </Button>
            {mode === "edit" && article ? (
              <Button asChild variant="outline">
                <a href={`/admin/articles/${article.id}/preview`}>
                  <Eye aria-hidden="true" />
                  Saved Article Preview
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
                {isDeleting ? "Deleting…" : "Delete"}
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

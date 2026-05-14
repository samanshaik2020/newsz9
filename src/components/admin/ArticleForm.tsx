"use client";

import { useMemo, useState } from "react";
import { Eye, ImageIcon, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getImageSrc, normalizeArticleContent, slugify } from "@/lib/utils";
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

interface Tag {
  id: string;
  name: string;
  slug: string;
}

const previewAuthor = {
  id: "preview-author",
  name: "newsz9 Desk",
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
    language: article?.language ?? "en",
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
  const validCoverImage = getImageSrc(form.cover_image);
  const galleryImages = useMemo(
    () => (Array.isArray(form.gallery_images) ? form.gallery_images : []),
    [form.gallery_images],
  );

  const previewArticle = useMemo<Article>(
    () => ({
      id: article?.id ?? "preview-article",
      title: form.title || "Article headline preview",
      slug: form.slug || "article-preview",
      summary:
        form.summary ||
        "Article summary preview appears here before the full story.",
      content: normalizeArticleContent(form.content || "Article body preview."),
      cover_image: validCoverImage,
      enable_gallery: form.enable_gallery,
      gallery_images: galleryImages,
      source_url: form.source_url || null,
      category_id: form.category_id || null,
      author_id: article?.author_id ?? previewAuthor.id,
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
      authors: article?.authors ?? previewAuthor,
    }),
    [article, form, galleryImages, selectedCategory, validCoverImage],
  );

  async function handleSubmit() {
    setIsSaving(true);
    setMessage(null);

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

    setIsSaving(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Article could not be saved.");
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

    setMessage(mode === "edit" ? "Article updated." : "Article saved.");
    router.refresh();

    if (mode === "create" && payload.article?.id) {
      router.push(`/admin/articles/${payload.article.id}`);
    }
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
      setMessage(payload.error ?? "Image could not be uploaded.");
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
        setMessage(payload.error ?? "One gallery image could not be uploaded.");
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
    sessionStorage.setItem("newsz9-article-preview", JSON.stringify(previewArticle));
    window.open("/admin/articles/preview", "_blank", "noopener,noreferrer");
  }

  async function handleDelete() {
    if (!article || !confirm("Delete this article permanently?")) return;

    setIsDeleting(true);
    setMessage(null);

    const response = await fetch(`/api/admin/articles/${article.id}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };

    setIsDeleting(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Article could not be deleted.");
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <section className="grid content-start gap-6">
        <div>
          <h1 className="text-3xl font-black">
            {mode === "edit" ? "Edit Article" : "Create Article"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Add the image, choose the category and layout, then open a full-page
            preview before publishing.
          </p>
        </div>
        <div className="grid gap-4 rounded-md border border-zinc-200 bg-white p-5">
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
              placeholder="Article headline"
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
              placeholder="Short summary shown in cards and article intros"
              value={form.summary ?? ""}
            />
          </label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder="Write your article content here — use the toolbar above to format text, add links, headings, and more."
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
                  Uploading image...
                </p>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
              {validCoverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Cover preview"
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
                  Additional Article Images
                </h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Turn this on to show an image gallery inside the selected article layout.
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
                {form.enable_gallery ? "On" : "Off"}
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
                    placeholder="Paste an extra image URL"
                    value={galleryUrl}
                  />
                  <Button onClick={addGalleryUrl} type="button" variant="outline">
                    <Plus aria-hidden="true" />
                    Add URL
                  </Button>
                </div>
                {isGalleryUploading ? (
                  <p className="text-sm font-medium text-zinc-600">
                    Uploading gallery images...
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
                    No extra images added yet.
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
              placeholder="Original article/source URL"
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
                <option value="en">English</option>
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
                <option value="published">Publish Now</option>
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
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
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
              <option value="">newsz9 Desk (default)</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name} ({author.role})
                </option>
              ))}
            </select>
          </label>
          {/* Tags */}
          <TagInput
            availableTags={availableTags}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isSaving} onClick={handleSubmit}>
              <Save aria-hidden="true" />
              {isSaving ? "Saving..." : mode === "edit" ? "Update Article" : "Save Article"}
            </Button>
            <Button onClick={openPreviewPage} type="button" variant="outline">
              <Eye aria-hidden="true" />
              Preview Page
            </Button>
            {mode === "edit" && article ? (
              <Button asChild variant="outline">
                <a href={`/admin/articles/${article.id}/preview`}>
                  <Eye aria-hidden="true" />
                  Saved Preview
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
                {isDeleting ? "Deleting..." : "Delete"}
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

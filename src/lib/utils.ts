import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90)
    .replace(/^-|-$/g, "");
}

export function formatDate(value?: string | null) {
  if (!value) return "Draft";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function normalizeArticleContent(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function getImageSrc(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:"
      ? trimmed
      : null;
  } catch {
    return null;
  }
}

/**
 * Post-process article HTML to add lazy loading, decoding, and
 * explicit width/height to every inline <img> tag.
 * This helps with CLS (Cumulative Layout Shift) and LCP scores.
 */
export function processArticleHtml(html: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (_match, attrs: string) => {
    let result = attrs;

    // Add loading="lazy" if not already present
    if (!/\bloading\s*=/i.test(result)) {
      result += ' loading="lazy"';
    }

    // Add decoding="async" if not already present
    if (!/\bdecoding\s*=/i.test(result)) {
      result += ' decoding="async"';
    }

    // Add default width/height if not already present (prevents CLS)
    if (!/\bwidth\s*=/i.test(result)) {
      result += ' width="800"';
    }
    if (!/\bheight\s*=/i.test(result)) {
      result += ' height="450"';
    }

    // Add style to maintain aspect ratio responsively
    if (!/\bstyle\s*=/i.test(result)) {
      result += ' style="max-width:100%;height:auto"';
    }

    return `<img${result}>`;
  });
}


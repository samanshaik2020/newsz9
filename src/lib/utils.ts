import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ARTICLE_FONT_SIZES, getArticleFontSize, sanitizeArticleFontFamily } from "./article-formatting.ts";

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

export function containsTeluguText(value?: string | null) {
  return Boolean(value && /[\u0C00-\u0C7F]/.test(value));
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
    return sanitizeArticleHtml(trimmed);
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

const allowedArticleTags = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "s",
  "span",
  "strong",
  "u",
  "ul",
]);

const voidArticleTags = new Set(["br", "hr", "img"]);
const globalArticleAttrs = new Set(["class", "style"]);
const articleAttrsByTag: Record<string, Set<string>> = {
  a: new Set(["href", "rel", "target", "title"]),
  img: new Set(["alt", "decoding", "height", "loading", "src", "width"]),
};

function isAllowedArticleAttr(tagName: string, attrName: string) {
  return (
    globalArticleAttrs.has(attrName) ||
    (articleAttrsByTag[tagName]?.has(attrName) ?? false)
  );
}

function unquoteAttrValue(value = "") {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function sanitizeUrlAttr(value: string, allowHash = false) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") || (allowHash && trimmed.startsWith("#"))) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? trimmed
      : null;
  } catch {
    return null;
  }
}

function sanitizeStyle(value: string) {
  const allowedProperties = new Set([
    "display",
    "font-family",
    "font-size",
    "font-style",
    "font-weight",
    "background-color",
    "height",
    "margin",
    "margin-left",
    "margin-right",
    "margin-top",
    "margin-bottom",
    "max-width",
    "text-align",
    "text-decoration",
    "text-decoration-line",
    "width",
  ]);
  const allowedFontSizes = new Set<string>(ARTICLE_FONT_SIZES.map((size) => size.style));

  return value
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&#0?39;|&#x27;|&apos;/gi, "'")
    .split(";")
    .map((rule) => {
      const [property, ...rawValueParts] = rule.split(":");
      const name = property?.trim().toLowerCase();
      const rawValue = rawValueParts.join(":").trim();

      if (!name || !rawValue || !allowedProperties.has(name)) return "";
      if (/url\s*\(|expression\s*\(|javascript:/i.test(rawValue)) return "";
      if (name === "font-family") {
        const family = sanitizeArticleFontFamily(rawValue);
        return family ? `font-family:${family}` : "";
      }
      if (!/^[#(),.%\-\w\s]+$/.test(rawValue)) return "";
      if (name === "font-size" && !allowedFontSizes.has(rawValue.toLowerCase())) {
        return "";
      }
      if (name === "font-style" && !/^(normal|italic|oblique)$/i.test(rawValue)) return "";
      if (name === "font-weight" && !/^(normal|bold|bolder|lighter|[1-9]00)$/i.test(rawValue)) return "";
      if (name.startsWith("text-decoration") && !/^(none|underline|line-through|overline)(\s+(underline|line-through|overline))*$/i.test(rawValue)) return "";
      if (name === "background-color" && !/^(transparent|#[0-9a-f]{3,8}|rgba?\([\d.,%\s]+\))$/i.test(rawValue)) return "";

      return `${name}:${rawValue}`;
    })
    .filter(Boolean)
    .join(";");
}

function sanitizeArticleAttr(tagName: string, attrName: string, value: string) {
  const decoded = unquoteAttrValue(value);

  if (attrName === "href") {
    const safeUrl = sanitizeUrlAttr(decoded, true);
    return safeUrl ? ` href="${escapeHtml(safeUrl)}"` : "";
  }

  if (attrName === "src") {
    const safeUrl = getImageSrc(decoded);
    return safeUrl ? ` src="${escapeHtml(safeUrl)}"` : "";
  }

  if (attrName === "target") {
    return ["_blank", "_self"].includes(decoded) ? ` target="${decoded}"` : "";
  }

  if (attrName === "rel") {
    const rel = decoded.replace(/[^a-z\s-]/gi, "").trim();
    return rel ? ` rel="${escapeHtml(rel)}"` : "";
  }

  if (attrName === "style") {
    const style = sanitizeStyle(decoded);
    return style ? ` style="${escapeHtml(style)}"` : "";
  }

  if (attrName === "class") {
    const className = decoded.replace(/[^a-z0-9_:\-\s]/gi, "").trim();
    return className ? ` class="${escapeHtml(className)}"` : "";
  }

  if (["width", "height"].includes(attrName)) {
    const dimension = decoded.match(/^\d{1,5}$/)?.[0];
    return dimension ? ` ${attrName}="${dimension}"` : "";
  }

  if (attrName === "loading") {
    return decoded === "lazy" || decoded === "eager" ? ` loading="${decoded}"` : "";
  }

  if (attrName === "decoding") {
    return decoded === "async" || decoded === "sync" ? ` decoding="${decoded}"` : "";
  }

  if (attrName === "alt" || attrName === "title") {
    return ` ${attrName}="${escapeHtml(decoded)}"`;
  }

  return isAllowedArticleAttr(tagName, attrName)
    ? ` ${attrName}="${escapeHtml(decoded)}"`
    : "";
}

function sanitizeArticleTag(tag: string) {
  const tagMatch = tag.match(/^<\/?\s*([a-z0-9-]+)([\s\S]*?)\/?\s*>$/i);
  if (!tagMatch) return "";

  const tagName = tagMatch[1].toLowerCase();
  // Preserve formatting from the browser's legacy editing commands and older drafts.
  if (tagName === "font") {
    if (tag.startsWith("</")) return "</span>";
    const attrs = tagMatch[2] ?? "";
    const styles: string[] = [];
    for (const match of attrs.matchAll(/(size|face|style)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi)) {
      const name = match[1].toLowerCase();
      const value = unquoteAttrValue(match[2]);
      if (name === "size") {
        const size = getArticleFontSize(value);
        if (size) styles.push(`font-size:${size}`);
      } else if (name === "face") {
        const family = sanitizeArticleFontFamily(value);
        if (family) styles.push(`font-family:${family}`);
      } else {
        styles.push(sanitizeStyle(value));
      }
    }
    const style = styles.filter(Boolean).join(";");
    return style ? `<span style="${escapeHtml(style)}">` : "<span>";
  }
  if (!allowedArticleTags.has(tagName)) return "";

  if (tag.startsWith("</")) {
    return voidArticleTags.has(tagName) ? "" : `</${tagName}>`;
  }

  const attrs = tagMatch[2] ?? "";
  const safeAttrs = [...attrs.matchAll(/([^\s"'<>\/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g)]
    .map((match) => {
      const attrName = match[1].toLowerCase();
      if (attrName.startsWith("on") || attrName.startsWith("xmlns")) return "";
      if (!isAllowedArticleAttr(tagName, attrName)) return "";
      return sanitizeArticleAttr(tagName, attrName, match[2] ?? "");
    })
    .join("");

  return voidArticleTags.has(tagName)
    ? `<${tagName}${safeAttrs}>`
    : `<${tagName}${safeAttrs}>`;
}

export function sanitizeArticleHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|svg|math)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<[^>]+>/g, sanitizeArticleTag);
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
  return sanitizeArticleHtml(html).replace(/<img\b([^>]*)>/gi, (_match, attrs: string) => {
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

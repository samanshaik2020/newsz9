export const ARTICLE_FONT_SIZES = [
  { value: "1", label: "Tiny (12px)", style: "0.75rem" },
  { value: "2", label: "Small (14px)", style: "0.875rem" },
  { value: "3", label: "Normal (16px)", style: "1rem" },
  { value: "4", label: "Large (18px)", style: "1.125rem" },
  { value: "5", label: "Larger (24px)", style: "1.5rem" },
  { value: "6", label: "Huge (32px)", style: "2rem" },
  { value: "7", label: "Giant (48px)", style: "3rem" },
] as const;

export const ARTICLE_FONT_FAMILIES = [
  { value: "Arial", label: "Sans serif" },
  { value: "Georgia", label: "Serif" },
  { value: "Courier New", label: "Monospace" },
  { value: "Mallanna", label: "Telugu" },
] as const;

export function getArticleFontSize(value: string) {
  return ARTICLE_FONT_SIZES.find((size) => size.value === value)?.style;
}

export function sanitizeArticleFontFamily(value: string) {
  const family = value
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&#0?39;|&#x27;|&apos;/gi, "'")
    .trim()
    .replace(/^["']|["']$/g, "");
  return ARTICLE_FONT_FAMILIES.find(
    (font) => font.value.toLowerCase() === family.toLowerCase(),
  )?.value;
}

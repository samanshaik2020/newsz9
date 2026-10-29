import type { Category, Language } from "@/types";

export const DEFAULT_LANGUAGE: Language = "te";

// Interface labels are English even when the category contains Telugu articles.
export function categoryDisplayName(category?: Pick<Category, "name" | "slug"> | null, fallback = "News") {
  if (!category) return fallback;
  if (!/[\u0C00-\u0C7F]/.test(category.name)) return category.name;

  const names: Record<string, string> = {
    andhrapradesh: "Andhra Pradesh",
    "andhra-pradesh": "Andhra Pradesh",
    telangana: "Telangana",
    national: "National",
    politics: "Politics",
    sports: "Sports",
    entertainment: "Entertainment",
    cinema: "Cinema",
    technology: "Technology",
    health: "Health",
    business: "Business",
    "telugu-news": "Telugu News",
  };
  return names[category.slug] ?? (/^[a-z0-9-]+$/i.test(category.slug)
    ? category.slug.replace(/-/g, " ").replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    : category.name);
}

export const languages = [
  { code: "en", label: "English", flag: "EN" },
  { code: "te", label: "Telugu", flag: "TE" },
] as const satisfies ReadonlyArray<{
  code: Language;
  label: string;
  flag: string;
}>;

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "te";
}

export function normalizeLanguage(
  value: string | string[] | null | undefined,
  fallback: Language = DEFAULT_LANGUAGE,
): Language {
  const candidate = Array.isArray(value) ? value[0] : value;
  return isLanguage(candidate) ? candidate : fallback;
}

export function getLanguageHomeHref(language: Language) {
  return language === "en" ? "/?lang=en" : "/";
}

export function getLanguageFromPath(
  pathname: string,
  categories: Category[],
  fallback: Language = DEFAULT_LANGUAGE,
): Language {
  const [slug] = pathname.split("/").filter(Boolean);
  const category = slug
    ? categories.find((item) => item.slug === slug)
    : undefined;

  return category?.language ?? fallback;
}

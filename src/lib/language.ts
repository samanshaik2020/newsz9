import type { Category, Language } from "@/types";

export const DEFAULT_LANGUAGE: Language = "te";

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

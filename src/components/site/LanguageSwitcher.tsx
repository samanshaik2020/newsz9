"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DEFAULT_LANGUAGE,
  getLanguageFromPath,
  getLanguageHomeHref,
  languages,
} from "@/lib/language";
import type { Category, Language } from "@/types";

export function LanguageSwitcher({
  categories,
  selectedLanguage,
}: {
  categories: Category[];
  selectedLanguage?: Language;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = getLanguageFromPath(
    pathname,
    categories,
    selectedLanguage ?? DEFAULT_LANGUAGE,
  );
  const currentLabel =
    languages.find((lang) => lang.code === currentLang)?.label ?? "Telugu";

  function switchLanguage(code: Language) {
    setIsOpen(false);

    if (code === currentLang) return;
    router.push(getLanguageHomeHref(code));
  }

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{currentLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
      </button>
      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 min-w-36 rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
            {languages.map((lang) => (
              <button
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium hover:bg-zinc-50 ${
                  lang.code === currentLang
                    ? "bg-red-50 text-red-700"
                    : "text-zinc-700"
                }`}
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                type="button"
              >
                <span className="grid h-6 w-6 place-items-center rounded bg-zinc-100 text-[10px] font-black">
                  {lang.flag}
                </span>
                {lang.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

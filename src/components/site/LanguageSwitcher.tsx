"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const languages = [
  { code: "en", label: "English", flag: "EN" },
  { code: "te", label: "తెలుగు", flag: "TE" },
] as const;

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Determine current language from URL or default to English
  const currentLang =
    pathname.startsWith("/te") ? "te" : "en";
  const currentLabel =
    languages.find((lang) => lang.code === currentLang)?.label ?? "English";

  function switchLanguage(code: string) {
    setIsOpen(false);

    if (code === "te") {
      // Navigate to Telugu category hub
      router.push("/telugu-news");
    } else {
      // Navigate to homepage (English default)
      router.push("/");
    }
  }

  return (
    <div className="relative">
      <button
        className="flex h-9 shrink-0 items-center gap-2 border-r border-zinc-200 px-4 text-left font-medium"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{currentLabel}</span>
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
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

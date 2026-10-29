"use client";

import { Check } from "lucide-react";
import type { ArticleTemplate } from "@/types";
import { cn } from "@/lib/utils";

const templates: {
  id: ArticleTemplate;
  name: string;
  desc: string;
  preview: string[];
}[] = [
  {
    id: "template_1",
    name: "Image on Left",
    desc: "Image on the left, content on the right",
    preview: ["Image | Content", "Image | Content"],
  },
  {
    id: "template_2",
    name: "Image on Right",
    desc: "Content on the left, image on the right",
    preview: ["Content | Image", "Content | Image"],
  },
  {
    id: "template_3",
    name: "Magazine Layout",
    desc: "Full image above, article below",
    preview: ["Full Image", "Article Content"],
  },
  {
    id: "template_4",
    name: "Title over Image",
    desc: "Article title over a full image",
    preview: ["Image + Title", "Article"],
  },
];

export function TemplatePicker({
  value,
  onChange,
}: {
  value: ArticleTemplate;
  onChange: (value: ArticleTemplate) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-zinc-800">
        Article Layout
      </label>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => {
          const selected = template.id === value;

          return (
            <button
              className={cn(
                "relative rounded-md border-2 p-4 text-left transition",
                selected
                  ? "border-red-700 bg-red-50 shadow-sm"
                  : "border-zinc-200 hover:border-red-300",
              )}
              key={template.id}
              onClick={() => onChange(template.id)}
              type="button"
            >
              {selected ? (
                <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-red-700 text-white">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : null}
              <div className="grid gap-1 rounded bg-zinc-100 p-3 font-mono text-[11px] font-bold text-zinc-500">
                {template.preview.map((line, index) => (
                  <span key={`${template.id}-${index}`}>{line}</span>
                ))}
              </div>
              <p className="mt-3 text-sm font-black text-zinc-950">
                {template.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {template.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

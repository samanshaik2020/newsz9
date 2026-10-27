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
    name: "ఎడమవైపు చిత్రం",
    desc: "ఎడమవైపు చిత్రం, కుడివైపు వివరాలు",
    preview: ["చిత్రం | వివరాలు", "చిత్రం | వివరాలు"],
  },
  {
    id: "template_2",
    name: "కుడివైపు చిత్రం",
    desc: "ఎడమవైపు వివరాలు, కుడివైపు చిత్రం",
    preview: ["వివరాలు | చిత్రం", "వివరాలు | చిత్రం"],
  },
  {
    id: "template_3",
    name: "పత్రిక నమూనా",
    desc: "పైన పూర్తి చిత్రం, కింద కథనం",
    preview: ["పూర్తి చిత్రం", "కథనం వివరాలు"],
  },
  {
    id: "template_4",
    name: "చిత్రంపై శీర్షిక",
    desc: "పూర్తి చిత్రంపై కథనం శీర్షిక",
    preview: ["చిత్రం + శీర్షిక", "కథనం"],
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
        కథనం ప్రదర్శన నమూనా
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

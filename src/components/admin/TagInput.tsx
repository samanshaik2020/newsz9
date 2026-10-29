"use client";

import { X } from "lucide-react";
import { parseTagKeywords } from "@/lib/tags";

export function TagInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const tags = parseTagKeywords(value);
  return (
    <div className="grid gap-2 text-sm font-bold text-zinc-800">
      <label htmlFor="article-tags">Tags</label>
      <input
        id="article-tags"
        aria-describedby="article-tags-help"
        className="min-h-11 min-w-0 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
        onChange={(event) => onChange(event.target.value)}
        placeholder="politics, technology, local news"
        value={value}
      />
      <p id="article-tags-help" className="text-xs font-normal text-zinc-500">Separate keywords with commas. They will be saved as tags.</p>
      {tags.length > 0 && <div className="flex flex-wrap gap-2">
        {tags.map((tag) => <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700" key={tag.slug || tag.name}>
          {tag.name}
          <button
            aria-label={`Remove tag ${tag.name}`}
            className="text-zinc-500 hover:text-red-600"
            onClick={() => onChange(tags.filter((entry) => entry !== tag).map((entry) => entry.name).join(", "))}
            type="button"
          ><X className="h-3 w-3" aria-hidden="true" /></button>
        </span>)}
      </div>}
    </div>
  );
}

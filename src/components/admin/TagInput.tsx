"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { slugify } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export function TagInput({
  availableTags,
  selectedTagIds,
  onChange,
}: {
  availableTags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id),
  );
  const unselectedTags = availableTags.filter(
    (tag) => !selectedTagIds.includes(tag.id),
  );

  // Filter suggestions based on input
  const suggestions = inputValue.trim()
    ? unselectedTags.filter((tag) =>
        tag.name.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : [];

  function addTag(tagId: string) {
    onChange([...selectedTagIds, tagId]);
    setInputValue("");
  }

  function removeTag(tagId: string) {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  }

  async function createAndAddTag() {
    const name = inputValue.trim();
    if (!name) return;

    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slugify(name) }),
      });

      const payload = (await response.json()) as { tag?: Tag; error?: string };

      if (response.ok && payload.tag) {
        addTag(payload.tag.id);
        // Add to available tags list client-side
        availableTags.push(payload.tag);
      }
    } catch {
      // Silently fail
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="grid gap-2 text-sm font-bold text-zinc-800">
      <span>Tags</span>
      {/* Selected tags */}
      {selectedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"
              key={tag.id}
            >
              {tag.name}
              <button
                className="text-zinc-400 hover:text-red-600"
                onClick={() => removeTag(tag.id)}
                type="button"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {/* Input with suggestions */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            className="min-h-11 flex-1 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
            disabled={isCreating}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (suggestions.length > 0) {
                  addTag(suggestions[0].id);
                } else if (inputValue.trim()) {
                  createAndAddTag();
                }
              }
            }}
            placeholder="Type to search or create a tag..."
            value={inputValue}
          />
          {inputValue.trim() && suggestions.length === 0 ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-950 px-3 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
              disabled={isCreating}
              onClick={createAndAddTag}
              type="button"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              {isCreating ? "Adding..." : "Create"}
            </button>
          ) : null}
        </div>
        {suggestions.length > 0 ? (
          <div className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-md">
            {suggestions.slice(0, 8).map((tag) => (
              <button
                className="flex w-full items-center px-4 py-2 text-left text-sm font-normal text-zinc-700 hover:bg-zinc-50"
                key={tag.id}
                onClick={() => addTag(tag.id)}
                type="button"
              >
                {tag.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { BreakingNewsFormInput, BreakingNewsItem } from "@/types";

const emptyForm: BreakingNewsFormInput = {
  headline: "",
  url: "",
  is_active: true,
  expires_at: "",
};

export function BreakingNewsManager({ items }: { items: BreakingNewsItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState<BreakingNewsFormInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function editItem(item: BreakingNewsItem) {
    setEditingId(item.id);
    setForm({
      headline: item.headline,
      url: item.url ?? "",
      is_active: item.is_active,
      expires_at: item.expires_at?.slice(0, 16) ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveItem() {
    setMessage(null);
    const endpoint = editingId
      ? `/api/admin/breaking-news/${editingId}`
      : "/api/admin/breaking-news";
    const response = await fetch(endpoint, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Breaking news item could not be saved.");
      return;
    }

    setMessage(editingId ? "Breaking news updated." : "Breaking news created.");
    resetForm();
    router.refresh();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this breaking news item?")) return;

    const response = await fetch(`/api/admin/breaking-news/${id}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Breaking news item could not be deleted.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="grid content-start gap-4 rounded-md border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-black">
          {editingId ? "Edit Breaking News" : "New Breaking News"}
        </h2>
        <input
          className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm outline-none focus:border-red-700"
          onChange={(event) =>
            setForm({ ...form, headline: event.target.value })
          }
          placeholder="Ticker headline"
          value={form.headline}
        />
        <input
          className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm outline-none focus:border-red-700"
          onChange={(event) => setForm({ ...form, url: event.target.value })}
          placeholder="/article/story-slug or https://..."
          value={form.url ?? ""}
        />
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <input
            checked={form.is_active}
            onChange={(event) =>
              setForm({ ...form, is_active: event.target.checked })
            }
            type="checkbox"
          />
          Active
        </label>
        <label className="grid gap-2 text-sm font-bold text-zinc-800">
          Expires At
          <input
            className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
            onChange={(event) =>
              setForm({ ...form, expires_at: event.target.value })
            }
            type="datetime-local"
            value={form.expires_at ?? ""}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveItem} type="button">
            {editingId ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {editingId ? "Update" : "Create"}
          </Button>
          {editingId ? (
            <Button onClick={resetForm} type="button" variant="outline">
              Cancel
            </Button>
          ) : null}
        </div>
        {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
      </section>
      <section className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        {items.map((item) => (
          <div
            className="grid gap-3 border-b border-zinc-200 p-4 last:border-b-0 md:grid-cols-[1fr_100px_160px]"
            key={item.id}
          >
            <div>
              <p className="font-bold">{item.headline}</p>
              <p className="text-sm text-zinc-500">{item.url ?? "No link"}</p>
            </div>
            <span className={item.is_active ? "text-sm text-green-700" : "text-sm text-zinc-500"}>
              {item.is_active ? "Active" : "Inactive"}
            </span>
            <div className="flex justify-start gap-2 md:justify-end">
              <Button
                onClick={() => editItem(item)}
                size="sm"
                type="button"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                onClick={() => deleteItem(item.id)}
                size="sm"
                type="button"
                variant="destructive"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

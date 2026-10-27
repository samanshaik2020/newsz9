"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { useConfirmStore } from "@/store/use-confirm-store";
import { useToastStore } from "@/store/use-toast-store";
import type { Category, CategoryFormInput, Language } from "@/types";

const emptyForm: CategoryFormInput = {
  name: "",
  slug: "",
  language: "te",
  description: "",
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const confirmDialog = useConfirmStore((s) => s.open);
  const addToast = useToastStore((s) => s.addToast);
  const [form, setForm] = useState<CategoryFormInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function editCategory(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      language: category.language,
      description: category.description ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveCategory() {
    setMessage(null);
    const endpoint = editingId
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories";
    const response = await fetch(endpoint, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "విభాగాన్ని భద్రపరచలేకపోయాం.");
      return;
    }

    setMessage(editingId ? "విభాగం సవరించబడింది." : "విభాగం సృష్టించబడింది.");
    resetForm();
    router.refresh();
  }

  async function deleteCategory(id: string) {
    const confirmed = await confirmDialog({
      title: "విభాగం తొలగింపు",
      message: "ఈ విభాగాన్ని తొలగిస్తే దాని కథనాలకు విభాగాన్ని తిరిగి కేటాయించాలి. తొలగించాలా?",
      confirmLabel: "తొలగించండి",
      variant: "danger",
    });
    if (!confirmed) return;

    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      addToast(payload.error ?? "విభాగాన్ని తొలగించలేకపోయాం.", "error");
      return;
    }

    addToast("విభాగం తొలగించబడింది.", "success");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="grid content-start gap-4 rounded-md border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-black">
          {editingId ? "విభాగం సవరించండి" : "కొత్త విభాగం"}
        </h2>
        <input
          className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm outline-none focus:border-red-700"
          onChange={(event) =>
            setForm({
              ...form,
              name: event.target.value,
              slug: editingId ? form.slug : slugify(event.target.value),
            })
          }
          placeholder="విభాగం పేరు తెలుగులో"
          value={form.name}
        />
        <input
          className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm outline-none focus:border-red-700"
          onChange={(event) =>
            setForm({ ...form, slug: slugify(event.target.value) })
          }
          placeholder="category-slug"
          value={form.slug}
        />
        <select
          className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm"
          onChange={(event) =>
            setForm({ ...form, language: event.target.value as Language })
          }
          value={form.language}
        >

          <option value="te">తెలుగు</option>
        </select>
        <textarea
          className="min-h-24 rounded-md border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-700"
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
          placeholder="వివరణ"
          value={form.description ?? ""}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveCategory} type="button">
            {editingId ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {editingId ? "మార్చండి" : "సృష్టించండి"}
          </Button>
          {editingId ? (
            <Button onClick={resetForm} type="button" variant="outline">
              రద్దు
            </Button>
          ) : null}
        </div>
        {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
      </section>
      <section className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        {categories.map((category) => (
          <div
            className="grid gap-3 border-b border-zinc-200 p-4 last:border-b-0 md:grid-cols-[1fr_120px_160px]"
            key={category.id}
          >
            <div>
              <p className="font-bold">{category.name}</p>
              <p className="text-sm text-zinc-500">/{category.slug}</p>
            </div>
            <span className="text-sm uppercase text-zinc-500">
              {category.language}
            </span>
            <div className="flex justify-start gap-2 md:justify-end">
              <Button
                onClick={() => editCategory(category)}
                size="sm"
                type="button"
                variant="outline"
              >
                సవరించండి
              </Button>
              <Button
                onClick={() => deleteCategory(category.id)}
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

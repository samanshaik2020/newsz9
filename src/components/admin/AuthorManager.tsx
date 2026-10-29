"use client";
import { authorDisplayName } from "@/lib/authors";

import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import NewsImage from "@/components/NewsImage";
import { getImageSrc } from "@/lib/utils";
import { useConfirmStore } from "@/store/use-confirm-store";
import { useToastStore } from "@/store/use-toast-store";
import type { Author } from "@/types";

type AuthorFormData = {
  name: string;
  email: string;
  bio: string;
  avatar_url: string;
  role: "editor" | "reporter" | "bot";
  credentials: string;
  expertise: string;
};

const emptyForm: AuthorFormData = {
  name: "",
  email: "",
  bio: "",
  avatar_url: "",
  role: "reporter",
  credentials: "",
  expertise: "",
};

export function AuthorManager({ authors: initialAuthors }: { authors: Author[] }) {
  const confirmDialog = useConfirmStore((s) => s.open);
  const addToast = useToastStore((s) => s.addToast);
  const [authors, setAuthors] = useState<Author[]>(initialAuthors);
  const [form, setForm] = useState<AuthorFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  async function uploadPhoto(file?: File) {
    if (!file) return;
    setUploadingPhoto(true); setMessage(null);
    try {
      const upload = new FormData(); upload.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: upload });
      const payload = await response.json();
      if (!response.ok || !payload.publicUrl) throw new Error();
      setForm((previous) => ({ ...previous, avatar_url: payload.publicUrl }));
    } catch { setMessage("Could not upload the photo. Please try again."); }
    finally { setUploadingPhoto(false); }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const isEdit = editingId !== null;
    const endpoint = isEdit
      ? `/api/admin/authors/${editingId}`
      : "/api/admin/authors";

    const response = await fetch(endpoint, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as {
      author?: Author;
      error?: string;
    };

    setIsSaving(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Could not save the author.");
      return;
    }

    if (payload.author) {
      if (isEdit) {
        setAuthors(
          authors.map((a) => (a.id === editingId ? payload.author! : a)),
        );
      } else {
        setAuthors([payload.author, ...authors]);
      }
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setMessage(isEdit ? "Author details updated." : "Author added.");
  }

  async function handleDelete(id: string) {
    const confirmed = await confirmDialog({
      title: "Delete Author",
      message: "Delete this author? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    const response = await fetch(`/api/admin/authors/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setAuthors(authors.filter((a) => a.id !== id));
      addToast("Author deleted.", "success");
    } else {
      addToast("Could not delete the author.", "error");
    }
  }

  function startEdit(author: Author) {
    setForm({
      name: author.name,
      email: author.email ?? "",
      bio: author.bio ?? "",
      avatar_url: author.avatar_url ?? "",
      role: author.role,
      credentials: author.credentials ?? "",
      expertise: author.expertise ?? "",
    });
    setEditingId(author.id);
    setShowForm(true);
    setMessage(null);
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setMessage(null);
  }

  return (
    <div className="grid gap-6">
      {/* Author list */}
      <div className="rounded-md border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4">
          <h2 className="font-bold text-zinc-800">
            {authors.length} Author{authors.length !== 1 ? "s" : ""}
          </h2>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm(emptyForm);
            }}
            size="sm"
            type="button"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Add Author
          </Button>
        </div>
        <div className="divide-y divide-zinc-100">
          {authors.map((author) => (
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              key={author.id}
            >
              <div className="min-w-0">
                <p className="font-bold text-zinc-900">{authorDisplayName(author.name)}</p>
                <p className="text-sm text-zinc-500">
                  {author.email} · <span className="capitalize">{{ reporter: "Reporter", editor: "Editor", bot: "Automated Assistant" }[author.role]}</span>
                </p>
                {author.bio ? (
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
                    {author.bio}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  className="grid h-8 w-8 place-items-center rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  onClick={() => startEdit(author)}
                  type="button"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  className="grid h-8 w-8 place-items-center rounded border border-zinc-200 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(author.id)}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          {authors.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No authors yet. Add an author using the form above.
            </p>
          ) : null}
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm ? (
        <div className="rounded-md border border-zinc-200 bg-white p-5">
          <h3 className="text-lg font-bold">
            {editingId ? "Edit Author Details" : "New Author"}
          </h3>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                Name *
                <input
                  className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Author name in Telugu"
                  value={form.name}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                Email *
                <input
                  className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="author@newsz9.com"
                  type="email"
                  value={form.email}
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                Role
                <select
                  className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-normal"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as "editor" | "reporter" | "bot",
                    })
                  }
                  value={form.role}
                >
                  <option value="reporter">Reporter</option>
                  <option value="editor">Editor</option>
                  <option value="bot">Automated Assistant</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                Original Photo URL
                <input
                  className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-normal outline-none focus:border-red-700"
                  onChange={(e) =>
                    setForm({ ...form, avatar_url: e.target.value })
                  }
                  placeholder="https://..."
                  value={form.avatar_url}
                />
              </label>
            </div>
            <label className="grid gap-2">Upload Original Photo<input className="rounded border p-3" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingPhoto} onChange={(e) => uploadPhoto(e.target.files?.[0])} /></label>
            {uploadingPhoto && <p role="status">Uploading photo…</p>}
            {getImageSrc(form.avatar_url) && <NewsImage src={getImageSrc(form.avatar_url)!} width={96} height={96} alt="Author photo preview" className="h-24 w-24 rounded-full object-cover" />}
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Biography
              <textarea
                className="min-h-20 rounded-md border border-zinc-300 px-4 py-3 text-sm font-normal outline-none focus:border-red-700"
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Accurate biography in Telugu"
                value={form.bio}
              />
            </label>
            <label className="grid gap-2">Credentials — enter verified details only<input className="min-h-11 rounded border p-3" value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} /></label>
            <label className="grid gap-2">Areas of expertise in Telugu<input className="min-h-11 rounded border p-3" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} /></label>
            <p className="text-sm text-zinc-600">Provide a Telugu name and an accurate biography. Verify medical credentials before recording them. Use an original photo with the permission of the person shown.</p>
            <div className="flex items-center gap-3">
              <Button disabled={isSaving || uploadingPhoto} onClick={handleSave} type="button">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {isSaving
                  ? "Saving…"
                  : editingId
                    ? "Save Author Details"
                    : "Create Author"}
              </Button>
              <Button onClick={cancelEdit} type="button" variant="outline">
                Cancel
              </Button>
              {message ? (
                <p className="text-sm font-medium text-zinc-700" role="status">
                  {message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {message && !showForm ? (
        <p className="text-sm font-medium text-zinc-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

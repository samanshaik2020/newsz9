import { AuthorManager } from "@/components/admin/AuthorManager";
import { maybeCreateServiceClient } from "@/lib/supabase";
import type { Author } from "@/types";

export default async function AdminAuthorsPage() {
  const supabase = maybeCreateServiceClient();
  let authors: Author[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("authors")
      .select("*")
      .order("name", { ascending: true });
    authors = (data ?? []) as Author[];
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-black">Authors</h1>
      <AuthorManager authors={authors} />
    </div>
  );
}

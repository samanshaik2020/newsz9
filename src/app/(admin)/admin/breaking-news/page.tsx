import { BreakingNewsManager } from "@/components/admin/BreakingNewsManager";
import { getAdminBreakingNews } from "@/lib/data";

export default async function AdminBreakingNewsPage() {
  const items = await getAdminBreakingNews();

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-black">Breaking News</h1>
      <BreakingNewsManager items={items} />
    </div>
  );
}

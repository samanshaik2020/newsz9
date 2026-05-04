import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/data";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-black">Categories</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}

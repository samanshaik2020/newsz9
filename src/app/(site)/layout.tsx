import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getCategories } from "@/lib/data";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}

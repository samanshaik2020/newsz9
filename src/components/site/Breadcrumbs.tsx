import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ముఖపుట",
        item: process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.href
          ? {
              item: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com"}${item.href}`,
            }
          : {}),
      })),
    ],
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <nav
        aria-label="పేజీ మార్గం"
        className="flex items-center gap-1.5 overflow-x-auto text-sm text-zinc-500"
      >
        <Link
          aria-label="ముఖపుట"
          className="shrink-0 text-zinc-400 hover:text-red-600"
          href="/"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
        </Link>
        {items.map((item, index) => (
          <span className="flex items-center gap-1.5" key={item.label}>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-zinc-300"
              aria-hidden="true"
            />
            {item.href && index < items.length - 1 ? (
              <Link
                className="shrink-0 font-medium hover:text-red-600"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span className="truncate font-semibold text-zinc-700">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

import { Newspaper, PanelLeft, Radio, Tags, Users } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { isAdminAuthEnabled } from "@/lib/admin-auth";
import { LogoutButton } from "./LogoutButton";

const links = [
  { href: "/admin/content-audit", label: "కథనాల నాణ్యత", icon: Newspaper },
  { href: "/admin", label: "నిర్వహణ పటం", icon: PanelLeft },
  { href: "/admin/articles", label: "కథనాలు", icon: Newspaper },
  { href: "/admin/categories", label: "విభాగాలు", icon: Tags },
  { href: "/admin/authors", label: "రచయితలు", icon: Users },
  { href: "/admin/breaking-news", label: "తాజా సమాచారం", icon: Radio },
];

export function AdminSidebar() {
  return (
    <aside className="admin-nav border-r border-zinc-200 bg-zinc-950 px-3 py-4 text-white md:min-h-screen md:w-64">
      <Link
        aria-label="న్యూస్‌జెడ్‌9 ముఖపుట"
        className="mx-3 block max-w-48 rounded-sm bg-white p-2"
        href="/"
      >
        <BrandLogo />
      </Link>
      <nav className="mt-6 grid gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
            href={href}
            key={href}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      {isAdminAuthEnabled() ? (
        <div className="mt-8 px-3">
          <LogoutButton />
        </div>
      ) : null}
    </aside>
  );
}

import { Newspaper, PanelLeft, Radio, Tags } from "lucide-react";
import Link from "next/link";
import { isAdminAuthEnabled } from "@/lib/admin-auth";
import { LogoutButton } from "./LogoutButton";

const links = [
  { href: "/admin", label: "Dashboard", icon: PanelLeft },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/breaking-news", label: "Breaking News", icon: Radio },
];

export function AdminSidebar() {
  return (
    <aside className="admin-nav border-r border-zinc-200 bg-zinc-950 px-3 py-4 text-white md:min-h-screen md:w-64">
      <Link className="site-title block px-3 text-2xl font-black" href="/">
        newsz9
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

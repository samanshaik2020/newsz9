import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t-2 border-zinc-950 bg-white text-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link className="site-title text-3xl font-black text-zinc-950" href="/">
            THE NEWSZ9
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
            Bilingual news for English and Telugu readers, built for fast
            publishing, clean reading, and SEO-first discovery.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase text-zinc-950">
            Company
          </h2>
          <div className="mt-3 grid gap-2 text-sm font-medium text-zinc-600">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase text-zinc-950">
            Newsroom
          </h2>
          <div className="mt-3 grid gap-2 text-sm font-medium text-zinc-600">
            <Link href="/admin">Admin</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
            <span>newsz9.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

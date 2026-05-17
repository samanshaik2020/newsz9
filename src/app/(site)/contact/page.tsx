import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us | THE NEWSZ9",
  description: "Get in touch with THE NEWSZ9 editorial team.",
};

export default async function ContactPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header categories={categories} />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <article className="article-body">
          <h1 className="mb-8 text-4xl font-black">Contact Us</h1>
          
          <p>
            We value your feedback and inquiries. Whether you have a news tip, a question about our coverage, 
            or are interested in advertising opportunities, we&apos;re here to listen.
          </p>

          <h2>Get in Touch</h2>
          
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
              <h3 className="mb-4 text-xl font-bold">Editorial Team</h3>
              <p className="mb-2 text-sm text-zinc-600">For news tips, press releases, and editorial feedback:</p>
              <a href="mailto:editor@newsz9.com" className="font-bold text-red-700 hover:underline">editor@newsz9.com</a>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
              <h3 className="mb-4 text-xl font-bold">Business & Advertising</h3>
              <p className="mb-2 text-sm text-zinc-600">For partnerships, sponsorships, and ad placements:</p>
              <a href="mailto:business@newsz9.com" className="font-bold text-red-700 hover:underline">business@newsz9.com</a>
            </div>
          </div>

          <h2 className="mt-12">Mailing Address</h2>
          <p>
            <strong>THE NEWSZ9 Media</strong><br />
            Hyderabad, Telangana<br />
            India
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}

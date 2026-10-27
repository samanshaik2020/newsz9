import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { publisherEnglish as publisher } from "@/lib/site-config";

const title = "Contact Us | NEWSZ9";
const description = "Contact the NEWSZ9 publisher with news tips, correction requests, complaints, privacy questions and copyright concerns.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/contact-us" },
  openGraph: { title, description, locale: "en_IN", siteName: "NEWSZ9", type: "website", url: "/contact-us" },
  twitter: { card: "summary", title, description },
};
export default function Page() {
  return <div className="essential-page mx-auto max-w-3xl px-4 py-10" lang="en">
    <h1 className="text-4xl font-bold">Contact Us</h1>
    <p className="mt-5 text-lg leading-8">Send us a news tip, correction, copyright concern, privacy request or other enquiry. For corrections, include the article link and supporting evidence.</p>
    <address className="mt-6 grid gap-3 rounded-lg bg-zinc-50 p-6 not-italic">
      <p>Publisher: {publisher.name}</p><p>Location: {publisher.location}</p>
      <a className="text-red-700 underline" href={`mailto:${publisher.email}`}>Email: {publisher.email}</a>
      <a className="text-red-700 underline" href={`tel:+91${publisher.phone}`}>Telephone: {publisher.phone}</a>
    </address>
    <p className="mt-4 text-zinc-600">Please contact us by email or telephone before sending documents by post. A full street address is not published here.</p>
    <ContactForm />
  </div>;
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import { NEWSZ9_MARK } from "@/lib/branding";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";
const mallanna = localFont({ src: "../../public/fonts/Mallanna-Regular.ttf", variable: "--font-mallanna", weight: "400", display: "swap" });
export const metadata: Metadata = {
  title: "NEWSZ9 | Latest Telugu News",
  description: "Telugu news and background on Andhra Pradesh, Telangana, national affairs, sports, cinema, technology, and health.",
  metadataBase: new URL(SITE_URL),
  icons: { icon: NEWSZ9_MARK.src, apple: NEWSZ9_MARK.src },
  alternates: { types: { "application/rss+xml": [{ url: "/feed.xml", title: "NEWSZ9 News Feed" }] } },
  openGraph: { title: "NEWSZ9 | Latest Telugu News", description: "News and background for Telugu readers.", siteName: "NEWSZ9", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: "NEWSZ9 | Latest Telugu News" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large" } },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${mallanna.variable} antialiased`}>{children}</body></html>;
}

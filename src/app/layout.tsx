import type { Metadata } from "next";
import localFont from "next/font/local";
import { NEWSZ9_MARK } from "@/lib/branding";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";
const mallanna = localFont({ src: "../../public/fonts/Mallanna-Regular.ttf", variable: "--font-mallanna", weight: "400", display: "swap" });
export const metadata: Metadata = {
  title: "న్యూస్‌జెడ్‌9 | తాజా తెలుగు వార్తలు",
  description: "ఆంధ్రప్రదేశ్, తెలంగాణ, జాతీయం, క్రీడలు, సినిమా, సాంకేతికత, ఆరోగ్యంపై తెలుగు వార్తలు, నేపథ్య వివరాలు.",
  metadataBase: new URL(SITE_URL),
  icons: { icon: NEWSZ9_MARK.src, apple: NEWSZ9_MARK.src },
  alternates: { types: { "application/rss+xml": [{ url: "/feed.xml", title: "న్యూస్‌జెడ్‌9 వార్తా ఫీడ్" }] } },
  openGraph: { title: "న్యూస్‌జెడ్‌9 | తాజా తెలుగు వార్తలు", description: "తెలుగు పాఠకుల కోసం వార్తలు, నేపథ్య వివరాలు.", siteName: "న్యూస్‌జెడ్‌9", type: "website", locale: "te_IN" },
  twitter: { card: "summary_large_image", title: "న్యూస్‌జెడ్‌9 | తాజా తెలుగు వార్తలు" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large" } },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="te"><body className={`${mallanna.variable} antialiased`}>{children}</body></html>;
}

import type { Metadata } from "next";
import { Inter, Lora, Mallanna, Montserrat, Roboto, Roboto_Condensed } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mallanna = Mallanna({
  variable: "--font-mallanna",
  subsets: ["telugu"],
  weight: "400",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
});


export const metadata: Metadata = {
  title: "newsz9 | English & Telugu News",
  description:
    "Fast bilingual news for English and Telugu readers across national, regional, business, sports, and technology coverage.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com",
  ),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "NEWSZ9 RSS Feed" }],
    },
  },
  openGraph: {
    title: "NEWSZ9 | English & Telugu News",
    description:
      "Fast bilingual news for English and Telugu readers across national, regional, business, sports, and technology coverage.",
    siteName: "NEWSZ9",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "NEWSZ9 — English & Telugu News",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEWSZ9 | English & Telugu News",
    description:
      "Fast bilingual news for English and Telugu readers.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mallanna&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${mallanna.variable} ${lora.variable} ${montserrat.variable} ${roboto.variable} ${robotoCondensed.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

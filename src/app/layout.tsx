import type { Metadata } from "next";
import { Inter, Mallanna, Montserrat, Roboto, Roboto_Condensed } from "next/font/google";
import Script from "next/script";
import { NEWSZ9_MARK } from "@/lib/branding";
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
  icons: {
    icon: {
      url: NEWSZ9_MARK.src,
      type: "image/jpeg",
      sizes: `${NEWSZ9_MARK.width}x${NEWSZ9_MARK.height}`,
    },
    apple: NEWSZ9_MARK.src,
  },
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
  },
  twitter: {
    card: "summary_large_image",
    title: "NEWSZ9 | English & Telugu News",
    description:
      "Fast bilingual news for English and Telugu readers.",
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
        <script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7139265156534550"
        />
      </head>
      <body
        className={`${inter.variable} ${mallanna.variable} ${montserrat.variable} ${roboto.variable} ${robotoCondensed.variable} antialiased`}
      >
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PV9MBW84');`,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PV9MBW84"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  );
}

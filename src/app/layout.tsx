import type { Metadata } from "next";
import { Inter, Lora, Montserrat, Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoTelugu = Noto_Sans_Telugu({
  variable: "--font-noto-telugu",
  subsets: ["telugu"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "newsz9 | English & Telugu News",
  description:
    "Fast bilingual news for English and Telugu readers across national, regional, business, sports, and technology coverage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${lora.variable} ${montserrat.variable} ${notoTelugu.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  summary?: string | null;
}

const platforms = [
  {
    name: "WhatsApp",
    label: "WA",
    color: "bg-green-600 hover:bg-green-700",
    href: (url: string, title: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: "X",
    label: "X",
    color: "bg-zinc-900 hover:bg-zinc-950",
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    label: "FB",
    color: "bg-blue-600 hover:bg-blue-700",
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "LinkedIn",
    label: "in",
    color: "bg-blue-700 hover:bg-blue-800",
    href: (url: string, title: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
] as const;

export function ShareButtons({ url, title, summary }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
        Share
      </span>
      {platforms.map((platform) => (
        <a
          aria-label={`Share on ${platform.name}`}
          className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white transition-colors ${platform.color}`}
          href={platform.href(url, title)}
          key={platform.name}
          rel="noopener noreferrer"
          target="_blank"
        >
          {platform.label}
        </a>
      ))}
      <button
        aria-label="Copy link"
        className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
          copied
            ? "bg-green-600 text-white"
            : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
        }`}
        onClick={copyLink}
        type="button"
      >
        <Link2 className="h-4 w-4" aria-hidden="true" />
      </button>
      {copied ? (
        <span className="text-xs font-semibold text-green-600">Copied!</span>
      ) : null}
    </div>
  );
}

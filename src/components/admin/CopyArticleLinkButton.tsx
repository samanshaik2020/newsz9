"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/store/use-toast-store";

export function CopyArticleLinkButton({ slug }: { slug: string }) {
  const addToast = useToastStore((state) => state.addToast);
  const [copied, setCopied] = useState(false);

  async function writeToClipboard(value: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.readOnly = true;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const copiedText = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copiedText) {
      throw new Error("Copy command failed");
    }
  }

  async function copyLink() {
    const url = new URL(`/article/${slug}`, window.location.origin).toString();

    try {
      await writeToClipboard(url);
      setCopied(true);
      addToast("కథనం లింకు కాపీ అయింది.", "success");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      addToast("కథనం లింకు కాపీ కాలేదు.", "error");
    }
  }

  return (
    <Button
      aria-label="కథనం లింకు కాపీ చేయండి"
      onClick={copyLink}
      size="sm"
      type="button"
      variant="outline"
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "కాపీ అయింది" : "లింకు కాపీ"}
    </Button>
  );
}

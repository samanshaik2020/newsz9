import Image from "next/image";
import { NEWSZ9_MARK, NEWSZ9_WORDMARK } from "@/lib/branding";

export function BrandLogo({
  variant = "wordmark",
  className = "block h-auto w-full",
  priority = false,
}: {
  variant?: "wordmark" | "mark";
  className?: string;
  priority?: boolean;
}) {
  const logo = variant === "mark" ? NEWSZ9_MARK : NEWSZ9_WORDMARK;

  return (
    <Image
      alt="NEWSZ9"
      className={className}
      height={logo.height}
      priority={priority}
      src={logo.src}
      unoptimized
      width={logo.width}
    />
  );
}

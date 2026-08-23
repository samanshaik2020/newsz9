import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedAuthor({
  className,
  inverse = false,
  name,
}: {
  className?: string;
  inverse?: boolean;
  name: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 font-semibold",
        inverse ? "text-white" : "text-zinc-700",
        className,
      )}
    >
      <span className="truncate">By {name}</span>
      <span
        aria-label="Verified NEWSZ9 author"
        className="inline-flex shrink-0"
        title="Verified NEWSZ9 author"
      >
        <BadgeCheck
          aria-hidden="true"
          className={cn(
            "h-4 w-4",
            inverse ? "fill-white text-zinc-950" : "fill-red-700 text-white",
          )}
        />
      </span>
    </span>
  );
}


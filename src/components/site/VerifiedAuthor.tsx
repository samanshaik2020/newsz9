import Link from "next/link";
import { cn, containsTeluguText } from "@/lib/utils";
import { authorDisplayName, publicAuthorName } from "@/lib/authors";
// Retained name for template compatibility. No verification claim is made.
export function VerifiedAuthor({ className, inverse = false, name, authorId }: { className?: string; inverse?: boolean; name: string; authorId?: string | null }) {
  name = publicAuthorName(name);
  return <Link className={cn("inline-flex min-w-0 font-semibold hover:underline", inverse ? "text-white" : "text-zinc-700", className)} href={authorId && containsTeluguText(name) ? `/author/${authorId}` : "/about-us"}>
    <span className="truncate" lang="en">By: {containsTeluguText(name) ? authorDisplayName(name) : "Editorial Team"}</span>
  </Link>;
}

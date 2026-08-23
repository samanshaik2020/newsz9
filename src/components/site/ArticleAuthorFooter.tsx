import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";
import { VerifiedAuthor } from "./VerifiedAuthor";

export function ArticleAuthorFooter({ article }: { article: Article }) {
  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-5 text-sm text-zinc-500">
      <VerifiedAuthor name={article.authors?.name ?? "newsz9 Desk"} />
      <time dateTime={article.published_at ?? article.created_at}>
        {formatDate(article.published_at ?? article.created_at)}
      </time>
    </footer>
  );
}


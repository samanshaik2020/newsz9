import type { ComponentType } from "react";
import type { Article } from "@/types";
import { containsTeluguText } from "@/lib/utils";
import Template1 from "./Template1_SplitLeft";
import Template2 from "./Template2_SplitRight";
import Template3 from "./Template3_Magazine";
import Template4 from "./Template4_HeroOverlay";

const templates: Record<string, ComponentType<{ article: Article }>> = {
  template_1: Template1,
  template_2: Template2,
  template_3: Template3,
  template_4: Template4,
};

export default function TemplateRenderer({ article }: { article: Article }) {
  const Component = templates[article.template] ?? Template1;

  const isTelugu =
    article.language === "te" ||
    containsTeluguText(article.title) ||
    containsTeluguText(article.summary) ||
    containsTeluguText(article.content);

  return (
    <div className={isTelugu ? "telugu-article" : undefined} lang={isTelugu ? "te" : "en"}>
      <Component article={article} />
    </div>
  );
}

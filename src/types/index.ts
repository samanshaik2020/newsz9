export type Language = "en" | "te";

export type ArticleTemplate =
  | "template_1"
  | "template_2"
  | "template_3"
  | "template_4";

export type ArticleStatus = "draft" | "review" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  language: Language;
  description?: string | null;
}

export interface Author {
  id: string;
  name: string;
  email?: string;
  bio?: string | null;
  avatar_url?: string | null;
  role: "editor" | "reporter" | "bot";
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  enable_gallery?: boolean;
  gallery_images?: string[] | null;
  template: ArticleTemplate;
  language: Language;
  status: ArticleStatus;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
  source_url?: string | null;
  category_id?: string | null;
  author_id?: string | null;
  categories?: Category | null;
  authors?: Author | null;
}

export interface BreakingNewsItem {
  id: string;
  headline: string;
  url: string | null;
  is_active: boolean;
  expires_at?: string | null;
  created_at: string;
}

export type ArticleFormInput = Pick<
  Article,
  | "title"
  | "slug"
  | "summary"
  | "content"
  | "cover_image"
  | "enable_gallery"
  | "gallery_images"
  | "language"
  | "template"
  | "status"
  | "category_id"
> & {
  source_url?: string | null;
};

export type CategoryFormInput = Pick<
  Category,
  "name" | "slug" | "language" | "description"
>;

export type BreakingNewsFormInput = Pick<
  BreakingNewsItem,
  "headline" | "url" | "is_active" | "expires_at"
>;

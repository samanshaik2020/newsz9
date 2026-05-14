import Image from "next/image";
import { getImageSrc } from "@/lib/utils";
import type { Article } from "@/types";

export function ArticleGallery({
  article,
  className = "",
}: {
  article: Article;
  className?: string;
}) {
  const images = article.enable_gallery
    ? (article.gallery_images ?? [])
        .map((image) => getImageSrc(image))
        .filter((image): image is string => Boolean(image))
    : [];

  if (!images.length) return null;

  return (
    <section className={`grid gap-3 ${className}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image, index) => (
          <figure
            className={
              index === 0 && images.length > 2
                ? "grid gap-2 sm:col-span-2"
                : "grid gap-2"
            }
            key={`${image}-${index}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-zinc-100">
              <Image
                alt={`${article.title} image ${index + 1}`}
                className="object-cover"
                fill
                sizes={
                  index === 0 && images.length > 2
                    ? "(min-width: 768px) 760px, 100vw"
                    : "(min-width: 768px) 380px, 100vw"
                }
                src={image}
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

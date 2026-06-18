import { cn } from "@/lib/utils";

const adSizes = {
  billboard: "min-h-[180px] lg:min-h-[250px]",
  leaderboard: "min-h-[90px]",
  mobile: "min-h-[100px] max-w-[320px]",
};

export function AdBanner({
  className,
  size = "leaderboard",
}: {
  className?: string;
  size?: keyof typeof adSizes;
}) {
  return (
    <div
      aria-label="Advertisement"
      className={cn("ad-slot w-full rounded-sm", adSizes[size], className)}
      role="complementary"
    >
      Advertisement
    </div>
  );
}

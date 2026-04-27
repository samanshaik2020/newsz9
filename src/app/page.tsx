import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-card">
          <Languages className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-normal">
            Next.js project ready
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            App Router, TypeScript, Tailwind CSS, shadcn/ui foundations,
            Zustand, Lucide React, Inter, and Noto Telugu are wired in.
          </p>
          <p className="font-[var(--font-noto-telugu)] text-lg leading-8">
            తెలుగు అక్షరాలు స్పష్టంగా కనిపించేలా ఫాంట్ సిద్ధంగా ఉంది.
          </p>
        </div>
        <div>
          <Button>Start building</Button>
        </div>
      </section>
    </main>
  );
}

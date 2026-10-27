import type { Metadata } from "next";
import { PolicyPage } from "@/components/site/PolicyPage";
import { policies } from "@/lib/policy-content";
const policy = policies["corrections-policy"];
const title = policy.title + " | NEWSZ9";
export const metadata: Metadata = {
  title, description: policy.intro, alternates: { canonical: "/corrections-policy" },
  openGraph: { title, description: policy.intro, locale: "en_IN", siteName: "NEWSZ9", type: "website", url: "/corrections-policy" },
  twitter: { card: "summary", title, description: policy.intro },
};
export default function Page() { return <PolicyPage slug="corrections-policy" />; }

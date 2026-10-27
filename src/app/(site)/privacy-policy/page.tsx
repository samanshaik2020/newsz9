import type { Metadata } from "next";
import { PolicyPage } from "@/components/site/PolicyPage";
import { policies } from "@/lib/policy-content";
const policy = policies["privacy-policy"];
const title = policy.title + " | NEWSZ9";
export const metadata: Metadata = {
  title, description: policy.intro, alternates: { canonical: "/privacy-policy" },
  openGraph: { title, description: policy.intro, locale: "en_IN", siteName: "NEWSZ9", type: "website", url: "/privacy-policy" },
  twitter: { card: "summary", title, description: policy.intro },
};
export default function Page() { return <PolicyPage slug="privacy-policy" />; }

import type { Metadata } from "next";
import { PolicyPage } from "@/components/site/PolicyPage";
import { policies } from "@/lib/policy-content";
const policy = policies["terms-and-conditions"];
const title = policy.title + " | NEWSZ9";
export const metadata: Metadata = {
  title, description: policy.intro, alternates: { canonical: "/terms-and-conditions" },
  openGraph: { title, description: policy.intro, locale: "en_IN", siteName: "NEWSZ9", type: "website", url: "/terms-and-conditions" },
  twitter: { card: "summary", title, description: policy.intro },
};
export default function Page() { return <PolicyPage slug="terms-and-conditions" />; }

import type { Metadata } from "next";
import { PolicyPage } from "@/components/site/PolicyPage";
import { policies } from "@/lib/policy-content";
const policy = policies["grievance"];
const title = policy.title + " | NEWSZ9";
export const metadata: Metadata = {
  title, description: policy.intro, alternates: { canonical: "/grievance" },
  openGraph: { title, description: policy.intro, locale: "en_IN", siteName: "NEWSZ9", type: "website", url: "/grievance" },
  twitter: { card: "summary", title, description: policy.intro },
};
export default function Page() { return <PolicyPage slug="grievance" />; }

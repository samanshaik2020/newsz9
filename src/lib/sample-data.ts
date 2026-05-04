import type { Article, BreakingNewsItem, Category } from "@/types";

export const categories: Category[] = [
  { id: "cat-national", name: "National", slug: "national", language: "en" },
  { id: "cat-politics", name: "Politics", slug: "politics", language: "en" },
  { id: "cat-business", name: "Business", slug: "business", language: "en" },
  { id: "cat-sports", name: "Sports", slug: "sports", language: "en" },
  {
    id: "cat-technology",
    name: "Technology",
    slug: "technology",
    language: "en",
  },
  {
    id: "cat-telugu",
    name: "Telugu News",
    slug: "telugu-news",
    language: "te",
  },
  {
    id: "cat-andhra",
    name: "Andhra Pradesh",
    slug: "andhra-pradesh",
    language: "te",
  },
  {
    id: "cat-telangana",
    name: "Telangana",
    slug: "telangana",
    language: "te",
  },
];

const author = {
  id: "author-newsbot",
  name: "NewsBot",
  email: "bot@newsz9.com",
  role: "bot" as const,
};

const imageBase = "https://images.unsplash.com";

export const articles: Article[] = [
  {
    id: "article-1",
    title: "Centre Announces New Digital Public Services Push",
    slug: "centre-announces-new-digital-public-services-push",
    summary:
      "The latest initiative focuses on faster citizen services, regional-language access, and tighter coordination across states.",
    content:
      "<p>The government said the new programme will bring more public services online while improving regional language support for citizens across India.</p><p>Officials said the first phase will focus on commonly used services, faster verification, and dashboards for state-level implementation.</p><p>Policy observers said the rollout will be watched closely for privacy safeguards and last-mile access in rural districts.</p>",
    cover_image: `${imageBase}/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80`,
    template: "template_4",
    language: "en",
    status: "published",
    views: 18420,
    published_at: "2026-05-04T04:30:00.000Z",
    created_at: "2026-05-04T04:10:00.000Z",
    categories: categories[0],
    authors: author,
  },
  {
    id: "article-2",
    title: "Telangana Startup Hub Sees Surge in AI Tools",
    slug: "telangana-startup-hub-sees-surge-in-ai-tools",
    summary:
      "Founders in Hyderabad are building automation tools for commerce, health operations, and local-language support.",
    content:
      "<p>Hyderabad's startup ecosystem is seeing a sharp increase in AI-led products built for Indian business workflows.</p><p>Investors say the most promising teams are focusing on practical tools rather than broad consumer apps.</p><p>Several companies are also experimenting with Telugu and Hindi interfaces to widen adoption beyond metro users.</p>",
    cover_image: `${imageBase}/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80`,
    template: "template_1",
    language: "en",
    status: "published",
    views: 12690,
    published_at: "2026-05-03T11:15:00.000Z",
    created_at: "2026-05-03T10:30:00.000Z",
    categories: categories[4],
    authors: author,
  },
  {
    id: "article-3",
    title: "AP Districts Prepare for Early Monsoon Review",
    slug: "ap-districts-prepare-for-early-monsoon-review",
    summary:
      "Officials are reviewing reservoirs, crop advisories, and emergency response planning ahead of seasonal rains.",
    content:
      "<p>Andhra Pradesh district administrations have begun early monsoon preparedness reviews with irrigation and agriculture departments.</p><p>The planning includes water storage checks, crop advisory updates, and coordination with local emergency response teams.</p><p>Farmers' groups have asked officials to publish district-wise advisories in Telugu for faster reach.</p>",
    cover_image: `${imageBase}/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80`,
    template: "template_3",
    language: "en",
    status: "published",
    views: 9210,
    published_at: "2026-05-03T07:45:00.000Z",
    created_at: "2026-05-03T07:10:00.000Z",
    categories: categories[6],
    authors: author,
  },
  {
    id: "article-4",
    title: "Markets Open Higher as Banking Stocks Gain",
    slug: "markets-open-higher-as-banking-stocks-gain",
    summary:
      "Benchmark indices moved up in early trade as investors tracked banking earnings and global cues.",
    content:
      "<p>Indian equity benchmarks opened higher, led by gains in banking and financial services counters.</p><p>Analysts said investors are watching earnings commentary for credit growth, margins, and asset quality signals.</p><p>Broader markets also traded firm, though dealers cautioned that global risk sentiment remains uneven.</p>",
    cover_image: `${imageBase}/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80`,
    template: "template_2",
    language: "en",
    status: "published",
    views: 7104,
    published_at: "2026-05-02T05:20:00.000Z",
    created_at: "2026-05-02T05:00:00.000Z",
    categories: categories[2],
    authors: author,
  },
  {
    id: "article-5",
    title: "India Squad Begins Final Training Block",
    slug: "india-squad-begins-final-training-block",
    summary:
      "Coaches are balancing match simulation with recovery before a packed international schedule.",
    content:
      "<p>The Indian squad has started its final training block with a focus on fitness, fielding intensity, and role clarity.</p><p>Team staff are expected to rotate workloads carefully as players return from a busy domestic calendar.</p><p>Selectors are watching form and flexibility before the final playing combination is locked.</p>",
    cover_image: `${imageBase}/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80`,
    template: "template_3",
    language: "en",
    status: "published",
    views: 14880,
    published_at: "2026-05-01T14:00:00.000Z",
    created_at: "2026-05-01T13:10:00.000Z",
    categories: categories[3],
    authors: author,
  },
  {
    id: "article-6",
    title: "తెలుగు పాఠకుల కోసం కొత్త స్థానిక వార్తల విభాగం",
    slug: "telugu-local-news-section-launches",
    summary:
      "న్యూస్‌జెడ్9 తెలుగు పాఠకుల కోసం స్థానిక వార్తలు, రాజకీయాలు, రాష్ట్ర నవీకరణలను వేగంగా అందించనుంది.",
    content:
      "<p>తెలుగు పాఠకులకు వేగంగా, స్పష్టంగా వార్తలు అందించేందుకు న్యూస్‌జెడ్9 ప్రత్యేక స్థానిక విభాగాన్ని సిద్ధం చేస్తోంది.</p><p>ఆంధ్రప్రదేశ్, తెలంగాణ, జాతీయ వార్తలను వర్గాల వారీగా చదవడానికి కొత్త అనుభవం రూపొందించబడుతోంది.</p><p>ప్రాంతీయ భాషా మద్దతు, శోధన, మొబైల్ పఠన అనుభవం మొదటి దశలో ప్రధానంగా ఉంటాయి.</p>",
    cover_image: `${imageBase}/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80`,
    template: "template_1",
    language: "te",
    status: "published",
    views: 11350,
    published_at: "2026-04-30T09:30:00.000Z",
    created_at: "2026-04-30T09:00:00.000Z",
    categories: categories[5],
    authors: author,
  },
];

export const breakingNews: BreakingNewsItem[] = [
  {
    id: "breaking-1",
    headline: "Digital public services push announced with regional language focus",
    url: "/article/centre-announces-new-digital-public-services-push",
    is_active: true,
    created_at: "2026-05-04T04:30:00.000Z",
  },
  {
    id: "breaking-2",
    headline: "Markets open higher as banking stocks lead early gains",
    url: "/article/markets-open-higher-as-banking-stocks-gain",
    is_active: true,
    created_at: "2026-05-02T05:20:00.000Z",
  },
];

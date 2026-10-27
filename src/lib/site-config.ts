export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com").replace(/\/$/, "");
export const publisher = {
  name: "ఆజాద్", brand: "న్యూస్‌జెడ్‌9", location: "నెల్లూరు, ఆంధ్రప్రదేశ్, భారతదేశం",
  email: "goldyajit@gmail.com", phone: "9032442428", authorName: "గోల్డీ అజిత్",
};
export const POLICY_DATE = "2026-10-27";
export const publisherEnglish = {
  ...publisher, name: "Azad", brand: "NEWSZ9", location: "Nellore, Andhra Pradesh, India", authorName: "Goldy Ajit",
};
export const trustLinks = [
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/corrections-policy", label: "Corrections Policy" },
  { href: "/grievance", label: "Grievances" },
];

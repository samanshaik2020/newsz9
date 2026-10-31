import { slugify } from "./utils.ts";

const consonants: Record<string, string> = {
  క: "k", ఖ: "kh", గ: "g", ఘ: "gh", ఙ: "ng",
  చ: "ch", ఛ: "chh", జ: "j", ఝ: "jh", ఞ: "ny",
  ట: "t", ఠ: "th", డ: "d", ఢ: "dh", ణ: "n",
  త: "t", థ: "th", ద: "d", ధ: "dh", న: "n",
  ప: "p", ఫ: "ph", బ: "b", భ: "bh", మ: "m",
  య: "y", ర: "r", ఱ: "r", ల: "l", ళ: "l", వ: "v",
  శ: "sh", ష: "sh", స: "s", హ: "h", ౘ: "ts", ౙ: "dz", ౚ: "rr",
};
const vowelSigns: Record<string, string> = {
  "ా": "aa", "ి": "i", "ీ": "ee", "ు": "u", "ూ": "oo",
  "ృ": "ru", "ౄ": "roo", "ె": "e", "ే": "ee", "ై": "ai",
  "ొ": "o", "ో": "oo", "ౌ": "au", "ౢ": "lu", "ౣ": "loo",
};
const letters: Record<string, string> = {
  అ: "a", ఆ: "aa", ఇ: "i", ఈ: "ee", ఉ: "u", ఊ: "oo",
  ఋ: "ru", ౠ: "roo", ఌ: "lu", ౡ: "loo", ఎ: "e", ఏ: "ee",
  ఐ: "ai", ఒ: "o", ఓ: "oo", ఔ: "au", "ం": "m", "ః": "h", "ఁ": "m",
  "్": "", "\u200c": "", "\u200d": "",
};

// Keep article links compact even after copying/percent-encoding Telugu text.
// This is deliberately separate from category/tag slugs and existing URLs.
export function generateArticleSlug(title: string) {
  const normalized = title.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
  const chars = Array.from(normalized);
  const transliterated = chars.map((char, i) => {
    if (consonants[char]) {
      const next = chars[i + 1];
      return consonants[char] + (next === "్" || vowelSigns[next] !== undefined ? "" : "a");
    }
    if (vowelSigns[char] !== undefined) return vowelSigns[char];
    if (letters[char] !== undefined) return letters[char];
    if (char >= "౦" && char <= "౯") return String(char.charCodeAt(0) - "౦".charCodeAt(0));
    return char;
  }).join("");
  const slug = slugify(transliterated);
  const words = slug.split("-");
  if (slug.length <= 60 && words.length <= 5) return slug;

  // Include the entire title in the suffix so headlines with the same opening
  // words remain distinct, including differences beyond slugify's length cap.
  let hash = 2166136261;
  for (const char of normalized) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619) >>> 0;
  const suffix = hash.toString(36).padStart(7, "0");
  const prefix: string[] = [];
  for (const word of words.slice(0, 5)) {
    if ([...prefix, word].join("-").length > 52) break;
    prefix.push(word);
  }
  return `${prefix.join("-") || slug.slice(0, 52)}-${suffix}`;
}

import type { Author } from "../types/index.ts";
export function publicAuthorName(name: string) {
  const names: Record<string, string> = { "goldy ajit": "గోల్డీ అజిత్", "goldyajit": "గోల్డీ అజిత్", "azad": "ఆజాద్", "harsha vardhan": "హర్షవర్ధన్", "dr. sowmya priya": "డాక్టర్ సౌమ్య ప్రియ" };
  return names[name.toLowerCase().trim()] ?? name;
}
export function publicAuthor(author?: Author | null): Author | null {
  return author ? { id: author.id, name: publicAuthorName(author.name), bio: author.bio, avatar_url: author.avatar_url, role: author.role, credentials: author.credentials, expertise: author.expertise } : null;
}

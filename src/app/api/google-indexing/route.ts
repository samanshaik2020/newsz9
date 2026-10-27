import { NextResponse } from "next/server";
// Google's Indexing API is restricted to JobPosting and livestream video pages.
export async function POST() {
  return NextResponse.json({ error: "వార్తా కథనాలకు ఈ సేవ వర్తించదు. సైట్ పటం ద్వారా శోధన వ్యవస్థలకు తెలియజేయండి." }, { status: 410 });
}

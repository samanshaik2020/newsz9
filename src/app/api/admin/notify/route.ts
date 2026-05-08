import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { sendPushNotification } from "@/lib/onesignal";

/**
 * POST /api/admin/notify
 * Send a push notification to all subscribers.
 *
 * Body: { title: string, message: string, url?: string, imageUrl?: string }
 */
export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json()) as {
    title?: string;
    message?: string;
    url?: string;
    imageUrl?: string;
  };

  if (!body.title || !body.message) {
    return NextResponse.json(
      { error: "title and message are required." },
      { status: 400 },
    );
  }

  const result = await sendPushNotification({
    title: body.title,
    message: body.message,
    url: body.url,
    imageUrl: body.imageUrl,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 503 },
    );
  }

  return NextResponse.json({ sent: true });
}

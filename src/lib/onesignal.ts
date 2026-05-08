/**
 * OneSignal push notification helper.
 * Sends browser push notifications via the OneSignal REST API.
 *
 * Requires ONESIGNAL_APP_ID and ONESIGNAL_API_KEY in .env.local
 */

const ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";

interface NotificationPayload {
  /** Notification title */
  title: string;
  /** Notification body text */
  message: string;
  /** URL to open when notification is clicked */
  url?: string;
  /** Optional image URL */
  imageUrl?: string;
}

export async function sendPushNotification(
  payload: NotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;

  if (
    !appId ||
    !apiKey ||
    appId === "your_onesignal_app_id" ||
    apiKey === "your_onesignal_rest_api_key"
  ) {
    return {
      success: false,
      error: "OneSignal is not configured. Add ONESIGNAL_APP_ID and ONESIGNAL_API_KEY to .env.local.",
    };
  }

  try {
    const body: Record<string, unknown> = {
      app_id: appId,
      included_segments: ["Subscribed Users"],
      headings: { en: payload.title },
      contents: { en: payload.message },
    };

    if (payload.url) {
      body.url = payload.url;
    }

    if (payload.imageUrl) {
      body.big_picture = payload.imageUrl;
      body.chrome_web_image = payload.imageUrl;
    }

    const response = await fetch(ONESIGNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.errors?.[0] ?? "OneSignal API error.",
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to call OneSignal API." };
  }
}

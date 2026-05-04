import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { maybeCreateServiceClient } from "@/lib/supabase";

export function requireAdmin(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

export function requireServiceClient() {
  const supabase = maybeCreateServiceClient();

  if (!supabase) {
    return {
      supabase: null,
      response: NextResponse.json(
        {
          error:
            "Supabase service role is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
        },
        { status: 503 },
      ),
    };
  }

  return { supabase, response: null };
}

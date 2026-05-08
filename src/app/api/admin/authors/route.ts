import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ authors: data ?? [] });
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    bio?: string;
    avatar_url?: string;
    role?: string;
  };

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 },
    );
  }

  const roles = new Set(["editor", "reporter", "bot"]);
  const role = roles.has(body.role ?? "") ? body.role : "reporter";

  const { data, error } = await supabase
    .from("authors")
    .insert({
      name: body.name.trim(),
      email: body.email.trim(),
      bio: body.bio?.trim() || null,
      avatar_url: body.avatar_url?.trim() || null,
      role,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ author: data }, { status: 201 });
}

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin, requireServiceClient } from "@/lib/admin-api";

const bucketName = process.env.SUPABASE_ARTICLE_IMAGE_BUCKET ?? "article-images";
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extensionFor(file: File) {
  const explicitExtension = file.name.split(".").pop()?.toLowerCase();
  if (explicitExtension && /^[a-z0-9]+$/.test(explicitExtension)) {
    return explicitExtension;
  }

  return file.type.split("/")[1] ?? "jpg";
}

async function ensureBucket(
  supabase: NonNullable<ReturnType<typeof requireServiceClient>["supabase"]>,
) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) return listError;

  if (buckets?.some((bucket) => bucket.name === bucketName)) {
    return null;
  }

  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: Array.from(allowedMimeTypes),
  });

  return error;
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { supabase, response } = requireServiceClient();
  if (!supabase) return response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Image file is required." },
      { status: 400 },
    );
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and GIF images are supported." },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image must be 10 MB or smaller." },
      { status: 400 },
    );
  }

  const bucketError = await ensureBucket(supabase);
  if (bucketError) {
    return NextResponse.json({ error: bucketError.message }, { status: 400 });
  }

  const path = `articles/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${extensionFor(file)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucketName).upload(path, bytes, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);

  return NextResponse.json({
    bucket: bucketName,
    path,
    publicUrl: data.publicUrl,
  });
}

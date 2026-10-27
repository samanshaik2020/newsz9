"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
// Direct delivery of remote media avoids server proxy failures on NAT64 networks.
export default function NewsImage(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  const remote = typeof props.src === "string" && /^https?:/.test(props.src);
  if (failed) return <span role="img" aria-label={props.alt} className={props.fill ? "absolute inset-0 grid place-items-center bg-zinc-100 text-red-700" : "grid min-h-48 place-items-center bg-zinc-100 p-8 text-red-700"}>న్యూస్‌జెడ్‌9</span>;
  return <Image {...props} alt={props.alt} unoptimized={remote || props.unoptimized} onError={() => setFailed(true)} />;
}

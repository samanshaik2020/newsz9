"use client";
import { useState } from "react";
import { publisherEnglish as publisher } from "@/lib/site-config";

export function ContactForm() {
  const [opened, setOpened] = useState(false);
  return <form className="mt-8 grid gap-4 rounded-lg border p-6" onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = `${form.get("topic")}: ${form.get("name")}`;
    const body = `Name: ${form.get("name")}\nReply email: ${form.get("email")}\nArticle link: ${form.get("url")}\n\n${form.get("message")}`;
    window.location.href = `mailto:${publisher.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }}>
    <h2 className="text-2xl font-bold">Prepare your message</h2>
    <p>This form opens your email application. We receive your message only after you send it there.</p>
    <label className="grid gap-2">Your name<input className="rounded border p-3" name="name" required maxLength={100} autoComplete="name" /></label>
    <label className="grid gap-2">Your email<input className="rounded border p-3" name="email" required type="email" autoComplete="email" /></label>
    <label className="grid gap-2">Topic<select className="rounded border p-3" name="topic"><option>News tip</option><option>Correction request</option><option>Complaint</option><option>Privacy request</option><option>Other enquiry</option></select></label>
    <label className="grid gap-2">Related article link<input className="rounded border p-3" name="url" type="url" /></label>
    <label className="grid gap-2">Message<textarea className="min-h-40 rounded border p-3" name="message" required maxLength={5000} /></label>
    <p className="text-sm text-zinc-600">Please do not send sensitive information such as identity documents or medical records. See our Privacy Policy for more information.</p>
    <button className="rounded bg-red-700 p-3 font-bold text-white" type="submit">Open in email</button>
    {opened && <p role="status">Send the message in your email application. If it does not open, write directly to the email address above.</p>}
  </form>;
}

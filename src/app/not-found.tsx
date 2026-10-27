import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-zinc-100">
        <FileQuestion className="h-10 w-10 text-zinc-500" />
      </div>
      <h1 className="mb-2 text-4xl font-black tracking-tight text-zinc-950">
        పేజీ కనిపించలేదు
      </h1>
      <p className="mb-8 max-w-md text-lg text-zinc-600">
        మీరు కోరిన పేజీ కనిపించలేదు. లింకును సరిచూడండి లేదా ముఖపుట నుంచి కావాల్సిన వార్తను వెతకండి.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-red-700 px-6 py-3 font-bold text-white transition-colors hover:bg-red-800"
      >
        ముఖపుటకు వెళ్లండి
      </Link>
    </div>
  );
}

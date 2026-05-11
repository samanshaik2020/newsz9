import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us | THE NEWSZ9",
  description: "Learn more about THE NEWSZ9 and our mission to deliver bilingual news.",
};

export default async function AboutPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header categories={categories} />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <article className="article-body">
          <h1 className="mb-8 text-4xl font-black">About THE NEWSZ9</h1>
          
          <p>
            Welcome to THE NEWSZ9, your premier destination for fast, reliable, and bilingual news coverage. 
            Our mission is to deliver the latest stories across national, regional, business, sports, and technology 
            sectors, accessible to both English and Telugu readers.
          </p>

          <h2>Our Vision</h2>
          <p>
            We believe that access to accurate information is a fundamental right. By providing news in both 
            English and Telugu, we bridge the language gap and ensure that critical stories reach a broader audience, 
            empowering individuals to make informed decisions.
          </p>

          <h2>What We Cover</h2>
          <ul>
            <li><strong>National & Regional News:</strong> Keeping you updated on the policies, events, and stories that shape our nation and local communities.</li>
            <li><strong>Business & Economy:</strong> Insights into markets, startups, and economic trends.</li>
            <li><strong>Sports:</strong> Comprehensive coverage of cricket, football, athletics, and more.</li>
            <li><strong>Technology & Science:</strong> Breaking down complex technological advancements into easy-to-understand news.</li>
          </ul>

          <h2>Our Commitment</h2>
          <p>
            At THE NEWSZ9, we are committed to journalistic integrity. We strive to provide unbiased reporting, 
            fact-checked information, and diverse perspectives on the issues that matter most.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}

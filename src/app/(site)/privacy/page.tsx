import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy | THE NEWSZ9",
  description: "Privacy Policy for THE NEWSZ9.",
};

export default async function PrivacyPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header categories={categories} />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <article className="article-body">
          <h1 className="mb-8 text-4xl font-black">Privacy Policy</h1>
          
          <p className="text-sm italic text-zinc-500">Last updated: May 11, 2026</p>

          <p>
            At THE NEWSZ9, accessible from newsz9.com, one of our main priorities is the privacy of our visitors. 
            This Privacy Policy document contains types of information that is collected and recorded by THE NEWSZ9 
            and how we use it.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, 
            will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <p>
            If you contact us directly, we may receive additional information about you such as your name, email address, 
            phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul>
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
            <li>Send you emails</li>
            <li>Find and prevent fraud</li>
          </ul>

          <h2>3. Log Files</h2>
          <p>
            THE NEWSZ9 follows a standard procedure of using log files. These files log visitors when they visit websites. 
            All hosting companies do this and a part of hosting services&apos; analytics. The information collected by log files 
            include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, 
            referring/exit pages, and possibly the number of clicks. These are not linked to any information that is 
            personally identifiable.
          </p>

          <h2>4. Cookies and Web Beacons</h2>
          <p>
            Like any other website, THE NEWSZ9 uses &quot;cookies&quot;. These cookies are used to store information including 
            visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is 
            used to optimize the users' experience by customizing our web page content based on visitors' browser type 
            and/or other information.
          </p>

          <h2>5. Google DoubleClick DART Cookie</h2>
          <p>
            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads 
            to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors 
            may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at 
            the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">https://policies.google.com/technologies/ads</a>
          </p>

          <h2>6. Third Party Privacy Policies</h2>
          <p>
            THE NEWSZ9's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult 
            the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their 
            practices and instructions about how to opt-out of certain options.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}

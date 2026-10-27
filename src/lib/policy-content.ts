import { publisherEnglish as publisher } from "./site-config";

type PolicyContent = {
  title: string;
  intro: string;
  sections: { title: string; text: string }[];
};

export const policies: Record<string, PolicyContent> = {
  "about-us": {
    title: "About Us",
    intro: "NEWSZ9 is a news platform for Telugu readers. We cover Andhra Pradesh, Telangana, national developments, sports, cinema, technology and health, with an emphasis on clear explanations and relevant local context.",
    sections: [
      { title: "Who publishes NEWSZ9", text: `The publisher is ${publisher.name}, based in ${publisher.location}. ${publisher.authorName} is responsible for article writing. Individual stories identify their assigned author and link to the available author profile.` },
      { title: "Our purpose", text: "Our editorial goal is to explain what happened, what evidence supports it, who may be affected and what remains unknown. Local context should be added when it is supported by evidence. Speculation must not be presented as established fact." },
      { title: "Transparency and independence", text: "News, analysis, opinion and sponsored content should be clearly distinguished. Advertising, sponsorship and other material interests must be disclosed. Names, professional experience and expert qualifications must not be invented or presented as verified without a factual basis." },
      { title: "Contact the publisher", text: `Send news tips, corrections and publishing questions to ${publisher.email}, or call ${publisher.phone}. A full street address is not published here; please contact us before sending documents by post.` },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    intro: `This policy explains how information is handled on NEWSZ9. For privacy questions or requests, contact the publisher, ${publisher.name}, at ${publisher.email}.`,
    sections: [
      { title: "Information we receive", text: "You do not need an account to read news. If you contact us by email or telephone, we may receive the name, contact details and message you voluntarily provide. Hosting and security services may record technical information such as an IP address, browser information and request time. An IP address can contribute to identifying a person." },
      { title: "Purpose and data minimisation", text: "Information should be used only as necessary to answer a message, investigate a complaint, check a news report or maintain website security. Contacting us does not automatically subscribe you to advertising or marketing lists. Please do not send medical records, identity documents or confidential information about other people unless it is necessary and an appropriate method has been agreed." },
      { title: "Cookies and browser storage", text: "An essential session cookie supports administrator sign-in. Editorial features, including draft previews, may use temporary browser storage on an administrator's device. Advertising scripts and optional analytics trackers are currently disabled on reader pages. You can clear cookies and storage in your browser settings; doing so may end an administrator session." },
      { title: "The contact form", text: "The contact form prepares a message in your email application. Filling it in does not submit a message to a NEWSZ9 form database. We receive the message only if you send it using your email service, whose privacy terms also apply." },
      { title: "Advertising and consent", text: "If Google AdSense or another advertising service is introduced, this policy must first be updated to explain the relevant data use, partners and choices. Optional tracking must not begin without consent where consent is required. Personalised advertising in applicable regions must be enabled only after the required Google-certified consent management arrangements are in place." },
      { title: "Service providers and external websites", text: "Hosting, database, image delivery and caching providers may process technical information needed to operate the website. External sources, social networks and email services have their own privacy policies. Social sharing buttons use links; they do not load embedded social tracking widgets before you choose to visit those services." },
      { title: "Retention, security and your requests", text: "Personal information should be kept only as long as needed for a response, investigation, security purpose or applicable legal obligation. You may email requests to access, correct or delete your information, or withdraw consent where applicable. We may seek proportionate identity verification and respond under the law that applies. Public-interest reporting and legal retention duties may limit some requests." },
      { title: "Children, international readers and updates", text: "We do not intentionally ask children to provide personal information. Contact us if such information has been sent in error. Requests from readers outside India will be considered in light of applicable privacy rights. Material changes to our services should be reflected in this policy with an updated date." },
    ],
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    intro: "These terms apply when you read NEWSZ9 or send information to us. They do not remove rights that applicable law gives you.",
    sections: [
      { title: "Using our content", text: "You may use the website for personal reading and limited quotation with attribution where permitted by law. Do not republish entire articles, photographs, videos or datasets without the appropriate permission. Material credited to external sources remains subject to the rights of its owners." },
      { title: "Information you submit", text: "Submit only information you have the right to share. Do not falsify evidence, expose another person's private information or make knowingly false allegations. Submitting a tip does not guarantee publication. Tell us in advance if material requires confidential handling; ordinary email is not a fully confidential communication channel." },
      { title: "Security and availability", text: "Attempts to damage the website, gain unauthorised access or submit fraudulent requests are prohibited. Maintenance and technical problems may temporarily interrupt service. Reporting may change when new evidence becomes available; significant corrections should be explained in the affected article." },
      { title: "Advertising and external services", text: "Sponsored content must be clearly labelled. A link to another website is not a guarantee of its services. Before making a purchase or entering another transaction, check the provider's identity and terms." },
      { title: "Questions, disputes and changes", text: `Please first send concerns about using the website to ${publisher.email}. Matters should be considered under applicable Indian law and the relevant jurisdiction. These terms do not restrict lawful complaint or remedy procedures. Changes should be published on this page with the date they take effect.` },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    intro: "NEWSZ9 provides information for public awareness. Our publishing standards require supporting evidence, and reports may be corrected or updated when circumstances change or an error is identified.",
    sections: [
      { title: "Health information", text: "Health articles are not a substitute for individual medical advice, diagnosis or treatment. Discuss test results, medicine doses and dietary changes with a qualified clinician. Seek local emergency medical care promptly for emergency symptoms. Do not stop medication or begin treatment solely because of an article." },
      { title: "Financial, legal and other decisions", text: "Financial, investment, legal and employment information does not replace advice tailored to your circumstances. Check official notices and consult an appropriately qualified professional when needed. We do not guarantee profits, outcomes or opportunities." },
      { title: "Opinions and developing reports", text: "Opinion articles express the author's viewpoint and should be distinguished from established facts. Allegations under investigation are not proof of guilt. Early reports may change; check the publication and update times." },
      { title: "Images, sources and errors", text: "Illustrative or reconstructed images should be identified as such. Linking to an external page does not endorse every statement on it. If you believe an article is inaccurate or infringes your rights, send the article link and supporting evidence. This disclaimer does not remove responsibilities imposed by applicable law." },
    ],
  },
  "editorial-policy": {
    title: "Editorial Policy",
    intro: "Our standard is original Telugu reporting and explanation that helps readers understand an issue and its evidence. Articles should not be padded with unnecessary text to meet a word count or influence search rankings.",
    sections: [
      { title: "Verification and sources", text: "Material claims should be checked against official documents, firsthand reporting or accountable sources. Disputed claims require independent evidence and an opportunity for relevant parties to respond. If a response is unavailable, say so. Check dates, locations, numbers, quotations and links, and identify information that remains unconfirmed." },
      { title: "Original work and copyright", text: "Copying another publisher's article or changing a few words and presenting it as original reporting is not acceptable. Attribution alone does not grant permission to reproduce a full story or image. Add independent reporting, useful context or original explanation. Record image rights and descriptions, and check for repeated headlines and duplicate articles." },
      { title: "Authorship, review and dates", text: "Published stories should identify a responsible author with a profile. Do not invent people, headshots, professional credentials or verification badges. Preserve the original publication time and show an update time for substantive changes. Do not present a future-dated story as already published." },
      { title: "Health and sensitive subjects", text: "Health articles require reliable medical sources, details of a suitably qualified person who actually reviewed the article, and a clear medical disclaimer. Do not publish miracle cures, unsupported guarantees or dangerous treatment instructions. Apply relevant protections for children, victims of sexual offences and personal medical information. Incitement to hatred or violence and unsupported defamatory allegations are not acceptable." },
      { title: "AI assistance and human responsibility", text: "Machine-assisted imports must remain in review until a human editor checks factual accuracy, the authenticity of sources and the article's original value. Disclose AI assistance where it has been used in preparing an article. Do not mass-produce repetitive material to manipulate search systems. Publishing responsibility remains with the editorial team." },
      { title: "Sponsorship and conflicts of interest", text: "Disclose payments, free products, affiliate benefits and other material interests. Sponsored material must not be presented as independent reporting. Headlines and images should accurately reflect the article rather than promise information that it does not contain." },
      { title: "Corrections and complaints", text: "Correct substantive errors in the original article with an explanatory note and an update time. Do not silently remove accurate reporting merely because it attracts criticism. Readers can use our Contact page to request corrections or raise rights concerns; the relevant policies explain the review process." },
    ],
  },
  "corrections-policy": {
    title: "Corrections Policy",
    intro: "Correcting errors is essential to reader trust. Please tell us if you identify a factual error, misleading headline, incorrect image, source problem or inaccurate author information.",
    sections: [
      { title: "Requesting a correction", text: `Email ${publisher.email} with the article link, the statement you believe is wrong, the proposed correction and supporting evidence. Use “Correction request” in the subject line. Include only the contact information needed for a response.` },
      { title: "How a request is assessed", text: "The original sources, relevant responses and new evidence should be reviewed. A complaint is not automatically proof that an allegation is correct. We should acknowledge receipt and communicate the outcome. Unresolved concerns can be raised through the complaint process." },
      { title: "Explaining changes", text: "Changes that affect a fact or the meaning of an article should be described in a correction note. Preserve the first publication date. Distinguish a new development from a correction to earlier reporting. Fixing a minor spelling error should not be used to make a story appear newly published." },
      { title: "Retractions and privacy", text: "A retraction may be considered when the primary basis of a report is disproved, rights have been infringed or a legal obligation requires it. Where appropriate, retain a record explaining the decision. Do not repeat information that would compromise personal safety or a victim's privacy." },
    ],
  },
  grievance: {
    title: "Grievances and Rights Concerns",
    intro: "Use the contact methods below to raise concerns about published content, privacy, copyright or editorial conduct with the publisher.",
    sections: [
      { title: "Publisher contact", text: `Publisher: ${publisher.name}. Location: ${publisher.location}. Email: ${publisher.email}. Telephone: ${publisher.phone}. These are publisher contact details; they do not certify a separate statutory grievance-officer appointment or membership of a self-regulatory body.` },
      { title: "What to include", text: "Provide the article link, the part you object to, your reason, supporting evidence and a reply address. For copyright concerns, identify the original work and your relationship to the rights holder. Do not send another person's identity documents or confidential medical records." },
      { title: "Review and resolution", text: "Concerns should be recorded and assessed against the available evidence. The response may include a correction, explanation or removal where appropriate. Applicable legal response periods and appeal procedures should be followed. Contacting the publisher does not limit your right to seek a legal or regulatory remedy." },
    ],
  },
};

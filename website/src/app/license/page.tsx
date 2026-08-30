import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "License — Dripwriter Origin",
  description:
    "Dripwriter Origin is free for noncommercial use under the Dripwriter Origin License. Commercial use requires a separate agreement.",
  alternates: { canonical: "https://dripwriter.org/license" }
};

const sections = [
  {
    heading: "Scope",
    body: "This license covers the original source code of the Dripwriter Origin browser extension — the files authored by the licensor in this repository. It does not cover fonts (subject to their own respective licenses), the websites you type into (such as Google Docs, Canvas, or Packback, each governed by its own operator's terms), or the Plasmo framework and its subdependencies (independent open-source projects distributed under their own licenses). Those third-party components and services remain under their own terms; only the licensor's original code is covered here."
  },
  {
    heading: "Acceptance",
    body: "In order to get any license under these terms, you must agree to them as both strict obligations and conditions to all your licenses."
  },
  {
    heading: "Copyright License",
    body: "The licensor grants you a copyright license for the software to do everything you might do with the software that would otherwise infringe the licensor's copyright in it for any permitted purpose. However, you may only distribute the software according to the Distribution License and make changes or new works based on the software according to the Changes and New Works License."
  },
  {
    heading: "Distribution License",
    body: "The licensor grants you an additional copyright license to distribute copies of the software. Your license to distribute covers distributing the software with changes and new works permitted by the Changes and New Works License."
  },
  {
    heading: "Notices",
    body: 'You must ensure that anyone who gets a copy of any part of the software from you also gets a copy of these terms or the URL for them above, as well as copies of any plain-text lines beginning with "Required Notice:" that the licensor provided with the software. Required Notice: Copyright (c) 2026 Alexey Fedorov.'
  },
  {
    heading: "Changes and New Works License",
    body: "The licensor grants you an additional copyright license to make changes and new works based on the software for any permitted purpose."
  },
  {
    heading: "Patent License",
    body: "The licensor grants you a patent license for the software that covers patent claims the licensor can license, or becomes able to license, that you would infringe by using the software."
  },
  {
    heading: "Noncommercial Purposes",
    body: "Any noncommercial purpose is a permitted purpose."
  },
  {
    heading: "Personal Uses",
    body: "Personal use for research, experiment, and testing for the benefit of public knowledge, personal study, private entertainment, hobby projects, amateur pursuits, or religious observance, without any anticipated commercial application, is use for a permitted purpose."
  },
  {
    heading: "Noncommercial Organizations",
    body: "Use by any charitable organization, educational institution, public research organization, public safety or health organization, or environmental protection organization is use for a permitted purpose regardless of the source of funding or obligations resulting from the funding."
  },
  {
    heading: "Fair Use",
    body: 'You may have "fair use" rights for the software under the law. These terms do not limit them.'
  },
  {
    heading: "No Other Rights",
    body: "These terms do not allow you to sublicense or transfer any of your licenses to anyone else, or prevent the licensor from granting licenses to anyone else. These terms do not imply any other licenses."
  },
  {
    heading: "Prohibited Uses",
    body: "You may not use the software, in whole or in part, for: (1) Autonomous surveillance — any system that monitors, tracks, or identifies individuals in an automated or semi-automated manner without their knowledge and ongoing consent; or (2) Autonomous weapons — any system designed to select and engage targets with lethal or non-lethal force without meaningful human control over each individual targeting decision. Violation immediately and permanently terminates all licenses granted to you."
  },
  {
    heading: "Patent Defense",
    body: "If you make any written claim that the software infringes or contributes to infringement of any patent, your patent license for the software granted under these terms ends immediately. If your company makes such a claim, your patent license ends immediately for work on behalf of your company."
  },
  {
    heading: "Violations",
    body: "The first time you are notified in writing that you have violated any of these terms, your licenses can nonetheless continue if you come into full compliance and take practical steps to correct past violations within 32 days of receiving notice. Otherwise, all your licenses end immediately."
  },
  {
    heading: "No Liability",
    body: "As far as the law allows, the software comes as is, without any warranty or condition, and the licensor will not be liable to you for any damages arising out of these terms or the use or nature of the software, under any kind of legal claim."
  }
];

export default function LicensePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-black">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)"
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-40 pb-24">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            ✦ Legal
          </p>

          <h1
            className="text-4xl sm:text-5xl font-semibold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            License
          </h1>

          <p className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed mb-4">
            Copyright &copy; 2026 Alexey Fedorov. All rights reserved.
          </p>
          <p className="text-[#a0a0a0] text-base leading-relaxed mb-12">
            Dripwriter Origin is free for all noncommercial use under the terms
            below. For commercial use, contact{" "}
            <a
              href="mailto:alexey.max.fedorov@gmail.com"
              className="text-[#c9a84c] hover:underline"
            >
              alexey.max.fedorov@gmail.com
            </a>
            .
          </p>

          <div className="border-t border-[#1a1a1a]">
            {sections.map((s) => (
              <div
                key={s.heading}
                className="py-8 border-b border-[#1a1a1a] grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4"
              >
                <h2 className="text-sm font-semibold text-white">{s.heading}</h2>
                <p className="text-sm text-[#a0a0a0] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-xs text-[#666] leading-relaxed">
            This license is based on the Blue Oak Model License 1.0.0 with
            custom noncommercial and prohibited-use clauses.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";

const TARGET = "https://extension.dripwriter.org";

export const metadata: Metadata = {
  title: "Get Dripwriter Origin",
  alternates: { canonical: TARGET },
  robots: { index: false }
};

export default function Get() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
      <p>
        Redirecting to <a href={TARGET}>{TARGET}</a>…
      </p>
    </>
  );
}

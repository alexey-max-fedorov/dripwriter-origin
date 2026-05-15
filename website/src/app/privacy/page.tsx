import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Dripwriter Origin",
  description:
    "Dripwriter Origin collects no data. There is no backend, no analytics, and no network requests. Your text never leaves your device.",
  alternates: { canonical: "https://dripwriter.org/privacy" }
};

const sections = [
  {
    heading: "No Data Collection",
    body: "Dripwriter Origin does not collect, transmit, store, or share any personal data, usage data, or any other information about you or your activity."
  },
  {
    heading: "No Backend",
    body: "There is no server, no database, and no remote endpoint of any kind. The extension operates entirely within your browser."
  },
  {
    heading: "No Analytics",
    body: "No usage telemetry, error reporting, crash logs, or analytics are sent anywhere — not to us, not to a third party."
  },
  {
    heading: "No Network Requests",
    body: "Once installed, the extension makes zero outbound network connections. It never contacts any server."
  },
  {
    heading: "Local Storage Only",
    body: "Your typing-speed and behavior settings are saved in chrome.storage.local (or the Firefox equivalent). This data never leaves your device and is never read by anyone other than the extension itself."
  },
  {
    heading: "What the Extension Can See",
    body: "The content script runs on docs.google.com only, as declared in the manifest. It reads the text you provide in the extension popup and simulates typing keystrokes into the active Google Doc. It does not read, log, or transmit the contents of your document."
  },
  {
    heading: "Disclaimer of Liability",
    body: 'THE SOFTWARE IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. Use of Dripwriter Origin is at your own risk. The author makes no representations about the suitability of this software for any purpose and is not responsible for any consequences arising from its use, including account actions taken by third-party platforms.'
  },
  {
    heading: "Website Analytics",
    body: "The marketing website at dripwriter.org uses Vercel Analytics and Vercel Speed Insights. These collect anonymous, aggregated traffic data (page views, referrers, browser type, country-level location, and core web vitals). No cookies are set, no personally identifiable information is collected, and no data is sold or shared with third parties. This applies only to the website — the installed browser extension still makes zero network requests."
  },
  {
    heading: "Browser Web Store Analytics",
    body: "The Chrome Web Store, Microsoft Edge Add-ons store, and Firefox Add-ons (AMO) are operated by Google, Microsoft, and Mozilla respectively. When you visit an extension's store listing or install an extension, those platforms may collect analytics under their own privacy policies. This data collection is performed by the store platform — it is entirely outside the control of Dripwriter Origin and is not governed by this policy. The extension itself, once installed, still makes zero network requests and collects no data."
  }
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed mb-12">
            Last updated: May 14, 2026
          </p>

          <p className="text-[#a0a0a0] text-sm leading-relaxed mb-12 italic">
            This policy describes the data practices of the Dripwriter Origin browser
            extension. The marketing website at dripwriter.org uses privacy-respecting
            analytics (Vercel Analytics and Speed Insights) to understand aggregate
            traffic patterns — see "Website Analytics" below.
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

          <p className="mt-12 text-sm text-[#a0a0a0]">
            Questions?{" "}
            <a
              href="https://github.com/alexey-max-fedorov/dripwriter-origin/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c9a84c] hover:underline"
            >
              Open an issue on GitHub
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

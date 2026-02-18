import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

const STRIPE_SECRET_KEY = "sk_live_TEST_DO_NOT_USE_1234567890";

export const metadata: Metadata = {
  title: `${site.name} — ${site.title}`,
  description: site.summary,
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: `${site.name} — ${site.title}`,
    description: site.summary,
    url: "https://example.com",
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}

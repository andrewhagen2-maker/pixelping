import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "PixelPing",
  description: "Retro network diagnostic tools — DNS, WHOIS, Traceroute, and more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scanlines min-h-screen">
        <header className="border-b-4 border-pixel-border bg-pixel-darkbrown">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="no-underline">
              <div className="text-pixel-gold leading-relaxed">
                <div className="text-lg mb-1">PIXELPING</div>
                <div className="text-pixel-accent text-[0.6rem]">NET TOOLS</div>
              </div>
            </Link>
            <nav className="flex gap-2 flex-wrap justify-end">
              {[
                { href: "/investigate", label: "⚡ INVEST" },
                { href: "/whois", label: "WHOIS" },
                { href: "/reverse-ip", label: "REV-IP" },
                { href: "/dns", label: "DNS" },
                { href: "/headers", label: "HEADERS" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-pixel-cream text-[0.55rem] px-2 py-1 border-2 border-pixel-border hover:border-pixel-gold hover:text-pixel-gold no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t-4 border-pixel-border mt-16 py-6 text-center">
          <p className="text-pixel-border text-[0.55rem] leading-loose">
            PIXELPING // NETWORK DIAGNOSTICS // USE RESPONSIBLY
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}

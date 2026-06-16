import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "bharatha01",
  description: "A high-end portfolio built with Next.js, Framer Motion, and Supabase",
  openGraph: {
    title: "bharatha01",
    description: "A high-end portfolio built with Next.js, Framer Motion, and Supabase",
    siteName: "bharatha01 Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "bharatha01 Portfolio Preview Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bharatha01",
    description: "A high-end portfolio built with Next.js, Framer Motion, and Supabase",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      style={{ colorScheme: 'dark' }}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-950 selection:bg-neutral-900 selection:text-white font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                var origQS = document.querySelector;
                document.querySelector = function(selector) {
                  try {
                    return origQS.apply(this, arguments);
                  } catch (err) {
                    if (err instanceof DOMException && err.name === 'SyntaxError') {
                      console.warn('Prevented crash: querySelector failed for selector:', selector);
                      return null;
                    }
                    throw err;
                  }
                };
                var origQSA = document.querySelectorAll;
                document.querySelectorAll = function(selector) {
                  try {
                    return origQSA.apply(this, arguments);
                  } catch (err) {
                    if (err instanceof DOMException && err.name === 'SyntaxError') {
                      console.warn('Prevented crash: querySelectorAll failed for selector:', selector);
                      return [];
                    }
                    throw err;
                  }
                };
              })();
            `
          }}
        />
        <SmoothScroll>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}

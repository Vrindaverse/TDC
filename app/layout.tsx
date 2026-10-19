import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { AppChrome, AppFooter, ChromeSkeleton } from "@/components/app-shell";
import { ScrollProgress } from "@/components/scroll-progress";
import { TargetCursor } from "@/components/target-cursor";
import { ThemeProvider } from "@/components/theme-provider";
import { site } from "@/lib/navigation";
import { validateEnv } from "@/lib/env";

import "./globals.css";

validateEnv();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.fullName} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Technocrats Developer Community (TDC) is a student-led developer community focused on programming, development, AI/ML, cybersecurity, open source and hands-on technology learning.",
  keywords: [
    "Technocrats",
    "Developer Community",
    "TDC",
    "Student Community",
    "Web Development",
    "AI/ML",
    "Cybersecurity",
  ],
  metadataBase: new URL(process.env.SITE_URL ?? "https://tdc-six.vercel.app"),
  openGraph: {
    title: site.fullName,
    description: site.tagline,
    url: process.env.SITE_URL ?? "https://tdc-six.vercel.app",
    siteName: site.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/tdc-hero.svg",
        width: 1200,
        height: 630,
        alt: site.fullName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.fullName,
    description: site.tagline,
    images: ["/images/tdc-hero.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollProgress />
          <Suspense fallback={<ChromeSkeleton />}>
            <AppChrome />
          </Suspense>
          <main className="flex-1">{children}</main>
          <TargetCursor
            targetSelector=".cursor-target, input, select, textarea, button, a, label, [role='button'], [role='switch']"
          />
          <Suspense fallback={null}>
            <AppFooter />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
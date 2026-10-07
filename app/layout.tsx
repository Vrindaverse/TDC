import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import {
  AppChrome,
  AppFooter,
  ChromeSkeleton,
} from "@/components/app-shell";
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
    "Open Source",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <Suspense fallback={<ChromeSkeleton />}>
          <AppChrome />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense fallback={null}>
          <AppFooter />
        </Suspense>
      </body>
    </html>
  );
}
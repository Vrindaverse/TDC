import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { navLinks, site } from "@/lib/navigation";
import { contactDetails, domains, socialLinks } from "@/lib/site-data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold tracking-tight text-primary-foreground shadow-sm"
              >
                TD
              </span>
              <span className="text-lg font-semibold tracking-tight">
                {site.name}
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {site.fullName} is a student-run community for learning technology
              by building it, together.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-semibold text-foreground">Explore</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Get started">
            <h2 className="text-sm font-semibold text-foreground">
              Get started
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <Link href="/join" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Join the community
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Create an account
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Member login
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Upcoming events
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Domains</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {domains.map((domain) => (
                <li key={domain.slug}>
                  <Link
                    href={`/about#${domain.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {domain.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Get in touch</h2>
            <ul className="mt-5 flex flex-col gap-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-foreground/60" aria-hidden="true" />
                <a
                  href={`mailto:${contactDetails.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {contactDetails.email}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-foreground/60" aria-hidden="true" />
                <span className="leading-relaxed">{contactDetails.address}</span>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Follow us</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-border/60" />

        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {site.fullName}. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
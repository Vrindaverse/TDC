import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { navLinks, site } from "@/lib/navigation";
import { contactDetails, domains, socialLinks } from "@/lib/site-data";

const GET_STARTED = [
  { label: "Join the community", href: "/join" },
  { label: "Create an account", href: "/register" },
  { label: "Member login", href: "/login" },
  { label: "Upcoming events", href: "/events" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* CTA band */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border/60 py-10 sm:flex-row sm:items-center">
          <div>
            <p className="tdc-mono-label text-[11px] text-primary">
              tdc / get started
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Build something with us
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Register once, attend sessions, and grow with the community.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Join TDC
            </Link>
            <Link
              href="/events"
              className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Browse events
            </Link>
          </div>
        </div>

        {/* Link grid */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
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
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {site.fullName} is a student-run community for learning
              technology by building it, together.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {item.label}
                    <ArrowUpRight aria-hidden="true" className="size-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Get started
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {GET_STARTED.map((link) => (
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

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Domains
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {domains.slice(0, 6).map((domain) => (
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground/60" />
                <a
                  href={`mailto:${contactDetails.email}`}
                  className="break-all transition-colors hover:text-foreground"
                >
                  {contactDetails.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground/60" />
                <span className="leading-relaxed">{contactDetails.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-border/60" />

        <div className="flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            &copy; {year} {site.fullName}. All rights reserved.
          </p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}

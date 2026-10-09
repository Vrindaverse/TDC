import Link from "next/link";
import { Briefcase, Code2, Mail, MessageCircle, Phone } from "lucide-react";

import { navLinks, site } from "@/lib/navigation";
import { contactDetails, socialLinks } from "@/lib/site-data";

const SOCIAL_ICONS = {
  GitHub: Code2,
  LinkedIn: Briefcase,
  Discord: MessageCircle,
} as const;

function socialIcon(label: string) {
  return SOCIAL_ICONS[label as keyof typeof SOCIAL_ICONS] ?? Mail;
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto px-4 pb-6 sm:px-6">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[4px] border border-border/60 bg-muted/20 shadow-lg shadow-black/5 backdrop-blur-md">
        <div
          aria-hidden="true"
          className="h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <div className="tdc-mono px-5 sm:px-8">
          {/* Faux terminal title bar */}
          <div
            aria-hidden="true"
            className="tdc-rise flex items-center gap-2 border-b px-1 pt-4 pb-3"
          >
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            </span>
            <span className="tdc-mono-label ml-2 truncate">
              ~/community/footer
            </span>
            <span className="tdc-mono-label ml-auto hidden shrink-0 sm:inline">
              git: main
            </span>
          </div>

          {/* Body */}
          <div className="grid gap-8 py-8 md:grid-cols-3">
            <div className="tdc-rise tdc-rise-1 max-w-md">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {site.fullName}
                </span>{" "}
                is a student-run community for learning technology by building
                it, together — workshops, hackathons, and hands-on projects
                across web, AI, security, and open source.
              </p>
            </div>

            <div className="tdc-rise tdc-rise-2">
              <p className="tdc-mono-label">find your way</p>
              <ul className="mt-3 space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-baseline gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-target"
                    >
                      <span
                        aria-hidden="true"
                        className="text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-70"
                      >
                        ❯
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="tdc-rise tdc-rise-3">
              <p className="tdc-mono-label">say hello</p>
              <ul className="mt-3 space-y-1.5">
                <li>
                  <a
                    href={`mailto:${contactDetails.email}`}
                    className="inline-flex min-w-0 items-center gap-2 break-all text-sm text-muted-foreground transition-colors hover:text-foreground cursor-target"
                  >
                    <Mail aria-hidden="true" className="size-3.5 shrink-0" />
                    {contactDetails.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${contactDetails.phone.replace(/[^+\d]/g, "")}`}
                    className="inline-flex min-w-0 items-center gap-2 break-all text-sm text-muted-foreground transition-colors hover:text-foreground cursor-target"
                  >
                    <Phone aria-hidden="true" className="size-3.5 shrink-0" />
                    {contactDetails.phone}
                  </a>
                </li>
              </ul>
              <div className="mt-4 flex items-center gap-2 border-t border-dashed pt-3">
                {socialLinks.map((social) => {
                  const Icon = socialIcon(social.label);
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="flex size-8 items-center justify-center rounded-[4px] border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground cursor-target"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status line */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-dashed py-3 text-xs text-muted-foreground">
            <p>
              <span aria-hidden="true" className="text-primary">
                $
              </span>{" "}
              {site.name.toLowerCase()} --status
            </p>
            <p className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-primary"
              />
              <span className="tdc-caret text-foreground">online</span>
              <span className="sm:hidden">· © {year}</span>
            </p>
            <p className="hidden sm:block">
              © {year} {site.name}. {site.tagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
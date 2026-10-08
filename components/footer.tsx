import Link from "next/link";
import { Mail } from "lucide-react";

import { navLinks, site } from "@/lib/navigation";
import { contactDetails } from "@/lib/site-data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="tdc-mono">
          {/* Faux terminal title bar */}
          <div
            aria-hidden="true"
            className="flex items-center gap-2 border-b px-1 pt-4 pb-3"
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
              exit: 0
            </span>
          </div>

          {/* Body */}
          <div className="grid gap-8 py-8 md:grid-cols-3">
            <div className="max-w-md">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {site.fullName}
                </span>{" "}
                is a student-run community for learning technology by building
                it, together — workshops, hackathons, and hands-on projects
                across web, AI, security, and open source.
              </p>
            </div>

            <div>
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

            <div>
              <p className="tdc-mono-label">say hello</p>
              <ul className="mt-3 space-y-1.5">
                <li>
                  <a
                    href={`mailto:${contactDetails.email}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-target"
                  >
                    <Mail aria-hidden="true" className="size-3.5" />
                    {contactDetails.email}
                  </a>
                </li>
              </ul>
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
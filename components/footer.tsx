import Link from "next/link";
import { Mail } from "lucide-react";

import { navLinks, site } from "@/lib/navigation";
import { contactDetails } from "@/lib/site-data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">
            {site.fullName}
          </span>{" "}
          is a student-run community for learning technology by building it,
          together — workshops, hackathons, and hands-on projects across web,
          AI, security, and open source.
        </p>
        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`mailto:${contactDetails.email}`}
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Mail aria-hidden="true" className="size-3" />
              {contactDetails.email}
            </a>
          </div>
          <p>
            &copy; {year} {site.name}. {site.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}

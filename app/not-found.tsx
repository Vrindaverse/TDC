import Link from "next/link";
import { ArrowLeft, CalendarDays, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
      <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
        Error 404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        We could not find that page
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        The link may be outdated, or the page may have moved. Try heading back
        home, or check what is coming up in the events calendar.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/events">
            <CalendarDays aria-hidden="true" />
            Browse Events
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">
            <Mail aria-hidden="true" />
            Contact Us
          </Link>
        </Button>
      </div>
    </div>
  );
}
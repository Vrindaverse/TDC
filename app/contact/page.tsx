import type { Metadata } from "next";
import { Clock, Lock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { Section } from "@/components/section";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { getProfile, getSession } from "@/lib/auth/guards";
import { contactDetails } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Technocrats Developer Community about membership, collaboration, events or support.",
};

const contactItems = [
  {
    icon: Mail,
    label: "General enquiries",
    value: contactDetails.email,
    href: `mailto:${contactDetails.email}`,
  },
  {
    icon: Mail,
    label: "Support",
    value: contactDetails.supportEmail,
    href: `mailto:${contactDetails.supportEmail}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: contactDetails.phone,
    href: `tel:${contactDetails.phone.replace(/\s/g, "")}`,
  },
  {
    icon: MapPin,
    label: "Campus",
    value: contactDetails.address,
  },
  {
    icon: Clock,
    label: "Office hours",
    value: contactDetails.hours,
  },
];

async function ContactFormGate() {
  const session = await getSession();
  const profile = session?.user ? await getProfile(session.user.id) : null;

  if (profile) {
    return (
      <ContactForm
        senderName={profile.name}
        senderEmail={session?.user?.email ?? null}
      />
    );
  }

  return (
    <div className="tdc-frame rounded-[4px] border bg-card p-6 text-center">
      <p className="tdc-mono-label">$ whoami</p>
      <div className="mx-auto mt-3 flex size-12 items-center justify-center rounded-[4px] border border-border bg-muted text-muted-foreground">
        <Lock aria-hidden="true" className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold">
        Sign in to send us a message
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Only registered members of TDC can contact the admin team. If
        you&apos;re not a member yet, register first — it takes a minute.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Create an account</Link>
        </Button>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Section className="tdc-reveal">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            description="Have a question, want to collaborate, or want to know more about TDC? Send us a message and a core team member will get back to you."
            size="page"
            level={1}
          />

          <div className="mt-10">
            <TerminalPanel
              title="~/tdc/contact --channels"
              badge="05 answers"
              scanlines
            >
              <ul className="flex flex-col gap-5">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  const body = (
                    <>
                      <span
                        aria-hidden="true"
                        className="tdc-mono pt-0.5 text-sm text-primary"
                      >
                        $
                      </span>
                      <Icon
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <span className="min-w-0">
                        <span className="tdc-mono-label block">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {item.value}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={item.label} className="flex">
                      {item.href ? (
                        <a
                          href={item.href}
                          className="group flex items-start gap-3 transition-colors hover:text-foreground cursor-target"
                        >
                          {body}
                        </a>
                      ) : (
                        <div className="flex items-start gap-3">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </TerminalPanel>
          </div>
        </div>

        <div>
          <Suspense
            fallback={
              <div className="rounded-[4px] border bg-card p-6 text-center">
                <p className="tdc-mono-label">
                  <span className="tdc-caret">loading…</span>
                </p>
              </div>
            }
          >
            <ContactFormGate />
          </Suspense>
        </div>
      </div>
    </Section>
  );
}
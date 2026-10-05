import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { Section } from "@/components/section";
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

export default function ContactPage() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            description="Have a question, want to collaborate, or want to know more about TDC? Send us a message and a core team member will get back to you."
            size="page"
            level={1}
          />

          <ul className="mt-10 flex flex-col gap-5">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {item.value}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={item.label} className="flex gap-3">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex gap-3 transition-colors hover:text-foreground"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="flex gap-3">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
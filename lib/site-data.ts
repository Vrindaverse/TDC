import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  Bot,
  Globe,
  Shield,
  Swords,
} from "lucide-react";

export type RegistrationStatus = "open" | "closing" | "closed";

export interface Domain {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface EventItem {
  id: string;
  title: string;
  /** Poster art used by the event cards. */
  poster: string;
  date: string;
  time: string;
  location: string;
  description: string;
  domain: string;
  registrationStatus: RegistrationStatus;
  startsAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
}

/**
 * Single source of truth for static site content. Replace these lists with
 * real data when the backend lands — every page reads from here.
 */

export const domains: Domain[] = [
  {
    slug: "web-development",
    title: "Web Development",
    description:
      "Build responsive, accessible websites and web apps with React, Next.js and modern CSS.",
    icon: Globe,
  },
  {
    slug: "app-development",
    title: "App Development",
    description:
      "Design and ship mobile experiences for Android and iOS, from prototype to release.",
    icon: AppWindow,
  },
  {
    slug: "ai-ml",
    title: "AI / ML",
    description:
      "Work on machine learning models, data pipelines and applied AI projects that solve real problems.",
    icon: Bot,
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    description:
      "Learn ethical hacking, CTF strategies, secure coding practices and how systems actually break.",
    icon: Shield,
  },
  {
    slug: "dsa",
    title: "DSA & Placements",
    description:
      "Crack coding interviews with guided DSA practice and placement preparation.",
    icon: Swords,
  },
];

export const team: TeamMember[] = [
  {
    id: "team-1",
    name: "Annand Soni",
    role: "Co-founder",
    department: "Technocrats Institute of Technology",
  },
  {
    id: "team-2",
    name: "Ankit Kumar",
    role: "Co-founder",
    department: "Technocrats Institute of Technology",
  },
  {
    id: "team-3",
    name: "Ankit Sharma",
    role: "Co-founder",
    department: "Technocrats Institute of Technology",
  },
];

export const contactDetails = {
  email: "tdc@technocrats.edu",
  supportEmail: "tdc.support@technocrats.edu",
  phone: "+91 90000 00000",
  address: "Technocrats Institute of Technology, Tech Campus Road, Hyderabad 500081",
  hours: "Monday to Saturday, 10:00 AM – 6:00 PM",
};

export const socialLinks = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Discord", href: "#" },
];
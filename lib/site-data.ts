import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  Bot,
  Boxes,
  Braces,
  Cloud,
  Cpu,
  Globe,
  Shield,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

export type RegistrationStatus = "open" | "closing" | "closed";

export interface Domain {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface CommunityStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export interface EventItem {
  id: string;
  title: string;
  /** Grayscale poster art used by the events masonry. */
  poster: string;
  /** Poster height in px as the masonry consumes it (it renders at half). */
  posterHeight: number;
  date: string;
  time: string;
  location: string;
  description: string;
  domain: string;
  registrationStatus: RegistrationStatus;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
}

export interface CommunityValue {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
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
    slug: "iot",
    title: "IoT",
    description:
      "Connect sensors, microcontrollers and embedded systems to build hardware that does something useful.",
    icon: Cpu,
  },
  {
    slug: "cloud",
    title: "Cloud",
    description:
      "Deploy, scale and observe applications using containers, CI/CD pipelines and managed services.",
    icon: Cloud,
  },
  {
    slug: "competitive-programming",
    title: "Competitive Programming",
    description:
      "Sharpen data structures and algorithms through weekly contests, editorials and peer review.",
    icon: Swords,
  },
  {
    slug: "open-source",
    title: "Open Source",
    description:
      "Read unfamiliar codebases, fix issues and ship contributions that outlive the semester.",
    icon: Braces,
  },
];

export const communityStats: CommunityStat[] = [
  {
    id: "founders",
    label: "Founded by",
    value: "3 friends",
    description:
      "Annand Soni, Ankit Kumar and Ankit Sharma started TDC.",
    icon: Users,
  },
  {
    id: "domains",
    label: "Tech tracks",
    value: "08",
    description: "From web and apps to AI, cloud and security.",
    icon: Cpu,
  },
  {
    id: "placements",
    label: "Focus",
    value: "Placements",
    description:
      "We prepare students with DSA, Cyber, Web Dev, App Dev and AI/ML.",
    icon: Trophy,
  },
  {
    id: "mentorship",
    label: "Mentorship",
    value: "Seniors ↔ Juniors",
    description:
      "Seniors guide juniors; like-minded people helping each other.",
    icon: Boxes,
  },
];

export const communityValues: CommunityValue[] = [
  {
    id: "learn",
    title: "Learn",
    description:
      "Concepts get reinforced by building, not by memorising. Every session ends with working code.",
    icon: Cpu,
  },
  {
    id: "build",
    title: "Build",
    description:
      "Side projects, lab contributions and internal tools count. Shipping small beats planning large.",
    icon: Boxes,
  },
  {
    id: "collaborate",
    title: "Collaborate",
    description:
      "Teams form naturally around interests, and code review is the default way we learn from each other.",
    icon: Users,
  },
  {
    id: "share",
    title: "Share",
    description:
      "Write it up, teach it back, publish the resource. What one member learns, the whole community keeps.",
    icon: Braces,
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
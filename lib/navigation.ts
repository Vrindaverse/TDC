export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export const site = {
  name: "TDC",
  fullName: "Technocrats Developer Community",
  tagline: "Build. Learn. Collaborate.",
} as const;
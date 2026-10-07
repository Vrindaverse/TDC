import {
  Bell,
  Handshake,
  CalendarDays,
  GraduationCap,
  History,
  LayoutDashboard,
  Megaphone,
  Ticket,
  Users,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Registrations", href: "/admin/registrations", icon: Ticket },
  { label: "Messages", href: "/admin/messages", icon: Bell },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Colleges", href: "/admin/colleges", icon: GraduationCap },
  { label: "Team Finder", href: "/admin/team", icon: Handshake },
  { label: "Activity", href: "/admin/activity", icon: History },
];

export const VISIT_SITE_HREF = "/?view=site";

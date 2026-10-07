import {
  Bell,
  CalendarDays,
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
];

export const VISIT_SITE_HREF = "/?view=site";
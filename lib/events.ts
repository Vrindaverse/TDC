import type { EventRecord } from "@/lib/db/schema";
import type { EventItem, RegistrationStatus } from "@/lib/site-data";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizedStatus(status: string): RegistrationStatus {
  if (status === "closing" || status === "closed") return status;
  return "open";
}

export function dbEventToItem(event: EventRecord): EventItem {
  return {
    id: event.id,
    title: event.title,
    poster: event.poster ?? "",
    posterHeight: 828,
    date: formatDate(event.startsAt),
    time: formatTime(event.startsAt),
    location: event.location ?? "Technocrats Campus",
    description: event.description ?? "",
    domain: event.domain,
    registrationStatus: normalizedStatus(event.registrationStatus),
  };
}
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "short",
  day: "numeric",
};

export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-IN", DATE_FORMAT_OPTIONS);
}

export function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString("en-IN", {
    ...DATE_FORMAT_OPTIONS,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function daysUntil(value: Date | string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((new Date(value).getTime() - Date.now()) / msPerDay);
}

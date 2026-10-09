import { z } from "zod";

export const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title is too short")
    .max(120, "Title is too long"),
  body: z
    .string()
    .trim()
    .min(10, "Add a bit more detail")
    .max(5000, "Announcement is too long"),
  audience: z.enum(["all", "members", "visitors", "team"]),
  teamId: z.string().uuid("Select a team").optional().or(z.literal("")),
});

export type AnnouncementInput = z.input<typeof announcementSchema>;

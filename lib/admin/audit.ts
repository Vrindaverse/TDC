import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

export const AUDIT_ACTIONS = [
  "user.delete",
  "user.role",
  "user.update",
  "event.create",
  "event.update",
  "event.delete",
  "event.status",
  "event.duplicate",
  "registration.delete",
  "message.read",
  "message.unread",
  "message.read_all",
  "message.delete",
  "announcement.create",
  "announcement.update",
  "announcement.delete",
  "announcement.toggle",
  "college.create",
  "college.update",
  "college.toggle",
  "college.delete",
  "team_post.approve",
  "team_post.reject",
  "team_post.delete",
  "team.create",
  "team.assign",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditEntry = {
  actorId: string | null;
  actorName: string;
  action: AuditAction;
  targetType: "user" | "event" | "registration" | "message" | "announcement" | "college" | "team_post" | "team";
  targetId?: string | null;
  detail?: string | null;
};

/**
 * Records an admin action without ever throwing — an audit failure must not
 * fail the admin operation it describes.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actorId: entry.actorId,
      actorName: entry.actorName,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      detail: entry.detail ?? null,
    });
  } catch (err) {
    console.error("[audit] failed to record entry:", err);
  }
}

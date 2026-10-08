import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const colleges = pgTable(
  "colleges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull().unique(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => ({})
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().unique(),
    name: text("name").notNull(),
    mobile: text("mobile").notNull().unique(),
    collegeId: uuid("college_id")
      .notNull()
      .references(() => colleges.id),
    enrollmentNumber: text("enrollment_number").notNull().unique(),
    role: text("role").notNull().default("USER"),
    avatarKey: text("avatar_key"),
    status: text("status").notNull().default("approved"),
    teamId: uuid("team_id").references(() => teams.id, {
      onDelete: "set null",
    }),
    skills: text("skills")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => ({
    statusCheck: check(
      "profiles_status_check",
      sql`${table.status} in ('pending', 'approved', 'rejected')`
    ),
    roleCheck: check(
      "profiles_role_check",
      sql`${table.role} in ('USER', 'ADMIN')`
    ),
    collegeIdIdx: index("profiles_college_id_idx").on(table.collegeId),
  })
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    location: text("location"),
    poster: text("poster"),
    domain: text("domain").notNull().default("Multi-domain"),
    registrationStatus: text("registration_status").notNull().default("open"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => ({
    startsAtIdx: index("events_starts_at_idx").on(table.startsAt),
    domainIdx: index("events_domain_idx").on(table.domain),
    registrationStatusIdx: index("events_registration_status_idx").on(table.registrationStatus),
    statusCheck: check(
      "events_registration_status_check",
      sql`${table.registrationStatus} in ('open', 'closing', 'closed')`
    ),
  })
);

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name"),
    email: text("email"),
    mobile: text("mobile"),
    enrollmentNumber: text("enrollment_number"),
    semester: integer("semester"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    profileEventUnique: uniqueIndex("registrations_profile_event_unique").on(
      table.profileId,
      table.eventId
    ),
    guestEventEmailUnique: uniqueIndex(
      "registrations_guest_event_email_unique"
    )
      .on(table.eventId, sql`lower(${table.email})`)
      .where(sql`${table.profileId} IS NULL`),
    eventIdIdx: index("registrations_event_id_idx").on(table.eventId),
    profileIdIdx: index("registrations_profile_id_idx").on(table.profileId),
  })
);

/**
 * Server-side staging for a registration between account creation and OTP
 * verification. Holds only the TDC profile fields the user typed — never
 * passwords, OTPs, tokens, or session data (Neon Auth owns those).
 */
export const pendingRegistrations = pgTable("pending_registrations", {
  email: text("email").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  collegeId: uuid("college_id")
    .notNull()
    .references(() => colleges.id),
  enrollmentNumber: text("enrollment_number").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    category: text("category").notNull().default("general"),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index("contact_messages_status_idx").on(table.status),
    profileIdIdx: index("contact_messages_profile_id_idx").on(table.profileId),
    statusCheck: check(
      "contact_messages_status_check",
      sql`${table.status} in ('new', 'read')`
    ),
    categoryCheck: check(
      "contact_messages_category_check",
      sql`${table.category} in ('general', 'membership', 'event', 'collaboration', 'support', 'feedback', 'other')`
    ),
  })
);

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    pinned: boolean("pinned").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    audience: text("audience").notNull().default("all"),
    teamId: uuid("team_id").references(() => teams.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => ({
    activeIdx: index("announcements_active_idx").on(table.isActive),
    audienceIdx: index("announcements_audience_idx").on(table.audience),
    audienceCheck: check(
      "announcements_audience_check",
      sql`${table.audience} in ('all', 'members', 'visitors', 'team')`
    ),
  })
);

/**
 * Append-only record of admin console actions. `actorName` is denormalized so
 * the entry stays readable after the acting profile is deleted, in which case
 * `actorId` is set null.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    actorName: text("actor_name").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    createdAtIdx: index("audit_log_created_at_idx").on(table.createdAt),
    actionIdx: index("audit_log_action_idx").on(table.action),
  })
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(1),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    expiresAtIdx: index("rate_limits_expires_at_idx").on(table.expiresAt),
  })
);

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => ({})
);

export const teamPosts = pgTable(
  "team_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").references(() => events.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    profileIdIdx: index("team_posts_profile_id_idx").on(table.profileId),
    statusIdx: index("team_posts_status_idx").on(table.status),
    statusCheck: check(
      "team_posts_status_check",
      sql`${table.status} in ('pending', 'approved', 'rejected')`
    ),
  })
);

export type College = typeof colleges.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type EventRecord = typeof events.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type PendingRegistration = typeof pendingRegistrations.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;
export type TeamPost = typeof teamPosts.$inferSelect;
export type Team = typeof teams.$inferSelect;

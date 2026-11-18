/**
 * Schéma de la base (MariaDB / MySQL) du back-office.
 * Modifier ce fichier, puis : npm run db:generate (crée la migration SQL) et npm run db:migrate (l'applique).
 */
import { mysqlTable, int, varchar, text, longtext, datetime, mysqlEnum, boolean, date, double, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

const now = () => sql`CURRENT_TIMESTAMP`;

/** comptes de l'équipe : admin (tout) ou rédacteur (contenus seulement) */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["admin", "editor"]).notNull().default("editor"),
    active: boolean("active").notNull().default(true),
    lastLoginAt: datetime("last_login_at"),
    createdAt: datetime("created_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

/** sessions : le navigateur garde un jeton aléatoire, la base n'en garde que l'empreinte (SHA-256) */
export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("user_id").notNull(),
    expiresAt: datetime("expires_at").notNull(),
    userAgent: varchar("user_agent", { length: 255 }),
    createdAt: datetime("created_at").notNull().default(now()),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** articles du blog (contenu HTML produit par l'éditeur) */
export const posts = mysqlTable(
  "posts",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    category: varchar("category", { length: 80 }),
    excerpt: text("excerpt"),
    content: longtext("content"),
    coverUrl: varchar("cover_url", { length: 255 }),
    status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
    publishedAt: datetime("published_at"),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: varchar("seo_description", { length: 300 }),
    authorId: int("author_id"),
    createdAt: datetime("created_at").notNull().default(now()),
    updatedAt: datetime("updated_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("posts_slug_uq").on(t.slug), index("posts_status_idx").on(t.status)],
);

/** études de cas (page Réalisations) : situation → réponse → résultats */
export const caseStudies = mysqlTable(
  "case_studies",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    client: varchar("client", { length: 160 }),
    sector: varchar("sector", { length: 120 }),
    location: varchar("location", { length: 120 }),
    coverUrl: varchar("cover_url", { length: 255 }),
    situation: text("situation"),
    response: text("response"),
    results: text("results"),
    status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: datetime("created_at").notNull().default(now()),
    updatedAt: datetime("updated_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("case_studies_slug_uq").on(t.slug)],
);

/** messages reçus par les formulaires du site (contact, diagnostic…) */
export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 60 }),
    company: varchar("company", { length: 160 }),
    subject: varchar("subject", { length: 200 }),
    body: text("body").notNull(),
    source: varchar("source", { length: 60 }).notNull().default("contact"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: datetime("created_at").notNull().default(now()),
  },
  (t) => [index("messages_read_idx").on(t.isRead)],
);

/** médiathèque : images envoyées (converties en webp), stockées dans UPLOAD_DIR */
export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 200 }).notNull(),
  originalName: varchar("original_name", { length: 200 }),
  url: varchar("url", { length: 255 }).notNull(),
  mime: varchar("mime", { length: 60 }).notNull(),
  size: int("size").notNull(),
  width: int("width"),
  height: int("height"),
  alt: varchar("alt", { length: 255 }),
  uploadedBy: int("uploaded_by"),
  createdAt: datetime("created_at").notNull().default(now()),
});

/** statistiques Google Search Console, une ligne par jour (remplie plus tard par la synchronisation) */
export const gscDaily = mysqlTable("gsc_daily", {
  day: date("day", { mode: "string" }).primaryKey(),
  clicks: int("clicks").notNull().default(0),
  impressions: int("impressions").notNull().default(0),
  ctr: double("ctr").notNull().default(0),
  position: double("position").notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Media = typeof media.$inferSelect;

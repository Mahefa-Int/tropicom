/**
 * Schéma de la base (MariaDB / MySQL) du back-office.
 * Modifier ce fichier, puis : npm run db:generate (crée la migration SQL) et npm run db:migrate (l'applique).
 */
import { mysqlTable, int, varchar, text, longtext, datetime, mysqlEnum, boolean, date, double, uniqueIndex, index, primaryKey } from "drizzle-orm/mysql-core";
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

/** catégories des articles (gérées dans l'admin : ajout, renommage, suppression) */
export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: datetime("created_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("categories_slug_uq").on(t.slug)],
);

/** articles du blog (contenu HTML produit par l'éditeur) */
export const posts = mysqlTable(
  "posts",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    categoryId: int("category_id"),
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
  (t) => [uniqueIndex("posts_slug_uq").on(t.slug), index("posts_status_idx").on(t.status), index("posts_category_idx").on(t.categoryId)],
);

/** études de cas (pages /realisations/[slug]) : colonnes de base + contenu détaillé en JSON */
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
    /** anciennes colonnes, plus utilisées (remplacées par « details ») */
    situation: text("situation"),
    response: text("response"),
    results: text("results"),
    /** contenu détaillé de la page (JSON, voir lib/cases.ts) */
    details: longtext("details"),
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
  /** poids du fichier envoyé, avant optimisation (pour afficher le gain) */
  originalSize: int("original_size"),
  /** date de l'optimisation (webp + compression) ; vide = image d'origine */
  optimizedAt: datetime("optimized_at"),
  width: int("width"),
  height: int("height"),
  alt: varchar("alt", { length: 255 }),
  /** description libre de l'image (contexte, crédit photo, usage…) */
  description: text("description"),
  uploadedBy: int("uploaded_by"),
  createdAt: datetime("created_at").notNull().default(now()),
});

/** rendez-vous pris en ligne (fenêtre « Prendre rendez-vous » de la page Contact) ; heures en UTC */
export const appointments = mysqlTable(
  "appointments",
  {
    id: int("id").autoincrement().primaryKey(),
    startsAt: datetime("starts_at").notNull(),
    endsAt: datetime("ends_at").notNull(),
    kind: varchar("kind", { length: 80 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    company: varchar("company", { length: 160 }),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 60 }),
    mode: mysqlEnum("mode", ["visio", "tel"]).notNull().default("visio"),
    need: text("need"),
    /** fuseau choisi par le visiteur (pour lui écrire à son heure) */
    timezone: varchar("timezone", { length: 60 }).notNull().default("Indian/Antananarivo"),
    status: mysqlEnum("status", ["confirmed", "cancelled"]).notNull().default("confirmed"),
    createdAt: datetime("created_at").notNull().default(now()),
  },
  (t) => [index("appointments_starts_idx").on(t.startsAt)],
);

/** avis clients (copiés depuis la fiche Google), affichés dans « Nos clients en parlent » sur l'accueil */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  author: varchar("author", { length: 160 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  rating: int("rating").notNull().default(5),
  text: text("text").notNull(),
  /** date de l'avis sur Google (affichée « il y a 2 mois ») */
  reviewDate: date("review_date", { mode: "string" }),
  status: mysqlEnum("status", ["published", "draft"]).notNull().default("published"),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: datetime("created_at").notNull().default(now()),
});

/** réglages simples du site (clé → valeur), ex. note Google globale */
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: text("value").notNull(),
});

/** pages vues du site public, comptées par jour et par adresse (compteur maison, sans cookie) */
export const pageViews = mysqlTable(
  "page_views",
  {
    day: date("day", { mode: "string" }).notNull(),
    path: varchar("path", { length: 190 }).notNull(),
    views: int("views").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.path] })],
);

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
export type Category = typeof categories.$inferSelect;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Review = typeof reviews.$inferSelect;

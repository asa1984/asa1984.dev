/*
 * DO NOT RENAME THIS FILE FOR DRIZZLE-ORM TO WORK
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { CURRENT_TIMESTAMP } from "./utils";

export const blogs = sqliteTable("blogs", {
  id: text("id").primaryKey().notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  published: integer("published", { mode: "boolean" }).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").$defaultFn(CURRENT_TIMESTAMP).notNull(),
  updatedAt: text("updated_at").$defaultFn(CURRENT_TIMESTAMP).notNull(),
});
export const contexts = sqliteTable("contexts", {
  id: text("id").primaryKey().notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  emoji: text("emoji").notNull(),
  published: integer("published", { mode: "boolean" }).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").$defaultFn(CURRENT_TIMESTAMP).notNull(),
  updatedAt: text("updated_at").$defaultFn(CURRENT_TIMESTAMP).notNull(),
});

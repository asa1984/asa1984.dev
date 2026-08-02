/*
 * DO NOT RENAME THIS FILE FOR DRIZZLE-ORM TO WORK
 */

import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ISO 8601 format
const CURRENT_TIMESTAMP = () => new Date().toISOString();

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
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey().notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: text("status", {
    enum: ["in-progress", "complete", "abandoned"],
  }).notNull(),
  published: integer("published", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").$defaultFn(CURRENT_TIMESTAMP).notNull(),
});
export const tasksRelations = relations(tasks, ({ many }) => ({
  items: many(taskItems),
}));

export const taskItems = sqliteTable("task_items", {
  id: text("id").primaryKey().notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").$defaultFn(CURRENT_TIMESTAMP).notNull(),
  updatedAt: text("updated_at").$defaultFn(CURRENT_TIMESTAMP).notNull(),
  pinned: integer("pinned", { mode: "boolean" }).notNull(),
  pinnedAt: text("pinned_at").$defaultFn(CURRENT_TIMESTAMP).notNull(),
  taskId: text("task_id").notNull(),
});
export const taskItemsRelations = relations(taskItems, ({ one }) => ({
  task: one(tasks, {
    fields: [taskItems.taskId],
    references: [tasks.id],
  }),
}));

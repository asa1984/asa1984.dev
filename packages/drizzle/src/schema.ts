/*
 * DO NOT RENAME THIS FILE FOR DRIZZLE-ORM TO WORK
 */

import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
export const insertBlogSchema = createInsertSchema(blogs, {
  id: z.string().ulid(),
  updatedAt: z.string().datetime(),
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
export const insertContextSchema = createInsertSchema(contexts, {
  id: z.string().ulid(),
  emoji: z.string().emoji(), // TODO: add length validation (support emoji ligatures)
  updatedAt: z.string().datetime(),
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
export const insertTaskSchema = createInsertSchema(tasks, {
  id: z.string().ulid(),
  status: z.enum(["in-progress", "complete", "abandoned"]),
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
export const insertTaskItemSchema = createInsertSchema(taskItems, {
  id: z.string().ulid(),
  updatedAt: z.string().datetime(),
  pinnedAt: z.string().datetime(),
  taskId: z.string().ulid(),
});
export const taskItemsRelations = relations(taskItems, ({ one }) => ({
  task: one(tasks, {
    fields: [taskItems.taskId],
    references: [tasks.id],
  }),
}));

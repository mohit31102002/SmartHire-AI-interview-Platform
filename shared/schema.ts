import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull(),
  answers: jsonb("answers").$type<{question: string, answer: string}[]>().notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback").notNull(),
  tabSwitches: integer("tab_switches").notNull(),
  completed: boolean("completed").notNull().default(false),
  duration: integer("duration").notNull(), // in seconds
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
});

export const scheduledInterviews = pgTable("scheduled_interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  completed: true,
  userId: true,
  completedAt: true,
});

export const insertScheduledInterviewSchema = createInsertSchema(scheduledInterviews).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const jobRoles = [
  "Full Stack Developer",
  "Data Analyst", 
  "Data Scientist",
  "Web Developer",
  "Java Developer",
  "Python Developer",
  "Frontend Developer",
  "Backend Developer",
  "Quality Assurance Engineer"
] as const;

export type JobRole = typeof jobRoles[number];
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type ScheduledInterview = typeof scheduledInterviews.$inferSelect;
export type InsertScheduledInterview = z.infer<typeof insertScheduledInterviewSchema>;
import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  answers: jsonb("answers").$type<{question: string, answer: string}[]>().notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback").notNull(),
  tabSwitches: integer("tab_switches").notNull(),
  completed: boolean("completed").notNull().default(false),
  duration: integer("duration").notNull(), // in seconds
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  completed: true
});

export const jobRoles = [
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist", 
  "Web Developer",
  "Java Developer",
  "Python Developer",
  "Frontend Developer",
  "Backend Developer"
] as const;

export type JobRole = typeof jobRoles[number];
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

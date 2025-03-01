import { type Interview, type InsertInterview, interviews, users, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  updateInterview(id: number, data: Partial<Interview>): Promise<Interview>;
  createUser(user: InsertUser): Promise<InsertUser>;
  getUserByUsername(username: string): Promise<InsertUser | undefined>;
  getUserById(id: number): Promise<InsertUser | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const [interview] = await db
      .insert(interviews)
      .values({
        ...insertInterview,
        answers: insertInterview.answers || [],
      })
      .returning();
    return interview;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, id));
    return interview;
  }

  async updateInterview(id: number, data: Partial<Interview>): Promise<Interview> {
    const [updated] = await db
      .update(interviews)
      .set({
        ...data,
        ...(data.completed ? { completedAt: new Date() } : {}),
      })
      .where(eq(interviews.id, id))
      .returning();

    if (!updated) {
      throw new Error("Interview not found");
    }

    return updated;
  }

  async createUser(user: InsertUser): Promise<InsertUser> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUserByUsername(username: string): Promise<InsertUser | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserById(id: number): Promise<InsertUser | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }
}

export const storage = new DatabaseStorage();
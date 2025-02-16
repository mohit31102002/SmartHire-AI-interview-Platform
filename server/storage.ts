import { type Interview, type InsertInterview, interviews } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  updateInterview(id: number, data: Partial<Interview>): Promise<Interview>;
}

export class DatabaseStorage implements IStorage {
  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const [interview] = await db
      .insert(interviews)
      .values(insertInterview)
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
    return await db.transaction(async (tx) => {
      const [interview] = await tx
        .select()
        .from(interviews)
        .where(eq(interviews.id, id));

      if (!interview) {
        throw new Error("Interview not found");
      }

      const [updated] = await tx
        .update(interviews)
        .set({
          ...data,
          ...(data.completed ? { completedAt: new Date() } : {}),
        })
        .where(eq(interviews.id, id))
        .returning();

      return updated;
    });
  }
}

export const storage = new DatabaseStorage();
import { type Interview, type InsertInterview } from "@shared/schema";

export interface IStorage {
  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  updateInterview(id: number, data: Partial<Interview>): Promise<Interview>;
}

export class MemStorage implements IStorage {
  private interviews: Map<number, Interview>;
  private currentId: number;

  constructor() {
    this.interviews = new Map();
    this.currentId = 1;
  }

  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const id = this.currentId++;
    const interview: Interview = {
      ...insertInterview,
      id,
      completed: false,
    };
    this.interviews.set(id, interview);
    return interview;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    return this.interviews.get(id);
  }

  async updateInterview(id: number, data: Partial<Interview>): Promise<Interview> {
    const interview = await this.getInterview(id);
    if (!interview) {
      throw new Error("Interview not found");
    }
    
    const updated = { ...interview, ...data };
    this.interviews.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

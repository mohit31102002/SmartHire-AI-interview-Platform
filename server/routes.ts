import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertInterviewSchema } from "@shared/schema";
import { questions } from "@shared/questions";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.post("/api/interviews", async (req, res) => {
    const parsed = insertInterviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const interview = await storage.createInterview(parsed.data);
    res.json(interview);
  });

  app.get("/api/interviews/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const interview = await storage.getInterview(id);
    
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
    
    res.json(interview);
  });

  app.patch("/api/interviews/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const interview = await storage.updateInterview(id, req.body);
    res.json(interview);
  });

  app.get("/api/questions/:role", (req, res) => {
    const role = req.params.role;
    const roleQuestions = questions[role as keyof typeof questions];
    
    if (!roleQuestions) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json(roleQuestions);
  });

  return httpServer;
}

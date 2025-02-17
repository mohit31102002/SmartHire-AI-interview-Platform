import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertInterviewSchema, insertUserSchema } from "@shared/schema";
import { generateQuestion, generateFeedback } from "./services/gemini";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  userId?: number;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function registerRoutes(app: Express) {
  app.post("/api/signup", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    try {
      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword,
      });
      res.json({ message: "User created successfully" });
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        res.status(400).json({ error: "Username already taken" });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  });
  app.post("/api/interviews", authMiddleware, async (req: AuthRequest, res) => {
    const parsed = insertInterviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const interview = await storage.createInterview({
      ...parsed.data,
      userId: req.userId
    });
    res.json(interview);
  });

  app.get("/api/user/interviews", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const interviews = await storage.getUserInterviews(user.username);
      res.json(interviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interviews" });
    }
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
    const interview = await storage.getInterview(id);

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // Generate feedback if interview is being completed
    if (req.body.completed && !interview.completed) {
      const feedback = await generateFeedback(interview.role, req.body.answers, req.body.score);
      req.body.feedback = feedback;
    }

    const updated = await storage.updateInterview(id, req.body);
    res.json(updated);
  });

  app.get("/api/questions/:role/:number", async (req, res) => {
    try {
      const { role, number } = req.params;
      const question = await generateQuestion(role, parseInt(number));
      res.json({ question });
    } catch (error) {
      console.error('Error generating question:', error);
      res.status(500).json({ error: "Failed to generate question" });
    }
  });
}
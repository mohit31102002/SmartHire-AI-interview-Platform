import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jobRoles } from "@shared/schema";
import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import {
  Laptop,
  Database,
  LineChart,
  Code,
  Brain,
  TestTube,
} from "lucide-react";

const roleIcons = {
  "Full Stack Developer": Laptop,
  "Data Analyst": LineChart,
  "Data Scientist": Database,
  "Web Developer": Code,
  "Java Developer": Code,
  "Python Developer": Code,
  "Frontend Developer": Laptop,
  "Backend Developer": Database,
  "Quality Assurance Engineer": TestTube,
};

export default function Home() {
  const [, navigate] = useLocation();
  const [isStarting, setIsStarting] = useState(false);

  async function startInterview(role: string) {
    setIsStarting(true);
    try {
      const res = await apiRequest("POST", "/api/interviews", {
        role,
        answers: [],
        score: 0,
        feedback: "",
        tabSwitches: 0,
        duration: 0,
      });
      const interview = await res.json();
      navigate(`/interview/${interview.id}`);
    } catch (err) {
      console.error("Failed to start interview:", err);
      setIsStarting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              SmartHire AI Interview Platform
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of technical interviews with our AI-powered
            platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobRoles.map((role) => {
            const Icon = roleIcons[role];
            return (
              <Card
                key={role}
                className="hover:shadow-lg transition-all hover:scale-105"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {role}
                  </CardTitle>
                  <CardDescription>
                    Technical interview for {role} position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                    onClick={() => startInterview(role)}
                    disabled={isStarting}
                  >
                    Start Interview
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jobRoles } from "@shared/schema";
import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Laptop, Database, LineChart, Code } from "lucide-react";

const roleIcons = {
  "Full Stack Developer": Laptop,
  "Data Analyst": LineChart,
  "Data Scientist": Database,
  "Web Developer": Code,
  "Java Developer": Code,
  "Python Developer": Code,
  "Frontend Developer": Laptop,
  "Backend Developer": Database,
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">AI Interview Platform</h1>
          <p className="text-muted-foreground">
            Select your role to begin a 15-minute technical interview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobRoles.map((role) => {
            const Icon = roleIcons[role];
            return (
              <Card key={role} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {role}
                  </CardTitle>
                  <CardDescription>
                    Technical interview for {role} position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
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

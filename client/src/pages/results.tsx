import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, MousePointer2, Check, X, Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Results() {
  const { id } = useParams();

  const { data: interview } = useQuery({
    queryKey: [`/api/interviews/${id}`],
  });

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minutes = Math.floor(interview.duration / 60);
  const seconds = interview.duration % 60;
  const confidence = Math.min(100, Math.max(0, (interview.score / 10) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Interview Results
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{interview.score}/10</div>
              <div className="text-sm text-muted-foreground">Score</div>
              <Progress value={confidence} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <MousePointer2 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{interview.tabSwitches}</div>
              <div className="text-sm text-muted-foreground">Tab Switches</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {interview.answers.map((qa, index) => (
              <Card key={index} className={`transition-all ${
                index < interview.score ? "border-green-200" : "border-red-200"
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {index < interview.score ? (
                      <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-medium mb-2">Q{index + 1}: {qa.question}</div>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {qa.answer}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Feedback & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-line">{interview.feedback}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            onClick={() => window.location.href = "/"}
          >
            Start New Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
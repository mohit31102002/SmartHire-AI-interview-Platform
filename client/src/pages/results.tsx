import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, MousePointer2, Check, X } from "lucide-react";

export default function Results() {
  const { id } = useParams();
  
  const { data: interview } = useQuery({
    queryKey: [`/api/interviews/${id}`],
  });

  if (!interview) {
    return <div>Loading...</div>;
  }

  const minutes = Math.floor(interview.duration / 60);
  const seconds = interview.duration % 60;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Interview Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{interview.score}/10</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <MousePointer2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{interview.tabSwitches}</div>
                  <div className="text-sm text-muted-foreground">Tab Switches</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Answers Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {interview.answers.map((qa, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-2">
                        {index < interview.score ? (
                          <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">Q{index + 1}: {qa.question}</div>
                          <div className="text-sm text-muted-foreground mt-1">
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
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{interview.feedback}</p>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-8">
              <Button onClick={() => window.location.href = "/"}>
                Start New Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

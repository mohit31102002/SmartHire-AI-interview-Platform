import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Webcam from "@/components/webcam";
import VoiceInput from "@/components/voice-input";
import Timer from "@/components/timer";
import { apiRequest } from "@/lib/queryClient";
import WindowCheck from "@/components/window-check";

export default function Interview() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{question: string, answer: string}[]>([]);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const { data: interview } = useQuery({
    queryKey: [`/api/interviews/${id}`],
  });

  const { data: questions } = useQuery({
    queryKey: [`/api/questions/${interview?.role}`],
    enabled: !!interview?.role,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/interviews/${id}`, {
        answers,
        completed: true,
        tabSwitches,
        duration: 900 - timeLeft,
      });
    },
    onSuccess: () => {
      navigate(`/results/${id}`);
    },
  });

  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          if (next >= 3) {
            submitMutation.mutate();
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitMutation]);

  if (!interview || !questions) {
    return <div>Loading...</div>;
  }

  function handleNext() {
    if (!currentAnswer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before continuing",
        variant: "destructive",
      });
      return;
    }

    setAnswers(prev => [...prev, {
      question: questions[currentQuestion],
      answer: currentAnswer
    }]);
    
    setCurrentAnswer("");
    
    if (currentQuestion === questions.length - 1) {
      submitMutation.mutate();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6">
      <WindowCheck />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Webcam />
            <Timer 
              duration={900}
              onComplete={() => submitMutation.mutate()}
            />
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Tab switches: <span className="font-mono">{tabSwitches}/3</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Time Remaining
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{questions[currentQuestion]}</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg">
              <CardContent className="pt-6">
                <VoiceInput onTranscript={setCurrentAnswer} />

                <div className="flex justify-between mt-6">
                  <Button
                    variant="destructive"
                    onClick={() => submitMutation.mutate()}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Abort Interview
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                  >
                    {currentQuestion === questions.length - 1 ? "Finish" : "Next Question"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
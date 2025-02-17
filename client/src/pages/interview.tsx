import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Webcam from "@/components/webcam";
import VoiceInput from "@/components/voice-input";
import CodeEditor from "@/components/code-editor";
import Timer from "@/components/timer";
import { apiRequest } from "@/lib/queryClient";
import type { Interview } from "@shared/schema";
import { AlertTriangle } from "lucide-react";

const MAX_TAB_SWITCHES = 3;

function isCodeQuestion(question: string): boolean {
  const codeKeywords = [
    'code', 'program', 'implement', 'function', 'write', 'algorithm',
    'class', 'method', 'data structure', 'leetcode', 'coding', 'sql', 'query',
    'database', 'select', 'insert', 'update', 'delete', 'html', 'css', 'javascript',
    'react', 'component', 'nodejs', 'express', 'api', 'endpoint'
  ];
  
  // Check if the question explicitly asks for code
  const hasCodeKeyword = codeKeywords.some(keyword =>
    question.toLowerCase().includes(keyword)
  );
  
  // Check if the question starts with common coding task phrases
  const startsWithCodingTask = /^(write|create|implement|develop|code|build)/i.test(question);
  
  return hasCodeKeyword || startsWithCodingTask;
}

export default function Interview() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ question: string, answer: string }[]>([]);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [code, setCode] = useState("");
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCameraWarning, setShowCameraWarning] = useState(false);
  const TOTAL_DURATION = 1200; // 20 minutes in seconds

  const { data: interview } = useQuery<Interview>({
    queryKey: [`/api/interviews/${id}`],
  });

  const { data: currentQuestionData, isLoading: isLoadingQuestion } = useQuery<{ question: string }>({
    queryKey: [`/api/questions/${interview?.role}/${currentQuestion}`],
    enabled: !!interview?.role,
  });

  // Handle camera presence warning
  useEffect(() => {
    const checkCameraPresence = () => {
      // This is a placeholder. The actual implementation will come from your Webcam component
      // which should emit an event when the user is not visible
      const userVisible = true; // This should be replaced with actual camera check
      setShowCameraWarning(!userVisible);
    };

    const interval = setInterval(checkCameraPresence, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentQuestionData?.question) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestionData.question);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice =>
        voice.lang.startsWith('en') && voice.name.includes('Google')
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentQuestionData?.question]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const finalScore = answers.reduce((acc, answer) => {
        const length = answer.answer.trim().length;
        return acc + (length > 50 ? 1 : 0);
      }, 0);
      await apiRequest("PATCH", `/api/interviews/${id}`, {
        answers,
        completed: true,
        tabSwitches,
        score: finalScore,
        duration: elapsedTime,
      });
    },
    onSuccess: () => {
      navigate(`/results/${id}`);
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        if (prev >= TOTAL_DURATION) {
          clearInterval(timer);
          submitMutation.mutate();
          return TOTAL_DURATION;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitMutation]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount >= MAX_TAB_SWITCHES) {
            submitMutation.mutate();
            toast({
              title: "Interview Terminated",
              description: "Maximum tab switches exceeded. Your interview has been automatically submitted.",
              variant: "destructive",
            });
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitMutation, toast]);

  if (!interview || !currentQuestionData) {
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

  function handleNext() {
    if (!currentAnswer.trim() && !code.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before continuing",
        variant: "destructive",
      });
      return;
    }

    const answer = isCodeQuestion(currentQuestionData.question) ? code : currentAnswer;
    setAnswers(prev => [...prev, {
      question: currentQuestionData.question,
      answer
    }]);
    if (answer.trim().length > 50) {
      setScore(prev => prev + 1);
    }
    setCurrentAnswer("");
    setCode("");
    if (currentQuestion === 9) {
      submitMutation.mutate();
    } else {
      setCurrentQuestion(prev => prev + 1);
      window.speechSynthesis.cancel();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {showCameraWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please ensure you are visible in the camera frame.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Webcam />
            <Timer
              duration={TOTAL_DURATION}
              onComplete={() => submitMutation.mutate()}
              initialElapsed={elapsedTime}
            />
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Tab switches: <span className="font-mono text-destructive">{tabSwitches}/{MAX_TAB_SWITCHES}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {currentQuestion + 1} of 10</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (currentQuestionData.question) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(currentQuestionData.question);
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                  >
                    🔊 Read Question
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">
                  {isLoadingQuestion ? (
                    <span className="animate-pulse">Loading question...</span>
                  ) : (
                    currentQuestionData.question
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg">
              <CardContent className="pt-6">
                {isCodeQuestion(currentQuestionData.question) ? (
                  <CodeEditor
                    value={code}
                    onChange={(value) => setCode(value ?? "")}
                  />
                ) : (
                  <VoiceInput onTranscript={setCurrentAnswer} />
                )}

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
                    {currentQuestion === 9 ? "Finish" : "Next Question"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="text-center text-sm text-muted-foreground mt-8">
          Designed and developed by The Code Buster
        </footer>
      </div>
    </div>
  );
}
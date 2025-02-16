import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface TimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  initialElapsed?: number; // Add initialElapsed prop to support continuing from a specific point
}

export default function Timer({ duration, onComplete, initialElapsed = 0 }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration - initialElapsed);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <Card className="p-4 space-y-2">
      <div className="text-center font-mono text-2xl">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <Progress value={progress} className="w-full" />
    </Card>
  );
}
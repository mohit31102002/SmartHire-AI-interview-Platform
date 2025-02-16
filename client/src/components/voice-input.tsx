import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set a timeout to update the transcript
        timeoutRef.current = setTimeout(() => {
          if (finalTranscript) {
            setTranscript(prev => {
              const updated = (prev + ' ' + finalTranscript).trim();
              onTranscript(updated);
              return updated;
            });
          }
        }, 500); // Wait for 500ms to accumulate speech before updating
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          toast({
            description: "No speech detected. Please speak again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Speech Recognition Error",
            description: "Please try speaking again or type your answer",
            variant: "destructive",
          });
        }
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTranscript, toast]);

  const handleStartStop = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript(""); // Clear previous transcript
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast({
      description: "Copy and paste is disabled during the interview",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={isListening ? "destructive" : "default"}
          onClick={handleStartStop}
          className={`${isListening ? "bg-red-500 hover:bg-red-600" : ""} transition-colors relative`}
        >
          {isListening ? (
            <>
              <MicOff className="mr-2" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </>
          ) : (
            <Mic className="mr-2" />
          )}
          {isListening ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>

      <Textarea
        value={transcript}
        onChange={(e) => {
          setTranscript(e.target.value);
          onTranscript(e.target.value);
        }}
        onCopy={preventCopyPaste}
        onPaste={preventCopyPaste}
        onCut={preventCopyPaste}
        placeholder="Speak your answer or type here..."
        className="min-h-[150px] resize-none shadow-sm border-primary/20"
      />

      <p className="text-sm text-muted-foreground">
        {isListening ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Listening... Speak clearly into your microphone
          </span>
        ) : (
          "Click 'Start Recording' to answer with voice"
        )}
      </p>
    </div>
  );
}
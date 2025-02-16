import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false; // Only get final results
      recognitionRef.current.lang = 'en-US'; // Set language explicitly

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const newTranscript = result[0].transcript;
          setTranscript(prev => {
            const updated = prev + ' ' + newTranscript;
            const trimmed = updated.trim();
            onTranscript(trimmed);
            return trimmed;
          });
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
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
    };
  }, [onTranscript, toast]);

  const handleStartStop = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript(""); // Clear previous transcript
      finalTranscriptRef.current = ""; // Reset final transcript
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
          className={`${isListening ? "bg-red-500 hover:bg-red-600" : ""} transition-colors`}
        >
          {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
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
        className="min-h-[150px] resize-none shadow-sm"
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
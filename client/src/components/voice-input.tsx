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

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;

        setTranscript(prev => {
          const newTranscript = prev + ' ' + transcriptText;
          onTranscript(newTranscript.trim());
          return newTranscript;
        });
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Speech Recognition Error",
          description: "Please try speaking again or type your answer",
          variant: "destructive",
        });
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
          className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
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
        className="min-h-[150px] resize-none"
      />

      <p className="text-sm text-muted-foreground">
        {isListening ? "Listening... Speak clearly into your microphone" : "Click 'Start Recording' to answer with voice"}
      </p>
    </div>
  );
}
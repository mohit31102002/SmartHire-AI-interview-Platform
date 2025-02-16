import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  useEffect(() => {
    let recognition: SpeechRecognition | null = null;
    
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(prev => prev + transcriptText);
        onTranscript(transcript + transcriptText);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    if (isListening && recognition) {
      recognition.start();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, onTranscript, transcript]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          variant={isListening ? "destructive" : "default"}
          onClick={() => setIsListening(!isListening)}
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
        placeholder="Your answer will appear here..."
        className="min-h-[100px]"
      />
    </div>
  );
}

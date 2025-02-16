import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

export default function Webcam() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }

    setupWebcam();
    
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <Card className="w-[320px] p-2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg"
      />
    </Card>
  );
}

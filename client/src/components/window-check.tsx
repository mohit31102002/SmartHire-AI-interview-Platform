import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Maximize2 } from "lucide-react";

export default function WindowCheck() {
  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    function checkWindowSize() {
      const isMaximized = window.innerWidth >= window.screen.width * 0.9 && 
                         window.innerHeight >= window.screen.height * 0.9;
      setIsFullscreen(isMaximized);
    }

    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    
    // Check for visibility changes
    document.addEventListener('visibilitychange', checkWindowSize);

    return () => {
      window.removeEventListener('resize', checkWindowSize);
      document.removeEventListener('visibilitychange', checkWindowSize);
    };
  }, []);

  if (isFullscreen) return null;

  return (
    <AlertDialog open={!isFullscreen}>
      <AlertDialogContent className="bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-primary" />
            Please Maximize Your Window
          </AlertDialogTitle>
          <AlertDialogDescription>
            To continue with the interview, please maximize your browser window or ensure it's in full-screen mode.
            This helps maintain interview integrity and provides the best experience.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

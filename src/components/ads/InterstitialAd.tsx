import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InterstitialAdProps {
  show: boolean;
  onClose: () => void;
  context?: string;
}

const InterstitialAd = ({ show, onClose, context = "lecture" }: InterstitialAdProps) => {
  const { isPremium } = useSubscription();
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!show || isPremium) return;
    setCountdown(5);
    setCanSkip(false);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [show, isPremium]);

  if (isPremium || !show) return null;

  return (
    <Dialog open={show} onOpenChange={() => canSkip && onClose()}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="text-xs text-muted-foreground">Sponsored Content</div>
          <div className="bg-muted rounded-lg h-[250px] w-full flex items-center justify-center text-muted-foreground">
            Interstitial Ad — {context}
          </div>
          <div className="flex items-center gap-3">
            {canSkip ? (
              <Button variant="outline" size="sm" onClick={onClose} className="gap-1">
                <X className="h-3 w-3" /> Skip Ad
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">Skip in {countdown}s</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            <a href="/pricing" className="underline hover:text-primary">Go Premium</a> to remove all ads
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterstitialAd;

import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Play } from "lucide-react";

interface RewardedAdProps {
  reward: string;
  onRewardEarned: () => void;
  children: React.ReactNode;
}

const RewardedAd = ({ reward, onRewardEarned, children }: RewardedAdProps) => {
  const { isPremium } = useSubscription();
  const [showAd, setShowAd] = useState(false);
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);

  if (isPremium) return <>{children}</>;

  const handleWatch = () => {
    setWatching(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setWatching(false);
          setShowAd(false);
          onRewardEarned();
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <>
      <div onClick={() => setShowAd(true)} className="cursor-pointer">
        {children}
      </div>
      <Dialog open={showAd} onOpenChange={v => !watching && setShowAd(v)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> Watch to Unlock</DialogTitle>
            <DialogDescription>Watch a short ad to unlock: {reward}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {watching ? (
              <div className="space-y-3">
                <div className="bg-muted rounded-lg h-[150px] flex items-center justify-center text-muted-foreground text-sm">
                  Playing ad... {Math.round(progress)}%
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="bg-muted rounded-lg h-[150px] flex items-center justify-center text-muted-foreground">
                Rewarded Ad Placeholder
              </div>
            )}
          </div>
          <DialogFooter>
            {!watching && (
              <Button onClick={handleWatch} className="w-full gap-2">
                <Play className="h-4 w-4" /> Watch Ad
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RewardedAd;

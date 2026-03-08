import { useSubscription } from "@/hooks/useSubscription";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

const AdBanner = ({ slot, format = "auto", className = "" }: AdBannerProps) => {
  const { isPremium } = useSubscription();

  if (isPremium) return null;

  return (
    <div className={`w-full flex items-center justify-center bg-muted/30 border border-border rounded-lg overflow-hidden ${className}`}>
      <div className="py-6 px-4 text-center">
        <div className="text-xs text-muted-foreground mb-1">Advertisement</div>
        <div className="bg-muted rounded h-[90px] w-[728px] max-w-full flex items-center justify-center text-muted-foreground text-sm">
          Ad Slot: {slot} ({format})
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          <a href="/pricing" className="underline hover:text-primary">Upgrade to Premium</a> to remove ads
        </p>
      </div>
    </div>
  );
};

export default AdBanner;

import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

interface PremiumGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  feature?: string;
}

const PremiumGate = ({ children, fallback, feature }: PremiumGateProps) => {
  const { isPremium, loading } = useSubscription();

  if (loading) return null;
  if (isPremium) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <Card className="border-dashed border-2 border-primary/20">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="rounded-full bg-primary/10 p-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold mb-1">Premium {feature || "Content"}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Upgrade to a paid plan to unlock {feature?.toLowerCase() || "this feature"} and much more.
          </p>
        </div>
        <Link to="/pricing">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" /> View Plans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default PremiumGate;

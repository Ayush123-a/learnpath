import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ShieldAlert } from "lucide-react";

const PendingApprovalBanner = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("approval_status")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setStatus((data as any).approval_status);
      });
  }, [user]);

  if (!status || status === "approved") return null;

  if (status === "rejected") {
    return (
      <Card className="border-destructive/30 bg-destructive/5 mb-4">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Account Rejected</p>
            <p className="text-xs text-muted-foreground">Your account request was denied. Contact your college administration for details.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "suspended") {
    return (
      <Card className="border-warning/30 bg-warning/5 mb-4">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <ShieldAlert className="h-5 w-5 text-warning flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">Account Suspended</p>
            <p className="text-xs text-muted-foreground">Your account has been suspended. Contact your college administration.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5 mb-4">
      <CardContent className="flex items-center gap-3 py-3 px-4">
        <Clock className="h-5 w-5 text-primary flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-primary">Pending College Approval</p>
          <p className="text-xs text-muted-foreground">Your account is awaiting approval from your college admin. You'll be notified once approved.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalBanner;

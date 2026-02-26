import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, BarChart3, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import ParentAttendance from "@/components/parent/ParentAttendance";
import ParentPerformance from "@/components/parent/ParentPerformance";
import ParentStudyTime from "@/components/parent/ParentStudyTime";
import ParentAlerts from "@/components/parent/ParentAlerts";

const ParentDashboard = () => {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes("parent") && !roles.includes("admin")) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="ScholarsHub" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">
              <Heart className="inline h-4 w-4 text-pink-500 mr-1" />
              Parent Dashboard
            </span>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance" className="gap-2"><CheckCircle className="h-4 w-4" /> Attendance</TabsTrigger>
            <TabsTrigger value="performance" className="gap-2"><BarChart3 className="h-4 w-4" /> Performance</TabsTrigger>
            <TabsTrigger value="study-time" className="gap-2"><Clock className="h-4 w-4" /> Study Time</TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2"><AlertTriangle className="h-4 w-4" /> Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance"><ParentAttendance /></TabsContent>
          <TabsContent value="performance"><ParentPerformance /></TabsContent>
          <TabsContent value="study-time"><ParentStudyTime /></TabsContent>
          <TabsContent value="alerts"><ParentAlerts /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ParentDashboard;

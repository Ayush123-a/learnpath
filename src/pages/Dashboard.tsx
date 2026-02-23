import { useAuth, AppRole } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Users, Shield, Heart, Palette,
  LogOut, GraduationCap, BarChart3, Bell,
} from "lucide-react";
import logo from "@/assets/logo.png";

const roleConfig: Record<AppRole, { label: string; icon: typeof BookOpen; color: string; features: string[] }> = {
  student: {
    label: "Student",
    icon: GraduationCap,
    color: "bg-primary/10 text-primary",
    features: ["Video Lectures", "Notes & PPTs", "Mock Tests", "AI Doubt Solver", "GPA Calculator"],
  },
  faculty: {
    label: "Faculty",
    icon: BookOpen,
    color: "bg-green-500/10 text-green-700",
    features: ["Upload Lectures", "Create Tests", "Grade Assignments", "Answer Doubts", "Track Performance"],
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-red-500/10 text-red-700",
    features: ["Manage Users", "Manage Degrees", "Subscriptions", "Revenue Dashboard", "Analytics"],
  },
  parent: {
    label: "Parent",
    icon: Heart,
    color: "bg-pink-500/10 text-pink-700",
    features: ["Attendance Tracking", "Performance Reports", "Study Time", "Weak Subject Alerts"],
  },
  content_creator: {
    label: "Content Creator",
    icon: Palette,
    color: "bg-purple-500/10 text-purple-700",
    features: ["Upload Content", "Create Courses", "Manage Materials", "View Analytics"],
  },
};

const Dashboard = () => {
  const { user, roles, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const primaryRole = roles[0] || "student";
  const config = roleConfig[primaryRole];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="ScholarsHub" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">
              Scholars<span className="text-primary">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map((role) => {
              const rc = roleConfig[role];
              return (
                <Badge key={role} variant="secondary" className={`${rc.color} gap-1.5`}>
                  <rc.icon className="h-3 w-3" />
                  {rc.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Role Dashboard */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Icon className="h-5 w-5 text-primary" />
                {config.label} Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your {config.label.toLowerCase()} dashboard is ready. Features are being built — stay tuned!
              </p>
            </CardContent>
          </Card>

          {/* Feature cards */}
          {config.features.map((feature) => (
            <Card key={feature} className="group hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg p-3 ${config.color}`}>
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature}</h3>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

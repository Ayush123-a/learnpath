import { useAuth, AppRole } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import AdBanner from "@/components/ads/AdBanner";
import NewsFeed from "@/components/NewsFeed";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Users, Shield, Heart, Palette, CreditCard,
  LogOut, GraduationCap, Bell, Play, FileText,
  Calculator, Sparkles, FileQuestion, BarChart3,
  CalendarDays, Clock, Calendar,
} from "lucide-react";
import logo from "@/assets/logo.png";

const studentFeatures = [
  { label: "Video Lectures", icon: Play, href: "/courses", desc: "Browse & watch lectures" },
  { label: "Notes & PPTs", icon: FileText, href: "/courses", desc: "Download study materials" },
  { label: "Mock Tests", icon: FileQuestion, href: "/quizzes", desc: "Practice with timed tests" },
  { label: "AI Doubt Solver", icon: Sparkles, href: "/doubt-solver", desc: "Get instant AI help" },
  { label: "GPA Calculator", icon: Calculator, href: "/gpa-calculator", desc: "Calculate your GPA/CGPA" },
  { label: "Digital Library", icon: BookOpen, href: "/library", desc: "Browse textbooks & notes" },
  { label: "Attendance", icon: CalendarDays, href: "/attendance", desc: "Track your attendance" },
  { label: "Study Planner", icon: Clock, href: "/study-planner", desc: "Log & track study time" },
  { label: "Timetable", icon: Calendar, href: "/timetable", desc: "Build your schedule" },
  { label: "Pricing & Plans", icon: CreditCard, href: "/pricing", desc: "Upgrade your plan" },
];

const roleConfig: Record<AppRole, { label: string; icon: typeof BookOpen; color: string; features: { label: string; icon: typeof BookOpen; href: string; desc: string }[] }> = {
  student: {
    label: "Student",
    icon: GraduationCap,
    color: "bg-primary/10 text-primary",
    features: studentFeatures,
  },
  faculty: {
    label: "Faculty",
    icon: BookOpen,
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
    features: [
      { label: "Faculty Panel", icon: BookOpen, href: "/faculty", desc: "Manage all content" },
      { label: "Upload Lectures", icon: Play, href: "/faculty", desc: "Manage course content" },
      { label: "Create Tests", icon: FileQuestion, href: "/faculty", desc: "Build quizzes & exams" },
      { label: "Grade Assignments", icon: FileText, href: "/faculty", desc: "Review submissions" },
      { label: "Track Performance", icon: BarChart3, href: "/faculty", desc: "View analytics" },
    ],
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
    features: [
      { label: "Admin Panel", icon: Shield, href: "/admin", desc: "Full admin control" },
      { label: "Manage Users", icon: Users, href: "/admin", desc: "Roles & permissions" },
      { label: "Manage Degrees", icon: GraduationCap, href: "/admin", desc: "Course structure" },
      { label: "Approve Books", icon: BookOpen, href: "/admin", desc: "Library management" },
      { label: "Analytics", icon: BarChart3, href: "/admin", desc: "Platform insights" },
    ],
  },
  parent: {
    label: "Parent",
    icon: Heart,
    color: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    features: [
      { label: "Parent Dashboard", icon: Heart, href: "/parent", desc: "Monitor your child" },
      { label: "Attendance", icon: BarChart3, href: "/parent", desc: "Track attendance" },
      { label: "Performance", icon: BarChart3, href: "/parent", desc: "Quiz & test scores" },
      { label: "Study Time", icon: BarChart3, href: "/parent", desc: "Daily study hours" },
      { label: "Weak Subject Alerts", icon: BarChart3, href: "/parent", desc: "Get notified" },
    ],
  },
  content_creator: {
    label: "Content Creator",
    icon: Palette,
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    features: [
      { label: "Creator Studio", icon: Palette, href: "/creator", desc: "Upload books & news" },
      { label: "Upload Books", icon: BookOpen, href: "/creator", desc: "Add textbooks & notes" },
      { label: "Create News", icon: FileText, href: "/creator", desc: "Post announcements" },
      { label: "My Content", icon: BarChart3, href: "/creator", desc: "Track your uploads" },
    ],
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

  if (!user) return <Navigate to="/auth" replace />;


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Learn Path" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">
              Learn<span className="text-primary">Path</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <AdBanner slot="dashboard-top" format="horizontal" className="mb-6" />
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map((role) => {
              const rc = roleConfig[role];
              return (
                <Badge key={role} variant="secondary" className={`${rc.color} gap-1.5`}>
                  <rc.icon className="h-3 w-3" /> {rc.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {roles.map((role) => {
          const rc = roleConfig[role];
          const RoleIcon = rc.icon;
          return (
            <div key={role} className="mb-8">
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-display text-xl">
                    <RoleIcon className="h-5 w-5 text-primary" /> {rc.label} Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Quick access to your {rc.label.toLowerCase()} tools and features.</p>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rc.features.map((feature) => (
                  <Link key={feature.label} to={feature.href}>
                    <Card className="group hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
                      <CardContent className="flex items-center gap-4 p-6">
                        <div className={`rounded-lg p-3 ${rc.color}`}>
                          <feature.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{feature.label}</h3>
                          <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* News Feed Section */}
        <div className="mb-8">
          <NewsFeed />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

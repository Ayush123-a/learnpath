import { useAuth, AppRole } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import AdBanner from "@/components/ads/AdBanner";
import NewsFeed from "@/components/NewsFeed";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Users, Shield, Heart, Palette, CreditCard,
  LogOut, GraduationCap, Play, FileText,
  Calculator, Sparkles, FileQuestion, BarChart3,
  CalendarDays, Clock, Calendar, ChevronRight, User, Radio, Bell, Building2,
} from "lucide-react";
import logo from "@/assets/logo.png";

const studentFeatures = [
  { label: "Video Lectures", icon: Play, href: "/courses", desc: "Browse & watch lectures", color: "from-primary to-info" },
  { label: "Notes & PPTs", icon: FileText, href: "/courses", desc: "Download study materials", color: "from-accent to-warning" },
  { label: "Mock Tests", icon: FileQuestion, href: "/quizzes", desc: "Practice with timed tests", color: "from-success to-primary" },
  { label: "AI Doubt Solver", icon: Sparkles, href: "/doubt-solver", desc: "Get instant AI help", color: "from-info to-primary" },
  { label: "GPA Calculator", icon: Calculator, href: "/gpa-calculator", desc: "Calculate your GPA/CGPA", color: "from-warning to-accent" },
  { label: "Digital Library", icon: BookOpen, href: "/library", desc: "Browse textbooks & notes", color: "from-primary to-success" },
  { label: "Attendance", icon: CalendarDays, href: "/attendance", desc: "Track your attendance", color: "from-success to-info" },
  { label: "Study Planner", icon: Clock, href: "/study-planner", desc: "Log & track study time", color: "from-accent to-primary" },
  { label: "Timetable", icon: Calendar, href: "/timetable", desc: "Build your schedule", color: "from-info to-success" },
  { label: "Live Sessions", icon: Radio, href: "/sessions", desc: "Join faculty sessions", color: "from-destructive to-warning" },
  { label: "Pricing & Plans", icon: CreditCard, href: "/pricing", desc: "Upgrade your plan", color: "from-warning to-destructive" },
];

const roleConfig: Record<AppRole, { label: string; icon: typeof BookOpen; color: string; gradient: string; features: typeof studentFeatures }> = {
  student: {
    label: "Student",
    icon: GraduationCap,
    color: "bg-primary/10 text-primary",
    gradient: "from-primary to-info",
    features: studentFeatures,
  },
  faculty: {
    label: "Faculty",
    icon: BookOpen,
    color: "bg-success/10 text-success",
    gradient: "from-success to-primary",
    features: [
      { label: "Faculty Panel", icon: BookOpen, href: "/faculty", desc: "Manage all content", color: "from-success to-primary" },
      { label: "Upload Lectures", icon: Play, href: "/faculty", desc: "Manage course content", color: "from-primary to-info" },
      { label: "Create Tests", icon: FileQuestion, href: "/faculty", desc: "Build quizzes & exams", color: "from-accent to-warning" },
      { label: "Grade Assignments", icon: FileText, href: "/faculty", desc: "Review submissions", color: "from-info to-success" },
      { label: "Track Performance", icon: BarChart3, href: "/faculty", desc: "View analytics", color: "from-warning to-accent" },
      ...studentFeatures,
    ],
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-destructive/10 text-destructive",
    gradient: "from-destructive to-warning",
    features: [
      { label: "Admin Panel", icon: Shield, href: "/admin", desc: "Full admin control", color: "from-destructive to-warning" },
      { label: "Manage Users", icon: Users, href: "/admin", desc: "Roles & permissions", color: "from-primary to-info" },
      { label: "Manage Degrees", icon: GraduationCap, href: "/admin", desc: "Course structure", color: "from-success to-primary" },
      { label: "Approve Books", icon: BookOpen, href: "/admin", desc: "Library management", color: "from-accent to-warning" },
      { label: "Analytics", icon: BarChart3, href: "/admin", desc: "Platform insights", color: "from-info to-primary" },
    ],
  },
  parent: {
    label: "Parent",
    icon: Heart,
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    gradient: "from-pink-500 to-destructive",
    features: [
      { label: "Parent Dashboard", icon: Heart, href: "/parent", desc: "Monitor your child", color: "from-pink-500 to-destructive" },
      { label: "Attendance", icon: CalendarDays, href: "/parent", desc: "Track attendance", color: "from-success to-info" },
      { label: "Performance", icon: BarChart3, href: "/parent", desc: "Quiz & test scores", color: "from-primary to-info" },
      { label: "Study Time", icon: Clock, href: "/parent", desc: "Daily study hours", color: "from-accent to-warning" },
      { label: "Weak Subject Alerts", icon: Bell, href: "/parent", desc: "Get notified", color: "from-warning to-destructive" },
    ],
  },
  content_creator: {
    label: "Content Creator",
    icon: Palette,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-primary",
    features: [
      { label: "Creator Studio", icon: Palette, href: "/creator", desc: "Upload books & news", color: "from-purple-500 to-primary" },
      { label: "Upload Books", icon: BookOpen, href: "/creator", desc: "Add textbooks & notes", color: "from-primary to-info" },
      { label: "Create News", icon: FileText, href: "/creator", desc: "Post announcements", color: "from-accent to-warning" },
      { label: "My Content", icon: BarChart3, href: "/creator", desc: "Track your uploads", color: "from-success to-primary" },
    ],
  },
  college_admin: {
    label: "College Admin",
    icon: Building2,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500 to-primary",
    features: [
      { label: "College Panel", icon: Building2, href: "/college-admin", desc: "Manage your college", color: "from-indigo-500 to-primary" },
      { label: "Manage Users", icon: Users, href: "/college-admin", desc: "College users & roles", color: "from-primary to-info" },
      { label: "Manage Degrees", icon: GraduationCap, href: "/college-admin", desc: "Course structure", color: "from-success to-primary" },
    ],
  },
};

const Dashboard = () => {
  const { user, roles, collegeName, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="Learn Path" className="h-8 w-8 md:h-9 md:w-9 rounded-lg shadow-sm" />
            <span className="font-display text-lg md:text-xl font-bold">
              Learn<span className="gradient-text">Path</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 md:gap-3">
            <ThemeToggle />
            <NotificationBell />
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-9 w-9 text-muted-foreground hover:text-foreground md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="px-3 md:container py-4 md:py-8">
        <AdBanner slot="dashboard-top" format="horizontal" className="mb-4 md:mb-6" />

        {/* Welcome */}
        <div className="relative rounded-xl md:rounded-2xl overflow-hidden mb-5 md:mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-info" />
          <div className="absolute inset-0 section-pattern opacity-10" />
          <div className="relative p-5 md:p-10">
            <h1 className="font-display text-xl md:text-4xl font-bold text-primary-foreground leading-tight">
              Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}! 👋
            </h1>
            <p className="mt-1.5 md:mt-2 text-sm md:text-base text-primary-foreground/70 max-w-lg">
              {collegeName ? `${collegeName} · ` : ""}Continue your learning journey.
            </p>
            <div className="mt-3 md:mt-4 flex flex-wrap gap-1.5 md:gap-2">
              {roles.map((role) => {
                const rc = roleConfig[role];
                return (
                  <Badge key={role} className="bg-primary-foreground/20 text-primary-foreground border-0 gap-1 md:gap-1.5 backdrop-blur-sm text-xs">
                    <rc.icon className="h-3 w-3" /> {rc.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Role sections */}
        {roles.map((role) => {
          const rc = roleConfig[role];
          const RoleIcon = rc.icon;
          return (
            <div key={role} className="mb-6 md:mb-10">
              <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-5">
                <div className={`rounded-lg md:rounded-xl bg-gradient-to-br ${rc.gradient} p-2 md:p-2.5`}>
                  <RoleIcon className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                </div>
                <h2 className="font-display text-lg md:text-2xl font-bold text-foreground">{rc.label} Tools</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4">
                {rc.features.map((feature, idx) => (
                  <Link key={feature.label} to={feature.href}>
                    <div
                      className="glass-card group overflow-hidden h-full"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <div className={`h-0.5 md:h-1 bg-gradient-to-r ${feature.color}`} />
                      <div className="p-3 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                        <div className={`rounded-lg md:rounded-xl bg-gradient-to-br ${feature.color} p-2 md:p-3 shadow-sm flex-shrink-0`}>
                          <feature.icon className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs md:text-sm text-foreground group-hover:text-primary transition-colors leading-tight">{feature.label}</h3>
                          <p className="text-[10px] md:text-sm text-muted-foreground truncate mt-0.5">{feature.desc}</p>
                        </div>
                        <ChevronRight className="hidden md:block h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* News Feed */}
        <div className="mb-6 md:mb-8">
          <NewsFeed />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import { useAuth, AppRole } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import AdBanner from "@/components/ads/AdBanner";
import NewsFeed from "@/components/NewsFeed";
import NotificationBell from "@/components/NotificationBell";
import {
  BookOpen, Users, Shield, Heart, Palette, CreditCard,
  LogOut, GraduationCap, Play, FileText,
  Calculator, Sparkles, FileQuestion, BarChart3,
  CalendarDays, Clock, Calendar, ChevronRight, User, Radio, Bell, Building2, Home,
} from "lucide-react";
import logo from "@/assets/logo.png";
import PendingApprovalBanner from "@/components/PendingApprovalBanner";

// ── Feature definitions ──────────────────────────────────────
const studentFeatures = [
  { label: "Video Lectures", icon: Play,         href: "/courses",       desc: "Browse & watch lectures",      accent: "#00e5ff" },
  { label: "Notes & PPTs",   icon: FileText,      href: "/courses",       desc: "Download study materials",     accent: "#b0c6ff" },
  { label: "Mock Tests",     icon: FileQuestion,  href: "/quizzes",       desc: "Practice with timed tests",    accent: "#22ef7e" },
  { label: "AI Doubt Solver",icon: Sparkles,      href: "/doubt-solver",  desc: "Get instant AI help",          accent: "#00e5ff" },
  { label: "GPA Calculator", icon: Calculator,    href: "/gpa-calculator",desc: "Calculate your GPA/CGPA",     accent: "#b0c6ff" },
  { label: "Digital Library",icon: BookOpen,      href: "/library",       desc: "Browse textbooks & notes",     accent: "#22ef7e" },
  { label: "Attendance",     icon: CalendarDays,  href: "/attendance",    desc: "Track your attendance",        accent: "#00e5ff" },
  { label: "Study Planner",  icon: Clock,         href: "/study-planner", desc: "Log & track study time",       accent: "#b0c6ff" },
  { label: "Timetable",      icon: Calendar,      href: "/timetable",     desc: "Build your schedule",          accent: "#22ef7e" },
  { label: "Live Sessions",  icon: Radio,         href: "/sessions",      desc: "Join faculty sessions",        accent: "#00e5ff" },
  { label: "Pricing & Plans",icon: CreditCard,    href: "/pricing",       desc: "Upgrade your plan",            accent: "#b0c6ff" },
];

const roleConfig: Record<AppRole, {
  label: string;
  icon: typeof BookOpen;
  accent: string;
  features: typeof studentFeatures;
}> = {
  student: { label: "Student",        icon: GraduationCap, accent: "#00e5ff", features: studentFeatures },
  faculty: { label: "Faculty",        icon: BookOpen,      accent: "#b0c6ff", features: [
    { label: "Faculty Panel",       icon: BookOpen,     href: "/faculty",  desc: "Manage all content",       accent: "#b0c6ff" },
    { label: "Upload Lectures",     icon: Play,         href: "/faculty",  desc: "Manage course content",    accent: "#00e5ff" },
    { label: "Create Tests",        icon: FileQuestion, href: "/faculty",  desc: "Build quizzes & exams",    accent: "#22ef7e" },
    { label: "Grade Assignments",   icon: FileText,     href: "/faculty",  desc: "Review submissions",       accent: "#b0c6ff" },
    { label: "Track Performance",   icon: BarChart3,    href: "/faculty",  desc: "View analytics",           accent: "#00e5ff" },
    ...studentFeatures,
  ]},
  admin: { label: "Admin",            icon: Shield,        accent: "#ffb4ab", features: [
    { label: "Admin Panel",         icon: Shield,       href: "/admin",    desc: "Full admin control",       accent: "#ffb4ab" },
    { label: "Manage Users",        icon: Users,        href: "/admin",    desc: "Roles & permissions",      accent: "#b0c6ff" },
    { label: "Manage Degrees",      icon: GraduationCap,href: "/admin",    desc: "Course structure",         accent: "#00e5ff" },
    { label: "Approve Books",       icon: BookOpen,     href: "/admin",    desc: "Library management",       accent: "#22ef7e" },
    { label: "Analytics",           icon: BarChart3,    href: "/admin",    desc: "Platform insights",        accent: "#b0c6ff" },
  ]},
  parent: { label: "Parent",          icon: Heart,         accent: "#22ef7e", features: [
    { label: "Parent Dashboard",    icon: Heart,        href: "/parent",   desc: "Monitor your child",       accent: "#22ef7e" },
    { label: "Attendance",          icon: CalendarDays, href: "/parent",   desc: "Track attendance",         accent: "#00e5ff" },
    { label: "Performance",         icon: BarChart3,    href: "/parent",   desc: "Quiz & test scores",       accent: "#b0c6ff" },
    { label: "Study Time",          icon: Clock,        href: "/parent",   desc: "Daily study hours",        accent: "#22ef7e" },
    { label: "Alerts",              icon: Bell,         href: "/parent",   desc: "Get notified",             accent: "#ffb4ab" },
  ]},
  content_creator: { label: "Content Creator", icon: Palette, accent: "#b0c6ff", features: [
    { label: "Creator Studio",      icon: Palette,      href: "/creator",  desc: "Upload books & news",      accent: "#b0c6ff" },
    { label: "Upload Books",        icon: BookOpen,     href: "/creator",  desc: "Add textbooks & notes",    accent: "#00e5ff" },
    { label: "Create News",         icon: FileText,     href: "/creator",  desc: "Post announcements",       accent: "#22ef7e" },
    { label: "My Content",          icon: BarChart3,    href: "/creator",  desc: "Track your uploads",       accent: "#b0c6ff" },
  ]},
  college_admin: { label: "College Admin", icon: Building2, accent: "#00e5ff", features: [
    { label: "College Panel",       icon: Building2,    href: "/college-admin", desc: "Manage your college", accent: "#00e5ff" },
    { label: "Manage Users",        icon: Users,        href: "/college-admin", desc: "College users & roles",accent: "#b0c6ff" },
    { label: "Manage Degrees",      icon: GraduationCap,href: "/college-admin", desc: "Course structure",    accent: "#22ef7e" },
  ]},
};

// ── Stats from Stitch design ─────────────────────────────────
const quickStats = [
  { label: "Courses",       value: "500+",  icon: Play,        accent: "#00e5ff" },
  { label: "Subjects",      value: "50+",   icon: BookOpen,    accent: "#b0c6ff" },
  { label: "Students",      value: "10K+",  icon: Users,       accent: "#22ef7e" },
  { label: "Pass Rate",     value: "95%",   icon: GraduationCap, accent: "#ffb4ab" },
];

// ── Component ────────────────────────────────────────────────
const Dashboard = () => {
  const { user, roles, collegeName, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "radial-gradient(circle at 70% 0%, #112036 0%, #041329 60%)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4" style={{ borderColor: "rgba(0,229,255,0.2)" }} />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "#00e5ff", borderTopColor: "transparent" }} />
          </div>
          <p className="text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif", color: "#c3f5ff" }}>
            Learn<span style={{ color: "#00e5ff" }}>Path</span>
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const primaryRole = roles[0] || "student";
  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(circle at 70% 0%, #112036 0%, #041329 60%)" }}>
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full opacity-10" style={{ background: "#00e5ff", filter: "blur(110px)" }} />
        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full opacity-6" style={{ background: "#0068ed", filter: "blur(100px)" }} />
      </div>

      {/* ── Top app bar (Stitch style) ── */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="LearnPath" className="h-8 w-8 rounded-xl" />
            <span className="text-lg font-bold tracking-tight hidden sm:block" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
              Learn<span style={{ color: "#00e5ff" }}>Path</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Link to="/profile">
              <button className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-105" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)" }}>
                <User className="h-4 w-4" style={{ color: "#00e5ff" }} />
              </button>
            </Link>
            <button
              onClick={signOut}
              className="h-9 w-9 md:w-auto md:px-3 md:gap-1.5 rounded-full flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#849396" }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 md:py-8 pb-24 relative">
        <PendingApprovalBanner />
        <AdBanner slot="dashboard-top" format="horizontal" className="mb-4" />

        {/* ── Welcome hero (Stitch total balance card style) ── */}
        <section
          className="glass-card-lg p-6 md:p-8 mb-6 relative overflow-hidden group"
          style={{ boxShadow: "0 0 30px rgba(0,218,243,0.1)" }}
        >
          {/* Ambient icon */}
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <GraduationCap className="h-28 w-28" style={{ color: "#00e5ff" }} />
          </div>
          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>
              {collegeName || "LearnPath"}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold mt-1 mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-sm mb-4" style={{ color: "#849396" }}>Continue your learning journey.</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const rc = roleConfig[role];
                return (
                  <span key={role} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{ background: `${rc.accent}18`, border: `1px solid ${rc.accent}30`, color: rc.accent, fontFamily: "Inter, sans-serif" }}>
                    <rc.icon className="h-3 w-3" /> {rc.label}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Quick stats grid (Stitch Quick Actions style) ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {quickStats.map((stat) => (
            <div key={stat.label} className="glass-card p-4 flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                style={{ background: `${stat.accent}18`, border: `1px solid ${stat.accent}25` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.accent }} />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>{stat.value}</span>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#849396" }}>{stat.label}</span>
            </div>
          ))}
        </section>

        {/* ── Role feature grids ── */}
        {roles.map((role) => {
          const rc = roleConfig[role];
          const RoleIcon = rc.icon;
          return (
            <div key={role} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${rc.accent}18`, border: `1px solid ${rc.accent}25` }}>
                    <RoleIcon className="h-4 w-4" style={{ color: rc.accent }} />
                  </div>
                  <h2 className="text-base font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
                    {rc.label} Tools
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {rc.features.map((feature, idx) => (
                  <Link key={feature.label} to={feature.href} className="no-underline">
                    <div
                      className="glass-card p-4 group flex flex-col gap-3 h-full animate-fade-up"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-icon-glass"
                        style={{ background: `${feature.accent}15`, border: `1px solid ${feature.accent}25` }}>
                        <feature.icon className="h-5 w-5" style={{ color: feature.accent }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors"
                          style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
                          {feature.label}
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: "#849396" }}>{feature.desc}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 ml-auto group-hover:translate-x-1 transition-transform"
                        style={{ color: "#3b494c" }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* ── News Feed ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Latest News</span>
            <div className="live-dot" />
          </div>
          <NewsFeed />
        </div>
      </main>

      {/* ── Bottom navigation (Stitch bottom nav) ── */}
      <nav className="glass-bottom-nav fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-[68px] px-4 rounded-t-2xl">
        {[
          { icon: Home,       href: "/dashboard", label: "Home"    },
          { icon: BookOpen,   href: "/courses",   label: "Courses" },
          { icon: FileQuestion, href: "/quizzes", label: "Tests"   },
          { icon: User,       href: "/profile",   label: "Profile" },
        ].map(({ icon: Icon, href, label }) => {
          const isActive = window.location.pathname === href;
          return (
            <Link key={href} to={href} className="flex flex-col items-center gap-1 no-underline transition-all active:scale-90">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
                style={{
                  background: isActive ? "rgba(0,104,237,0.3)" : "transparent",
                  boxShadow: isActive ? "0 0 14px rgba(0,218,243,0.2)" : "none",
                }}
              >
                <Icon className="h-5 w-5 transition-colors"
                  style={{ color: isActive ? "#00e5ff" : "#849396" }} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: isActive ? "#00e5ff" : "#849396" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Dashboard;

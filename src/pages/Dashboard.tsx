import { useEffect, useState, useRef } from "react";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Navigate, Link, useLocation } from "react-router-dom";
import NewsFeed from "@/components/NewsFeed";
import NotificationBell from "@/components/NotificationBell";
import AdBanner from "@/components/ads/AdBanner";
import {
  BookOpen, Shield, Heart, Palette, CreditCard,
  LogOut, GraduationCap, Play, FileText,
  Calculator, Sparkles, FileQuestion, BarChart3,
  CalendarDays, Clock, Calendar, ChevronRight, User, Radio, Bell, Building2, Home,
  Users, TrendingUp, Award, Zap,
} from "lucide-react";
import logo from "@/assets/logo.png";
import PendingApprovalBanner from "@/components/PendingApprovalBanner";

// ─────────────────────────────────────────────
// Nexus Finance — Donut Ring SVG Component
// ─────────────────────────────────────────────
interface DonutSegment { value: number; color: string; label: string; }
function DonutChart({ segments, centerLabel, centerSub }: { segments: DonutSegment[]; centerLabel: string; centerSub: string }) {
  const r = 52; const cx = 60; const cy = 60;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const currentOffset = -offset * circumference;
          offset += pct;
          return (
            <circle
              key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth="10"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={currentOffset}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${seg.color}80)`, transition: "stroke-dasharray 1s ease" }}
            />
          );
        })}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>{centerLabel}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#849396" }}>{centerSub}</span>
      </div>
    </div>
  );
}

// Sparkline SVG
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const w = 200; const h = 50;
  const min = Math.min(...data); const max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  const filled = `0,${h} ` + pts + ` ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-auto">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={filled} fill="url(#sparkFill)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Feature navigation data
// ─────────────────────────────────────────────
const studentFeatures = [
  { label: "Video Lectures", icon: Play,        href: "/courses",        desc: "Browse & watch lectures",   accent: "#00e5ff" },
  { label: "Notes & PPTs",   icon: FileText,     href: "/courses",        desc: "Download study materials",  accent: "#b0c6ff" },
  { label: "Mock Tests",     icon: FileQuestion, href: "/quizzes",        desc: "Practice with timed tests", accent: "#22ef7e" },
  { label: "AI Doubt Solver",icon: Sparkles,     href: "/doubt-solver",   desc: "Get instant AI help",       accent: "#00e5ff" },
  { label: "GPA Calculator", icon: Calculator,   href: "/gpa-calculator", desc: "Calculate your GPA/CGPA",  accent: "#b0c6ff" },
  { label: "Digital Library",icon: BookOpen,     href: "/library",        desc: "Browse textbooks & notes",  accent: "#22ef7e" },
  { label: "Attendance",     icon: CalendarDays, href: "/attendance",     desc: "Track your attendance",     accent: "#00e5ff" },
  { label: "Study Planner",  icon: Clock,        href: "/study-planner",  desc: "Log & track study time",    accent: "#b0c6ff" },
  { label: "Timetable",      icon: Calendar,     href: "/timetable",      desc: "Build your schedule",       accent: "#22ef7e" },
  { label: "Live Sessions",  icon: Radio,        href: "/sessions",       desc: "Join faculty sessions",     accent: "#00e5ff" },
  { label: "Pricing & Plans",icon: CreditCard,   href: "/pricing",        desc: "Upgrade your plan",         accent: "#b0c6ff" },
];

const roleConfig: Record<AppRole, { label: string; icon: typeof BookOpen; accent: string; features: typeof studentFeatures }> = {
  student:         { label: "Student",        icon: GraduationCap, accent: "#00e5ff", features: studentFeatures },
  faculty:         { label: "Faculty",        icon: BookOpen,      accent: "#b0c6ff", features: [
    { label: "Faculty Panel",     icon: BookOpen,     href: "/faculty", desc: "Manage all content",    accent: "#b0c6ff" },
    { label: "Upload Lectures",   icon: Play,         href: "/faculty", desc: "Manage course content", accent: "#00e5ff" },
    { label: "Create Tests",      icon: FileQuestion, href: "/faculty", desc: "Build quizzes & exams", accent: "#22ef7e" },
    { label: "Grade Assignments", icon: FileText,     href: "/faculty", desc: "Review submissions",    accent: "#b0c6ff" },
    { label: "Analytics",         icon: BarChart3,    href: "/faculty", desc: "View analytics",        accent: "#00e5ff" },
    ...studentFeatures,
  ]},
  admin:           { label: "Admin",          icon: Shield,        accent: "#ff6b6b", features: [
    { label: "Admin Panel",   icon: Shield,        href: "/admin", desc: "Full admin control",  accent: "#ff6b6b" },
    { label: "Manage Users",  icon: Users,         href: "/admin", desc: "Roles & permissions", accent: "#b0c6ff" },
    { label: "Manage Degrees",icon: GraduationCap, href: "/admin", desc: "Course structure",    accent: "#00e5ff" },
    { label: "Approve Books", icon: BookOpen,      href: "/admin", desc: "Library management",  accent: "#22ef7e" },
    { label: "Analytics",     icon: BarChart3,     href: "/admin", desc: "Platform insights",   accent: "#b0c6ff" },
  ]},
  parent:          { label: "Parent",         icon: Heart,         accent: "#22ef7e", features: [
    { label: "Parent Dashboard", icon: Heart,        href: "/parent", desc: "Monitor your child",   accent: "#22ef7e" },
    { label: "Attendance",       icon: CalendarDays, href: "/parent", desc: "Track attendance",     accent: "#00e5ff" },
    { label: "Performance",      icon: BarChart3,    href: "/parent", desc: "Quiz & test scores",   accent: "#b0c6ff" },
    { label: "Study Time",       icon: Clock,        href: "/parent", desc: "Daily study hours",    accent: "#22ef7e" },
    { label: "Alerts",           icon: Bell,         href: "/parent", desc: "Get notified",         accent: "#ff6b6b" },
  ]},
  content_creator: { label: "Creator",        icon: Palette,       accent: "#b0c6ff", features: [
    { label: "Creator Studio", icon: Palette,  href: "/creator", desc: "Upload books & news",    accent: "#b0c6ff" },
    { label: "Upload Books",   icon: BookOpen, href: "/creator", desc: "Add textbooks & notes",  accent: "#00e5ff" },
    { label: "Create News",    icon: FileText, href: "/creator", desc: "Post announcements",     accent: "#22ef7e" },
    { label: "My Content",     icon: BarChart3,href: "/creator", desc: "Track your uploads",     accent: "#b0c6ff" },
  ]},
  college_admin:   { label: "College Admin",  icon: Building2,     accent: "#00e5ff", features: [
    { label: "College Panel",   icon: Building2,    href: "/college-admin", desc: "Manage your college",   accent: "#00e5ff" },
    { label: "Manage Users",    icon: Users,        href: "/college-admin", desc: "College users & roles", accent: "#b0c6ff" },
    { label: "Manage Degrees",  icon: GraduationCap,href: "/college-admin", desc: "Course structure",      accent: "#22ef7e" },
  ]},
};

// Donut segments for academic progress
const progressSegments: DonutSegment[] = [
  { value: 72, color: "#22ef7e", label: "Attended" },
  { value: 18, color: "#00e5ff", label: "Pending" },
  { value: 10, color: "#ff6b6b", label: "Missed" },
];

// Mock sparkline data (test scores)
const testScores = [62, 68, 71, 75, 73, 82, 85, 88];

const navItems = [
  { icon: Home,         href: "/dashboard", label: "Home"    },
  { icon: BookOpen,     href: "/courses",   label: "Courses" },
  { icon: FileQuestion, href: "/quizzes",   label: "Tests"   },
  { icon: User,         href: "/profile",   label: "Profile" },
];

// ─────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────
const Dashboard = () => {
  const { user, roles, collegeName, loading, signOut } = useAuth();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#000000" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full" style={{ border: "3px solid rgba(0,229,255,0.1)" }} />
            <div className="absolute inset-0 h-14 w-14 animate-spin rounded-full" style={{ border: "3px solid transparent", borderTopColor: "#00e5ff" }} />
          </div>
          <p className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "#c3f5ff" }}>
            Learn<span style={{ color: "#00e5ff" }}>Path</span>
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const primaryRole = roles[0] || "student";
  const rc = roleConfig[primaryRole];
  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] || "Student";
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#000000" }}>
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)", animationDelay: "-3s" }} />
        <div className="absolute inset-0 hex-pattern" />
      </div>

      {/* ── Top Bar ── */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="LearnPath" className="h-8 w-8 rounded-xl" />
            <span className="text-base font-black hidden sm:block" style={{ fontFamily: "Orbitron, monospace", color: "rgba(255,255,255,0.9)" }}>
              <span className="text-gradient-cyan">LEARN</span>PATH
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <Link to="/profile">
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.1), rgba(168,85,247,0.1))", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff" }}>
                {initials}
              </div>
            </Link>
            <button onClick={signOut} className="h-9 w-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#849396" }}>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-28 relative space-y-4">
        <PendingApprovalBanner />
        <AdBanner slot="dashboard-top" format="horizontal" className="mb-2" />

        {/* ══════════════════════════════
            HERO CARD — like "Total Portfolio Value"
            ══════════════════════════════ */}
        <div
          className={`nexus-hero-card p-6 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Mesh pattern overlay */}
          <div className="absolute inset-0 mesh-pattern opacity-30 rounded-[1.5rem]" />
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full"
            style={{ background: "#00e5ff", filter: "blur(50px)", opacity: 0.06 }} />

          <div className="relative">
            {/* College + role label */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="live-dot" />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#849396" }}>
                  {collegeName || "LearnPath"}
                </span>
              </div>
              <span className="badge-cyan text-[10px] font-orbitron">{rc.label}</span>
            </div>

            {/* Main value — like "$124,592.00" */}
            <div className="text-center mb-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 font-orbitron" style={{ color: "rgba(255,255,255,0.35)" }}>
                POWER LEVEL — CGPA
              </p>
              <div className="text-5xl font-black tracking-tight" style={{ fontFamily: "Orbitron, monospace", color: "rgba(255,255,255,0.95)", filter: "drop-shadow(0 0 20px rgba(0,245,255,0.4))" }}>
                8.4
                <span className="text-2xl font-bold ml-1 font-orbitron" style={{ color: "rgba(255,255,255,0.3)" }}>CGPA</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="nexus-chip-up">▲ +0.3 this sem</span>
                <span className="nexus-chip-neutral">86% Attendance</span>
              </div>
            </div>

            {/* Action pills — like "Add Funds" + "Send" */}
            <div className="flex gap-3 mt-5">
              <Link to="/courses" className="flex-1 nexus-action-pill nexus-action-pill-primary no-underline justify-center text-center">
                <Play className="h-3.5 w-3.5" /> Start Learning
              </Link>
              <Link to="/gpa-calculator" className="flex-1 nexus-action-pill nexus-action-pill-ghost no-underline justify-center text-center">
                <Calculator className="h-3.5 w-3.5" /> Calculate GPA
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            CHARTS ROW — Donut + Sparkline
            ══════════════════════════════ */}
        <div className="grid grid-cols-2 gap-3">
          {/* Donut — like "Asset Allocation" */}
          <div className="nexus-surface p-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1 font-orbitron" style={{ color: "rgba(255,255,255,0.3)" }}>
              STAMINA
            </p>
            <DonutChart segments={progressSegments} centerLabel="72%" centerSub="Present" />
            {/* Legend */}
            <div className="mt-3 space-y-1.5">
              {progressSegments.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</span>
                  </div>
                  <span className="text-[10px] font-black font-orbitron" style={{ color: "rgba(255,255,255,0.8)" }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sparkline — like "Spending Insight" */}
          <div className="nexus-surface p-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1 font-orbitron" style={{ color: "rgba(255,255,255,0.3)" }}>
              DMG SCORE
            </p>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-black font-orbitron" style={{ color: "#00ff80", filter: "drop-shadow(0 0 10px rgba(0,255,128,0.6))" }}>88</span>
              <span className="text-xs font-orbitron" style={{ color: "rgba(255,255,255,0.3)" }}>/100</span>
            </div>
            <Sparkline data={testScores} color="#22ef7e" />
            <p className="text-[10px] mt-2 font-orbitron" style={{ color: "rgba(255,255,255,0.25)" }}>Last 8 battles</p>
            <div className="mt-2 nexus-chip-up text-[10px] inline-flex">▲ Improving</div>
          </div>
        </div>

        {/* ══════════════════════════════
            QUICK STATS — 2x2 grid
            ══════════════════════════════ */}
        <div className="grid grid-cols-4 gap-2 animate-fade-up" style={{ animationDelay: "160ms" }}>
          {[
            { label: "Lectures", value: "500+", icon: Play,    color: "#00f5ff" },
            { label: "Subjects", value: "50+",  icon: BookOpen, color: "#a855f7" },
            { label: "Warriors", value: "10K+", icon: Users,   color: "#00ff80" },
            { label: "Pass Rate",value: "95%",  icon: Award,   color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="nexus-surface p-3 flex flex-col items-center text-center gap-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <span className="text-sm font-black font-orbitron" style={{ color: "rgba(255,255,255,0.9)" }}>{s.value}</span>
              <span className="text-[9px] uppercase tracking-wider font-orbitron" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════
            FEATURE LIST — like "Recent Transactions"
            ══════════════════════════════ */}
        {roles.map((role) => {
          const rcRole = roleConfig[role];
          return (
            <div key={role} className="nexus-surface overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
              {/* Section header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <rcRole.icon className="h-4 w-4" style={{ color: rcRole.accent }} />
                  <span className="text-xs font-bold uppercase tracking-widest font-orbitron" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {rcRole.label} OPS
                  </span>
                </div>
                <span className="nexus-chip-neutral text-[9px]">{rcRole.features.length} features</span>
              </div>

              {/* List rows — fintech style */}
              <div className="pb-2">
                {rcRole.features.map((feature, idx) => (
                  <Link key={feature.label} to={feature.href} className="no-underline block">
                    <div className="nexus-list-item group">
                      <div className="nexus-list-icon" style={{ background: `${feature.accent}12`, border: `1px solid ${feature.accent}20` }}>
                        <feature.icon className="h-4.5 w-4.5" style={{ color: feature.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate text-glitch"
                          style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Montserrat, sans-serif" }}>
                          {feature.label}
                        </p>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{feature.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: "#3b494c" }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* News Feed */}
        <div className="animate-fade-up" style={{ animationDelay: "260ms" }}>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-widest font-orbitron" style={{ color: "rgba(255,255,255,0.3)" }}>Latest Dispatch</span>
            <div className="live-dot" />
          </div>
          <NewsFeed />
        </div>
      </main>

      {/* ══════════════════════════════
          BOTTOM NAV — Nexus Finance style
          ══════════════════════════════ */}
      <nav className="glass-bottom-nav fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center h-[64px] px-6">
          {navItems.map(({ icon: Icon, href, label }) => {
            const isActive = location.pathname === href;
            return (
              <Link key={href} to={href} className="flex flex-col items-center gap-0.5 no-underline active:scale-90 transition-all">
                <div className={`flex items-center justify-center w-11 h-8 rounded-2xl transition-all duration-300 ${isActive ? "nav-pill-active" : ""}`}>
                  <Icon className="h-5 w-5 transition-colors" style={{ color: isActive ? "#00e5ff" : "#3b494c" }} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest transition-colors"
                  style={{ color: isActive ? "#00e5ff" : "#3b494c" }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;

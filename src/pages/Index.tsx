import { GraduationCap, BookOpen, Users, Trophy, ArrowRight, Sparkles, Play, Shield, Building2, Brain, Clock, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const degrees = ["BCA", "BBA", "BCom", "MCA", "MBA"];

const features = [
  {
    icon: BookOpen,
    title: "Smart Lectures",
    desc: "HD video lectures, downloadable notes & PDFs — all in one place.",
    color: "from-cyan-500/20 to-blue-600/20",
    glow: "rgba(0, 218, 243, 0.15)",
    accent: "#00e5ff",
  },
  {
    icon: Brain,
    title: "AI Doubt Solver",
    desc: "Get instant explanations for any concept, any time of day.",
    color: "from-blue-500/20 to-purple-600/20",
    glow: "rgba(0, 104, 237, 0.15)",
    accent: "#0068ed",
  },
  {
    icon: GraduationCap,
    title: "Mock Tests",
    desc: "Full-length tests with analytics to identify your weak areas.",
    color: "from-emerald-500/20 to-cyan-500/20",
    glow: "rgba(34, 239, 126, 0.15)",
    accent: "#22ef7e",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    desc: "GPA calculator, attendance tracker & performance dashboard.",
    color: "from-purple-500/20 to-blue-500/20",
    glow: "rgba(176, 198, 255, 0.15)",
    accent: "#b0c6ff",
  },
];

const stats = [
  { value: "10K+", label: "Students" },
  { value: "500+", label: "Lectures" },
  { value: "50+",  label: "Subjects" },
  { value: "95%",  label: "Pass Rate" },
];

const Index = () => {
  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(circle at 70% 0%, #112036 0%, #041329 55%)" }}>
      {/* ── Decorative blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full opacity-10" style={{ background: "#00e5ff", filter: "blur(120px)" }} />
        <div className="absolute top-1/2 -left-20 h-[400px] w-[400px] rounded-full opacity-8" style={{ background: "#0068ed", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full opacity-6" style={{ background: "#22ef7e", filter: "blur(100px)" }} />
      </div>

      {/* ── Navbar ── */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="LearnPath" className="h-9 w-9 rounded-xl" />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Learn<span style={{ color: "#00e5ff" }}>Path</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
            <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/register-college" className="hover:text-primary transition-colors">Colleges</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-primary transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="btn-primary text-sm py-2 px-5 no-underline inline-block"
              style={{ borderRadius: "9999px", fontFamily: "Montserrat, sans-serif" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 text-center">
        <div className="container relative">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.25)", color: "#00e5ff" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            India's #1 University Learning Platform
          </div>

          {/* Headline */}
          <h1
            className="mx-auto max-w-4xl text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}
          >
            Your Degree,{" "}
            <span style={{ background: "linear-gradient(135deg, #00e5ff, #b0c6ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Simplified
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed mb-10" style={{ color: "#bac9cc" }}>
            Video lectures, AI doubt-solving, mock tests & performance tracking — everything for BCA, BBA, BCom, MCA & MBA in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth" className="btn-primary no-underline text-sm font-bold flex items-center gap-2 px-7 py-3">
              Start Learning Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/courses"
              className="btn-glass no-underline text-sm flex items-center gap-2 px-7 py-3"
            >
              <Play className="h-4 w-4" /> Explore Courses
            </Link>
            <Link
              to="/register-college"
              className="btn-glass no-underline text-sm flex items-center gap-2 px-7 py-3 hidden md:flex"
            >
              <Building2 className="h-4 w-4" /> Register College
            </Link>
          </div>

          {/* Degree pills */}
          <div className="mt-14 flex flex-wrap justify-center gap-2.5">
            {degrees.map((d) => (
              <span
                key={d}
                className="px-5 py-2 rounded-full text-sm font-semibold cursor-default transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(0,229,255,0.08)",
                  border: "1px solid rgba(0,229,255,0.2)",
                  color: "#c3f5ff",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="glass-card p-5 text-center animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ fontFamily: "Montserrat, sans-serif", background: "linear-gradient(135deg, #00e5ff, #b0c6ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                >
                  {s.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#849396" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-14">
            <span className="badge-cyan inline-block mb-4">Why LearnPath?</span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}
            >
              Everything You Need to{" "}
              <span style={{ background: "linear-gradient(135deg, #22ef7e, #00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Excel
              </span>
            </h2>
            <p className="max-w-lg mx-auto text-base" style={{ color: "#bac9cc" }}>
              Built for Indian university students — works on low-end phones, slow connections, and tight budgets.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className="glass-card p-6 group animate-fade-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Accent top line */}
                <div className="h-0.5 -mx-6 -mt-6 mb-6 rounded-t-lg" style={{ background: `linear-gradient(to right, ${f.accent}, transparent)` }} />
                <div
                  className={`inline-flex rounded-xl p-3 mb-4 bg-gradient-to-br ${f.color}`}
                  style={{ boxShadow: `0 0 20px ${f.glow}` }}
                >
                  <f.icon className="h-5 w-5" style={{ color: f.accent }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#849396" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="py-10 border-y" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(17,32,54,0.3)" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm font-medium" style={{ color: "#849396" }}>
            {[
              { icon: Shield, label: "Bank-grade Security" },
              { icon: Play,   label: "HD Video Streaming" },
              { icon: Clock,  label: "24/7 Access" },
              { icon: Sparkles, label: "AI-Powered Tools" },
              { icon: Users,  label: "10K+ Students" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: "#00e5ff" }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="container">
          <div
            className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden p-10 md:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(0,104,237,0.35) 0%, rgba(0,229,255,0.15) 100%)",
              border: "1px solid rgba(0,229,255,0.2)",
              boxShadow: "0 0 60px rgba(0,218,243,0.12)",
            }}
          >
            <div className="absolute inset-0 section-pattern opacity-10" />
            <div className="relative">
              <div className="live-dot mx-auto mb-6" />
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}
              >
                Ready to Ace Your Exams?
              </h2>
              <p className="text-base mb-8" style={{ color: "#bac9cc" }}>
                Join thousands of students already excelling on LearnPath.
              </p>
              <Link to="/auth" className="btn-primary no-underline inline-flex items-center gap-2 text-base px-8 py-3 font-bold">
                Get Started — It's Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(4,19,41,0.5)" }}>
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="LearnPath" className="h-7 w-7 rounded-lg" />
            <span className="font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>LearnPath</span>
          </div>
          <p className="text-xs" style={{ color: "#849396" }}>© 2026 LearnPath. Built for Indian university students.</p>
          <div className="flex gap-5 text-xs font-medium" style={{ color: "#849396" }}>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/deployment-guide" className="hover:text-primary transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

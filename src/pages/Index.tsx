import { useEffect, useRef, useState } from "react";
import {
  GraduationCap, BookOpen, Users, Trophy, ArrowRight, Sparkles,
  Play, Brain, BarChart3, ChevronRight, Zap, Star, Shield, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

/* ─── Floating energy particle ─── */
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: Math.random() * 4 + 2 + "px",
        height: Math.random() * 4 + 2 + "px",
        ...style,
      }}
    />
  );
}

/* ─── Speed Line (background) ─── */
function SpeedLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(0,245,255,${0.04 + i * 0.01}), transparent)`,
            top: `${8 + i * 7}%`,
            left: 0, right: 0,
            transform: "scaleX(0)",
            transformOrigin: "left",
            animation: `speedLines ${2 + i * 0.3}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated stat counter ─── */
function useCounter(target: number, suffix: string, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let current = 0;
    const steps = 60;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 1800 / steps);
    return () => clearInterval(timer);
  }, [target, started]);
  return count.toLocaleString() + suffix;
}

/* ─── Energy ring burst on hover ─── */
function EnergyCard({ children, accent = "#00f5ff", delay = 0 }: {
  children: React.ReactNode; accent?: string; delay?: number;
}) {
  const [bursting, setBursting] = useState(false);
  return (
    <div
      className="glass-card p-6 group card-3d cursor-default animate-fade-up relative"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => { setBursting(true); setTimeout(() => setBursting(false), 700); }}
    >
      {/* Energy ring burst */}
      {bursting && (
        <div
          className="absolute inset-0 rounded-[1rem] pointer-events-none"
          style={{
            border: `2px solid ${accent}`,
            animation: "ringBurst 0.7s ease-out forwards",
          }}
        />
      )}
      {/* Speed lines on hover */}
      <SpeedLines />
      {children}
    </div>
  );
}

const features = [
  { icon: BookOpen, title: "Smart Lectures",   desc: "HD video lectures, downloadable notes & PDFs.",  accent: "#00f5ff", num: "01" },
  { icon: Brain,    title: "AI Doubt Solver",  desc: "Instant explanations for any concept, any time.",accent: "#a855f7", num: "02" },
  { icon: Trophy,   title: "Mock Tests",       desc: "Full tests with analytics to fix weak areas.",    accent: "#f59e0b", num: "03" },
  { icon: BarChart3,title: "Progress Tracker", desc: "GPA calculator, attendance & performance hub.",   accent: "#00ff80", num: "04" },
];

const stats = [
  { value: 10000, suffix: "+", label: "Students",  accent: "#00f5ff" },
  { value: 500,   suffix: "+", label: "Lectures",  accent: "#a855f7" },
  { value: 50,    suffix: "+", label: "Subjects",  accent: "#00ff80" },
  { value: 95,    suffix: "%", label: "Pass Rate", accent: "#f59e0b" },
];

const trust = [
  { icon: Shield,    label: "Secure"     },
  { icon: Play,      label: "HD Video"   },
  { icon: Clock,     label: "24/7 Access"},
  { icon: Sparkles,  label: "AI Powered" },
  { icon: Users,     label: "10K+ Users" },
  { icon: Star,      label: "4.9★ Rating"},
  { icon: Zap,       label: "Instant AI" },
  { icon: Trophy,    label: "95% Pass"   },
];

const degrees = ["BCA", "BBA", "BCom", "MCA", "MBA"];

function StatCard({ stat, started }: { stat: typeof stats[0]; started: boolean }) {
  const display = useCounter(stat.value, stat.suffix, started);
  return (
    <div
      className="glass-card p-5 text-center card-hover-lift"
      style={{ borderTop: `2px solid ${stat.accent}40` }}
    >
      <div
        className="text-3xl md:text-4xl font-black mb-1"
        style={{
          fontFamily: "Orbitron, monospace",
          background: `linear-gradient(135deg, ${stat.accent}, #ffffff)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          textShadow: "none",
          filter: `drop-shadow(0 0 12px ${stat.accent}80)`,
        }}
      >
        {display}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.35)" }}>
        {stat.label}
      </div>
    </div>
  );
}

const Index = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      const el = document.documentElement;
      setScrollProgress((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Particle data (stable)
  const particles = useRef(
    [...Array(30)].map((_, i) => ({
      left: `${(i * 37) % 100}%`,
      top:  `${(i * 53) % 80 + 10}%`,
      color: ["#00f5ff", "#a855f7", "#f59e0b", "#00ff80"][i % 4],
      delay: `${(i * 0.4) % 6}s`,
      duration: `${4 + (i % 4)}s`,
      drift: `${((i % 5) - 2) * 20}px`,
    }))
  );

  return (
    <div className="min-h-screen" style={{ background: "#000000" }}>
      {/* Scroll progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ── Ambient orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(0,245,255,0.07) 0%, transparent 70%)", animationDelay: "0s" }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", animationDelay: "-2s" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)", animationDelay: "-4s" }} />
        <div className="absolute inset-0 hex-pattern" />
      </div>

      {/* ── Floating particles ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {particles.current.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: p.left, top: p.top,
              width: "3px", height: "3px",
              background: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              animation: `floatParticle ${p.duration} ${p.delay} ease-in-out infinite`,
              "--drift": p.drift,
              opacity: 0,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Navbar ── */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img src={logo} alt="LearnPath" className="h-9 w-9 rounded-xl relative z-10 animate-power-up" />
              <div className="absolute inset-0 rounded-xl" style={{ background: "#00f5ff", filter: "blur(12px)", opacity: 0.2 }} />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ fontFamily: "Orbitron, monospace" }}>
              <span className="text-gradient-cyan">LEARN</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>PATH</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            {[["Courses", "/courses"], ["Pricing", "/pricing"], ["Colleges", "/register-college"]].map(([l, h]) => (
              <Link key={h} to={h}
                className="hover:text-white transition-all hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.6)] text-glitch">
                {l}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden sm:block text-sm font-semibold hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              Log in
            </Link>
            <Link to="/auth" className="btn-primary text-sm py-2 px-5 no-underline inline-flex items-center gap-1.5">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="relative pt-28 pb-24 md:pt-40 md:pb-36 text-center overflow-hidden">
        {/* Hero speed lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute h-px w-full"
              style={{
                background: `linear-gradient(90deg, transparent ${30 + i * 2}%, rgba(0,245,255,${0.02 + i * 0.005}) 50%, transparent ${70 - i * 2}%)`,
                top: `${i * 5}%`,
                transform: `translateY(${scrollY * (0.1 + i * 0.005)}px)`,
              }}
            />
          ))}
        </div>

        <div className="container relative px-4">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase animate-fade-up"
            style={{
              background: "rgba(0,245,255,0.06)",
              border: "1px solid rgba(0,245,255,0.2)",
              color: "#00f5ff",
              boxShadow: "0 0 20px rgba(0,245,255,0.15)",
              animationDelay: "0ms",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 animate-neon-flicker" />
            ⚡ LEVEL UP YOUR ACADEMICS
          </div>

          {/* Main headline — anime style */}
          <h1
            className="mx-auto max-w-4xl text-5xl md:text-7xl lg:text-8xl font-black leading-[1.0] tracking-tighter mb-6 animate-fade-up"
            style={{ fontFamily: "Montserrat, sans-serif", animationDelay: "80ms" }}
          >
            <span style={{ color: "rgba(255,255,255,0.9)" }}>YOUR</span>{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00f5ff 0%, #a855f7 50%, #f59e0b 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                backgroundSize: "200% 200%",
                animation: "gradient-shift 3s ease infinite",
                filter: "drop-shadow(0 0 30px rgba(0,245,255,0.4))",
              }}
              className="animate-gradient"
            >
              POWER
            </span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.85)" }}>LEVEL: </span>
            <span style={{ color: "#f59e0b", filter: "drop-shadow(0 0 20px rgba(245,158,11,0.6))" }}>
              SCHOLAR
            </span>
          </h1>

          <p
            className="mx-auto max-w-xl text-lg leading-relaxed mb-10 animate-fade-up"
            style={{ color: "rgba(255,255,255,0.5)", animationDelay: "160ms" }}
          >
            Master{" "}
            <span style={{ color: "#00f5ff", fontWeight: 700 }}>BCA · BBA · BCom · MCA · MBA</span>
            {" "}with AI-powered lectures, instant doubt solving, and epic mock tests.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
            <Link to="/auth" className="btn-primary no-underline text-sm font-bold flex items-center gap-2 px-8 py-3.5">
              <Zap className="h-4 w-4" /> Start Your Journey
            </Link>
            <Link to="/courses" className="btn-glass no-underline text-sm flex items-center gap-2 px-8 py-3.5">
              <Play className="h-4 w-4" /> Watch Lectures
            </Link>
          </div>

          {/* Degree pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: "320ms" }}>
            {degrees.map((d, i) => (
              <span
                key={d}
                className="px-5 py-2 rounded-full text-sm font-black cursor-default transition-all duration-300 hover:scale-110"
                style={{
                  fontFamily: "Orbitron, monospace",
                  background: "rgba(0,0,0,0.8)",
                  border: `1px solid ${["#00f5ff","#a855f7","#f59e0b","#00ff80","#ff0050"][i]}40`,
                  color: ["#00f5ff","#a855f7","#f59e0b","#00ff80","#ff0050"][i],
                  boxShadow: `0 0 20px ${["#00f5ff","#a855f7","#f59e0b","#00ff80","#ff0050"][i]}20`,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div ref={statsRef} className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <StatCard stat={s} started={statsStarted} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
          ══════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="container px-4">
          <div className="text-center mb-16">
            <span className="badge-cyan inline-block mb-4 font-orbitron text-xs">SKILL TREE</span>
            <h2
              className="text-3xl md:text-5xl font-black mb-4"
              style={{ fontFamily: "Montserrat, sans-serif", color: "rgba(255,255,255,0.9)" }}
            >
              UNLOCK YOUR{" "}
              <span className="text-gradient-cyan">ABILITIES</span>
            </h2>
            <p className="max-w-lg mx-auto text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
              Each feature is a power-up for your academic journey.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, idx) => (
              <EnergyCard key={f.title} accent={f.accent} delay={idx * 80}>
                {/* Watermark number */}
                <div
                  className="absolute top-4 right-4 text-6xl font-black opacity-[0.04] pointer-events-none font-orbitron"
                  style={{ color: f.accent }}
                >{f.num}</div>

                {/* Top accent strip */}
                <div className="-mx-6 -mt-6 mb-5 h-0.5 rounded-t-[1rem]"
                  style={{ background: `linear-gradient(90deg, ${f.accent}, ${f.accent}40, transparent)` }} />

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${f.accent}10`,
                    border: `1px solid ${f.accent}30`,
                    boxShadow: `0 0 20px ${f.accent}25, 0 0 40px ${f.accent}10`,
                  }}
                >
                  <f.icon className="h-6 w-6" style={{ color: f.accent }} />
                </div>
                <h3 className="font-black text-base mb-2 text-glitch"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "rgba(255,255,255,0.9)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{f.desc}</p>
                <div
                  className="mt-4 flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: f.accent }}
                >
                  Activate <ChevronRight className="h-3 w-3" />
                </div>
              </EnergyCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MARQUEE TRUST BAR
          ══════════════════════════════════════ */}
      <section className="py-6 overflow-hidden border-y" style={{ borderColor: "rgba(0,245,255,0.08)", background: "rgba(0,0,0,0.6)" }}>
        <div className="marquee-container">
          <div className="marquee-track">
            {[...trust, ...trust].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-2.5 mx-10 text-xs font-bold whitespace-nowrap uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.12)" }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: "#00f5ff" }} />
                </div>
                {label}
                <span className="mx-2" style={{ color: "rgba(0,245,255,0.2)" }}>◆</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
          ══════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="container px-4">
          <div
            className="relative max-w-xl mx-auto rounded-3xl overflow-hidden p-10 md:p-16 text-center"
            style={{
              background: "linear-gradient(145deg, #050508 0%, #000 100%)",
              border: "1px solid rgba(0,245,255,0.2)",
              boxShadow: "0 0 0 1px rgba(0,245,255,0.05), 0 0 80px rgba(0,245,255,0.1), 0 40px 80px rgba(0,0,0,0.95)",
            }}
          >
            <div className="absolute inset-0 hex-pattern opacity-100" />
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full"
              style={{ background: "#00f5ff", filter: "blur(50px)", opacity: 0.06 }} />
            {/* Aura border */}
            <div className="absolute inset-0 rounded-3xl"
              style={{ border: "1px solid rgba(0,245,255,0.15)", animation: "energyPulse 3s ease-in-out infinite" }} />

            <div className="relative">
              <div className="live-dot mx-auto mb-6" />
              <h2
                className="text-3xl md:text-4xl font-black mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", color: "rgba(255,255,255,0.9)" }}
              >
                READY TO{" "}
                <span className="text-gradient-cyan">POWER UP?</span>
              </h2>
              <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
                Join 10,000+ students already at legendary level.
              </p>
              <Link to="/auth"
                className="btn-primary no-underline inline-flex items-center gap-2 text-base px-8 py-3.5 font-black">
                <Zap className="h-5 w-5" /> Begin Your Arc
              </Link>

              {/* Social proof */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  {[["#00f5ff","A"],["#a855f7","R"],["#f59e0b","S"],["#00ff80","M"]].map(([c,l], i) => (
                    <div key={i}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: `${c}15`, border: `1.5px solid ${c}50`, color: c, zIndex: 4 - i }}>
                      {l}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>+9,900 warriors joined</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t" style={{ borderColor: "rgba(0,245,255,0.07)", background: "rgba(0,0,0,0.8)" }}>
        <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="LearnPath" className="h-7 w-7 rounded-lg" />
            <span className="font-black text-sm font-orbitron">
              <span className="text-gradient-cyan">LEARN</span>PATH
            </span>
          </div>
          <p className="text-xs order-last md:order-none" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2026 LearnPath · Built for Indian university students ⚡
          </p>
          <div className="flex gap-5 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
            {[["Pricing","/pricing"],["Courses","/courses"],["Colleges","/register-college"]].map(([l,h]) => (
              <Link key={h} to={h} className="hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

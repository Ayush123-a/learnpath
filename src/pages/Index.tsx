import { GraduationCap, BookOpen, Users, Trophy, ArrowRight, Sparkles, Play, Shield, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const degrees = ["BCA", "BBA", "BCom", "MCA", "MBA"];

const features = [
  { icon: BookOpen, title: "Smart Learning", desc: "Video lectures, notes & AI-powered doubt solving", color: "bg-gradient-to-br from-primary to-primary/70" },
  { icon: Users, title: "Expert Faculty", desc: "Learn from top university professors", color: "bg-gradient-to-br from-secondary to-secondary/70" },
  { icon: GraduationCap, title: "Exam Ready", desc: "Mock tests, question banks & previous year papers", color: "bg-gradient-to-br from-primary/80 to-primary/40" },
  { icon: Trophy, title: "Track Progress", desc: "GPA calculator, attendance & performance analytics", color: "bg-gradient-to-br from-secondary/80 to-secondary/40" },
];

const stats = [
  { value: "10K+", label: "Students" },
  { value: "500+", label: "Lectures" },
  { value: "50+", label: "Subjects" },
  { value: "95%", label: "Pass Rate" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - Theverge Dark Canvas */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Learn Path" className="h-9 w-9 rounded-lg shadow-sm" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Learn<span className="gradient-text">Path</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hover:text-primary" asChild><Link to="/auth">Log in</Link></Button>
            <Button size="sm" className="btn-gradient" asChild><Link to="/auth">Get Started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero - Theverge Dark Editorial Canvas */}
      <section className="relative overflow-hidden py-16 md:py-40">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 section-pattern opacity-40 hidden md:block" />
        {/* Floating hazard-tape accents */}
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl animate-float hidden md:block" />
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-secondary/8 blur-3xl animate-float hidden md:block" style={{ animationDelay: "3s" }} />

        <div className="container relative text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary mb-8">
            <Sparkles className="h-4 w-4" />
            India's University Learning Platform
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
            Your Degree,{" "}
            <span className="gradient-text">Simplified</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Video lectures, notes, mock tests & AI doubt-solving — everything you need for BCA, BBA, BCom, MCA & MBA in one place.
          </p>
          <div className="mt-10 md:mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="btn-gradient gap-2 px-8 text-base h-12 w-full sm:w-auto" asChild>
              <Link to="/auth">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="btn-outline-verge gap-2 px-8 text-base h-12 w-full sm:w-auto" asChild>
              <Link to="/courses">
                <Play className="h-4 w-4" />
                Explore Courses
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="btn-outline-verge gap-2 px-8 text-base h-12 w-full sm:w-auto" asChild>
              <Link to="/register-college">
                <Building2 className="h-4 w-4" />
                Register College
              </Link>
            </Button>
          </div>

          {/* Degree Pills - Theverge Rounded Style */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {degrees.map((d) => (
              <span
                key={d}
                className="verge-pill border border-primary/25 bg-background hover:bg-primary/5 text-primary transition-all duration-200 cursor-default text-sm md:text-base"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-20 mx-auto max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Theverge Color Blocks */}
      <section className="relative border-t border-primary/10 py-20">
        <div className="absolute inset-0 section-pattern opacity-20" />
        <div className="container relative">
          <div className="text-center mb-16">
            <div className="accent-badge inline-block mb-4">Why LearnPath?</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything You Need to{" "}
              <span className="gradient-secondary">Excel</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Built for Indian university students — works on low-end phones, slow connections, and tight budgets.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className="verge-card overflow-hidden group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-6">
                  <div className={`mb-4 inline-flex rounded-2xl ${f.color} p-3 shadow-lg`}>
                    <f.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-primary/10 bg-verge-slate/30 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Bank-grade Security</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Play className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">HD Video Streaming</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered Doubt Solving</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Bold Theverge Hazard Accent */}
      <section className="py-20">
        <div className="container">
          <div className="relative mx-auto max-w-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
            <div className="absolute inset-0 section-pattern opacity-15" />
            <div className="relative p-10 text-center md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground leading-tight">
                Ready to Ace Your Exams?
              </h2>
              <p className="mt-4 text-primary-foreground/90 text-lg">
                Join thousands of students already learning on LearnPath.
              </p>
              <Button
                size="lg"
                className="mt-8 gap-2 px-8 text-base font-bold h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                asChild
              >
                <Link to="/auth">
                  Get Started — It's Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-12 bg-verge-slate/20">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Learn Path" className="h-7 w-7 rounded-lg" />
            <span className="text-sm font-bold text-foreground">LearnPath</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 LearnPath. Built for Indian university students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

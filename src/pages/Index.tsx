import { GraduationCap, BookOpen, Users, Trophy, ArrowRight, Sparkles, Play, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const degrees = ["BCA", "BBA", "BCom", "MCA", "MBA"];

const features = [
  { icon: BookOpen, title: "Smart Learning", desc: "Video lectures, notes & AI-powered doubt solving", color: "from-primary to-info" },
  { icon: Users, title: "Expert Faculty", desc: "Learn from top university professors", color: "from-accent to-warning" },
  { icon: GraduationCap, title: "Exam Ready", desc: "Mock tests, question banks & previous year papers", color: "from-success to-primary" },
  { icon: Trophy, title: "Track Progress", desc: "GPA calculator, attendance & performance analytics", color: "from-warning to-destructive" },
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
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Learn Path" className="h-9 w-9 rounded-lg shadow-sm" />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Learn<span className="gradient-text">Path</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild><Link to="/auth">Log in</Link></Button>
            <Button size="sm" className="btn-gradient rounded-lg" asChild><Link to="/auth">Get Started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 section-pattern opacity-50" />
        {/* Floating decorative orbs */}
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="container relative text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-5 py-2 text-sm font-medium text-accent mb-8 shadow-sm">
            <Sparkles className="h-4 w-4" />
            India's University Learning Platform
          </div>
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl leading-tight">
            Your Degree,{" "}
            <span className="gradient-text">Simplified</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Video lectures, notes, mock tests & AI doubt-solving — everything you need for BCA, BBA, BCom, MCA & MBA in one place.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="btn-gradient gap-2 px-8 text-base rounded-xl h-12" asChild>
              <Link to="/auth">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8 text-base rounded-xl h-12 border-border/50 hover:bg-primary/5 hover:border-primary/30" asChild>
              <Link to="/courses">
                <Play className="h-4 w-4 text-primary" />
                Explore Courses
              </Link>
            </Button>
          </div>

          {/* Degree Pills */}
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {degrees.map((d) => (
              <span
                key={d}
                className="rounded-full border border-primary/20 bg-primary/5 px-6 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-default"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 mx-auto max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative border-t border-border/30 py-20">
        <div className="absolute inset-0 section-pattern opacity-30" />
        <div className="container relative">
          <div className="text-center mb-14">
            <Badge className="gold-badge mb-4 text-sm px-4 py-1.5">Why LearnPath?</Badge>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need to{" "}
              <span className="gradient-gold">Excel</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Built for Indian university students — works on low-end phones, slow connections, and tight budgets.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className="glass-card group overflow-hidden"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`h-1 bg-gradient-to-r ${f.color}`} />
                <div className="p-6">
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${f.color} p-3 shadow-sm`}>
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border/30 bg-muted/30 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Bank-grade Security</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Play className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">HD Video Streaming</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">AI-Powered Doubt Solving</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="relative mx-auto max-w-2xl rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-info" />
            <div className="absolute inset-0 section-pattern opacity-10" />
            <div className="relative p-10 text-center md:p-14">
              <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                Ready to Ace Your Exams?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join thousands of students already learning on LearnPath.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-8 gap-2 px-8 text-base font-bold shadow-lg rounded-xl h-12"
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
      <footer className="border-t border-border/50 py-10 bg-muted/20">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Learn Path" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-sm font-bold text-foreground">LearnPath</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 LearnPath. Built for Indian university students.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

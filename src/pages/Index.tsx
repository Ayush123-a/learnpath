import { GraduationCap, BookOpen, Users, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const degrees = ["BCA", "BBA", "BCom", "MCA", "MBA"];

const features = [
  { icon: BookOpen, title: "Smart Learning", desc: "Video lectures, notes & AI-powered doubt solving" },
  { icon: Users, title: "Expert Faculty", desc: "Learn from top university professors" },
  { icon: GraduationCap, title: "Exam Ready", desc: "Mock tests, question banks & previous year papers" },
  { icon: Trophy, title: "Track Progress", desc: "GPA calculator, attendance & performance analytics" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="ScholarsHub" className="h-9 w-9 rounded" />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Scholars<span className="text-primary">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/auth">Log in</Link></Button>
            <Button size="sm" asChild><Link to="/auth">Get Started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm mb-8">
            <GraduationCap className="h-4 w-4 text-primary" />
            India's University Learning Platform
          </div>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Your Degree,{" "}
            <span className="text-primary">Simplified</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Video lectures, notes, mock tests & AI doubt-solving — everything you need for BCA, BBA, BCom, MCA & MBA in one place.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 px-8 text-base shadow-lg shadow-primary/25" asChild>
              <Link to="/auth">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8 text-base" asChild>
              <Link to="/courses">Explore Courses</Link>
            </Button>
          </div>

          {/* Degree Pills */}
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {degrees.map((d) => (
              <span
                key={d}
                className="rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-semibold text-primary"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need to{" "}
            <span className="text-primary">Excel</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
            Built for Indian university students — works on low-end phones, slow connections, and tight budgets.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-10 text-center shadow-xl shadow-primary/20 md:p-14">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Ace Your Exams?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join thousands of students already learning on ScholarsHub.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 gap-2 bg-accent text-accent-foreground px-8 text-base font-semibold shadow-lg hover:bg-accent/90"
              asChild
            >
              <Link to="/auth">
                Get Started — It's Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ScholarsHub" className="h-6 w-6 rounded" />
            <span className="font-display text-sm font-semibold text-foreground">ScholarsHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 ScholarsHub. Built for Indian university students.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ThemeToggle from "@/components/ThemeToggle";
import {
  GraduationCap, BookOpen, ChevronRight, ArrowLeft,
  Layers, FileText, Sparkles, Clock,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface Degree { id: string; name: string; code: string; duration_years: number; description: string | null; }
interface Year { id: string; year_number: number; label: string; }
interface Semester { id: string; semester_number: number; label: string; }
interface Subject { id: string; name: string; code: string; description: string | null; credits: number; }

type View = "degrees" | "years" | "semesters" | "subjects";

const degreeColors: Record<string, string> = {
  BCA: "from-primary to-info",
  BBA: "from-accent to-warning",
  BCom: "from-success to-info",
  MCA: "from-primary to-accent",
  MBA: "from-warning to-destructive",
};

const Courses = () => {
  const [view, setView] = useState<View>("degrees");
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  const { data: degrees = [], isLoading: loadingDegrees } = useQuery({
    queryKey: ["degrees-active"],
    queryFn: async () => {
      const { data } = await supabase.from("degrees").select("id, name, code, duration_years, description").eq("is_active", true).order("code");
      return (data as Degree[]) || [];
    },
  });

  const { data: years = [], isLoading: loadingYears } = useQuery({
    queryKey: ["years", selectedDegree?.id],
    queryFn: async () => {
      const { data } = await supabase.from("years").select("id, year_number, label").eq("degree_id", selectedDegree!.id).order("year_number");
      return (data as Year[]) || [];
    },
    enabled: !!selectedDegree,
  });

  const { data: semesters = [], isLoading: loadingSemesters } = useQuery({
    queryKey: ["semesters", selectedYear?.id],
    queryFn: async () => {
      const { data } = await supabase.from("semesters").select("id, semester_number, label").eq("year_id", selectedYear!.id).order("semester_number");
      return (data as Semester[]) || [];
    },
    enabled: !!selectedYear,
  });

  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ["subjects", selectedSemester?.id],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("id, name, code, description, credits").eq("semester_id", selectedSemester!.id).eq("is_active", true).order("code");
      return (data as Subject[]) || [];
    },
    enabled: !!selectedSemester,
  });

  const loading = view === "degrees" ? loadingDegrees : view === "years" ? loadingYears : view === "semesters" ? loadingSemesters : loadingSubjects;

  const selectDegree = (d: Degree) => { setSelectedDegree(d); setView("years"); };
  const selectYear = (y: Year) => { setSelectedYear(y); setView("semesters"); };
  const selectSemester = (s: Semester) => { setSelectedSemester(s); setView("subjects"); };

  const goBack = () => {
    if (view === "subjects") setView("semesters");
    else if (view === "semesters") setView("years");
    else if (view === "years") setView("degrees");
  };

  const breadcrumb = () => {
    const parts: string[] = [];
    if (selectedDegree) parts.push(selectedDegree.code);
    if (selectedYear && view !== "years") parts.push(selectedYear.label);
    if (selectedSemester && view === "subjects") parts.push(selectedSemester.label);
    return parts;
  };

  const title = () => {
    switch (view) {
      case "degrees": return "Choose Your Degree";
      case "years": return `${selectedDegree?.code} — Select Year`;
      case "semesters": return `${selectedDegree?.code} ${selectedYear?.label} — Select Semester`;
      case "subjects": return "Subjects";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="Learn Path" className="h-9 w-9 rounded-lg shadow-sm group-hover:shadow-md transition-shadow" loading="lazy" />
            <span className="font-display text-xl font-bold">
              Learn<span className="gradient-text">Path</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild><Link to="/auth">Log in</Link></Button>
            <Button size="sm" className="btn-gradient rounded-lg" asChild><Link to="/auth">Get Started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 section-pattern" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="container relative py-10 md:py-14">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-3">
            {view !== "degrees" && (
              <Button variant="outline" size="icon" onClick={goBack} className="rounded-full h-9 w-9 border-border/50 hover:bg-primary/5 hover:border-primary/30">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {breadcrumb().length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                {breadcrumb().map((p, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                    <span className="font-medium">{p}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {title()}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            {view === "degrees" && "Explore courses across all supported degree programs."}
            {view === "years" && selectedDegree?.name}
            {view === "semesters" && "Pick a semester to see available subjects."}
            {view === "subjects" && `${selectedDegree?.code} › ${selectedYear?.label} › ${selectedSemester?.label}`}
          </p>
        </div>
      </div>

      <main className="container py-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Degrees Grid */}
            {view === "degrees" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {degrees.map((d, idx) => {
                  const gradient = degreeColors[d.code] || "from-primary to-accent";
                  return (
                    <div
                      key={d.id}
                      className="glass-card cursor-pointer group overflow-hidden"
                      onClick={() => selectDegree(d)}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      {/* Color strip */}
                      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-sm`}>
                            <GraduationCap className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-foreground mb-1">{d.code}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{d.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Clock className="h-3 w-3" /> {d.duration_years} Years
                          </Badge>
                          <Badge className="gold-badge text-xs gap-1">
                            <Sparkles className="h-3 w-3" /> Popular
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Years Grid */}
            {view === "years" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {years.map((y, idx) => (
                  <div
                    key={y.id}
                    className="glass-card cursor-pointer group p-6"
                    onClick={() => selectYear(y)}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 p-3.5 group-hover:bg-primary/15 transition-colors">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-foreground">{y.label}</h3>
                        <p className="text-sm text-muted-foreground">2 Semesters</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Semesters Grid */}
            {view === "semesters" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {semesters.map((s, idx) => (
                  <div
                    key={s.id}
                    className="glass-card cursor-pointer group p-6"
                    onClick={() => selectSemester(s)}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-accent/10 p-3.5 group-hover:bg-accent/15 transition-colors">
                        <BookOpen className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-foreground">{s.label}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subjects Grid */}
            {view === "subjects" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No subjects added for this semester yet.</p>
                  </div>
                )}
                {subjects.map((s, idx) => (
                  <Link key={s.id} to={`/courses/subject/${s.id}`}>
                    <div
                      className="glass-card group p-6"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-success/10 p-3.5 group-hover:bg-success/15 transition-colors">
                          <FileText className="h-6 w-6 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{s.name}</h3>
                          <p className="text-sm text-muted-foreground">{s.code}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">{s.credits} Credits</Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Courses;

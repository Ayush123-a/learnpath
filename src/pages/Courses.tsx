import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap, BookOpen, ChevronRight, ArrowLeft,
  Layers, FileText, Sparkles, Clock,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface Degree   { id: string; name: string; code: string; duration_years: number; description: string | null; }
interface Year     { id: string; year_number: number; label: string; }
interface Semester { id: string; semester_number: number; label: string; }
interface Subject  { id: string; name: string; code: string; description: string | null; credits: number; }

type View = "degrees" | "years" | "semesters" | "subjects";

// Stitch color palette per degree
const degreeAccents: Record<string, { accent: string; glow: string }> = {
  BCA:  { accent: "#00e5ff", glow: "rgba(0,229,255,0.15)"  },
  BBA:  { accent: "#b0c6ff", glow: "rgba(176,198,255,0.15)" },
  BCom: { accent: "#22ef7e", glow: "rgba(34,239,126,0.15)"  },
  MCA:  { accent: "#00e5ff", glow: "rgba(0,229,255,0.15)"  },
  MBA:  { accent: "#ffb4ab", glow: "rgba(255,180,171,0.15)" },
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
  const selectYear   = (y: Year)   => { setSelectedYear(y); setView("semesters"); };
  const selectSemester = (s: Semester) => { setSelectedSemester(s); setView("subjects"); };

  const goBack = () => {
    if (view === "subjects")   setView("semesters");
    else if (view === "semesters") setView("years");
    else if (view === "years")     setView("degrees");
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
      case "degrees":   return "Choose Your Degree";
      case "years":     return `${selectedDegree?.code} — Select Year`;
      case "semesters": return `${selectedDegree?.code} ${selectedYear?.label} — Select Semester`;
      case "subjects":  return "Subjects";
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(circle at 70% 0%, #112036 0%, #041329 60%)" }}>
      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full opacity-10" style={{ background: "#00e5ff", filter: "blur(110px)" }} />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full opacity-6" style={{ background: "#0068ed", filter: "blur(100px)" }} />
      </div>

      {/* ── Header ── */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="LearnPath" className="h-8 w-8 rounded-xl" />
            <span className="text-lg font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
              Learn<span style={{ color: "#00e5ff" }}>Path</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="btn-glass no-underline text-sm py-2 px-4">Log in</Link>
            <Link to="/auth" className="btn-primary no-underline text-sm py-2 px-5">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden py-10 md:py-14 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 section-pattern opacity-20" />
        <div className="container relative px-4">
          {/* Breadcrumb nav */}
          <div className="mb-5 flex items-center gap-3">
            {view !== "degrees" && (
              <button
                onClick={goBack}
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff" }}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {breadcrumb().length > 0 && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "#849396" }}>
                <GraduationCap className="h-3.5 w-3.5" style={{ color: "#00e5ff" }} />
                {breadcrumb().map((p, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                    <span className="font-medium" style={{ color: "#bac9cc" }}>{p}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
            {title()}
          </h1>
          <p className="text-sm md:text-base" style={{ color: "#849396" }}>
            {view === "degrees"   && "Explore courses across all supported degree programs."}
            {view === "years"     && selectedDegree?.name}
            {view === "semesters" && "Pick a semester to see available subjects."}
            {view === "subjects"  && `${selectedDegree?.code} › ${selectedYear?.label} › ${selectedSemester?.label}`}
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="container px-4 py-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.05)" }} />
                <Skeleton className="h-5 w-3/4 mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
                <Skeleton className="h-4 w-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── Degrees ── */}
            {view === "degrees" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {degrees.map((d, idx) => {
                  const { accent, glow } = degreeAccents[d.code] || { accent: "#00e5ff", glow: "rgba(0,229,255,0.15)" };
                  return (
                    <div
                      key={d.id}
                      className="glass-card cursor-pointer group overflow-hidden animate-fade-up"
                      onClick={() => selectDegree(d)}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      {/* Accent top strip */}
                      <div className="h-0.5" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${accent}18`, border: `1px solid ${accent}30`, boxShadow: `0 0 20px ${glow}` }}>
                            <GraduationCap className="h-6 w-6" style={{ color: accent }} />
                          </div>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" style={{ color: "#3b494c" }} />
                        </div>
                        <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>{d.code}</h3>
                        <p className="text-sm mb-4 line-clamp-2" style={{ color: "#849396" }}>{d.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#bac9cc" }}>
                            <Clock className="h-3 w-3" /> {d.duration_years} Years
                          </span>
                          <span className="badge-cyan">
                            <Sparkles className="h-3 w-3 inline mr-1" />Popular
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Years ── */}
            {view === "years" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {years.map((y, idx) => (
                  <div
                    key={y.id}
                    className="glass-card cursor-pointer group p-5 flex items-center gap-4 animate-fade-up"
                    onClick={() => selectYear(y)}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)" }}>
                      <Layers className="h-6 w-6" style={{ color: "#00e5ff" }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>{y.label}</h3>
                      <p className="text-xs" style={{ color: "#849396" }}>2 Semesters</p>
                    </div>
                    <div className="h-9 w-9 rounded-full flex items-center justify-center transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "#849396" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Semesters ── */}
            {view === "semesters" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {semesters.map((s, idx) => (
                  <div
                    key={s.id}
                    className="glass-card cursor-pointer group p-5 flex items-center gap-4 animate-fade-up"
                    onClick={() => selectSemester(s)}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(34,239,126,0.1)", border: "1px solid rgba(34,239,126,0.2)" }}>
                      <BookOpen className="h-6 w-6" style={{ color: "#22ef7e" }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>{s.label}</h3>
                    </div>
                    <div className="h-9 w-9 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <ChevronRight className="h-4 w-4" style={{ color: "#849396" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Subjects ── */}
            {view === "subjects" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <BookOpen className="h-8 w-8" style={{ color: "#3b494c" }} />
                    </div>
                    <p className="font-medium" style={{ color: "#849396" }}>No subjects added for this semester yet.</p>
                  </div>
                )}
                {subjects.map((s, idx) => (
                  <Link key={s.id} to={`/courses/subject/${s.id}`} className="no-underline">
                    <div className="glass-card group p-5 h-full animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(176,198,255,0.1)", border: "1px solid rgba(176,198,255,0.2)" }}>
                          <FileText className="h-6 w-6" style={{ color: "#b0c6ff" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors"
                            style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
                            {s.name}
                          </h3>
                          <p className="text-xs mb-2" style={{ color: "#849396" }}>{s.code}</p>
                          <span className="badge-cyan">{s.credits} Credits</span>
                        </div>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform mt-1"
                          style={{ color: "#3b494c" }} />
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

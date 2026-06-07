import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap, BookOpen, ChevronRight, ArrowLeft,
  Layers, FileText, Sparkles, Clock, ChevronLeft, Hash,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface Degree   { id: string; name: string; code: string; duration_years: number; description: string | null; }
interface Year     { id: string; year_number: number; label: string; }
interface Semester { id: string; semester_number: number; label: string; }
interface Subject  { id: string; name: string; code: string; description: string | null; credits: number; }

type View = "degrees" | "years" | "semesters" | "subjects";

const degreeConfig: Record<string, {
  accent: string;
  glow: string;
  gradient: string;
  description: string;
}> = {
  BCA:  { accent: "#00e5ff", glow: "rgba(0,229,255,0.2)",   gradient: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,104,237,0.08))",    description: "Bachelor of Computer Applications" },
  BBA:  { accent: "#b0c6ff", glow: "rgba(176,198,255,0.2)", gradient: "linear-gradient(135deg, rgba(176,198,255,0.15), rgba(100,120,255,0.08))", description: "Bachelor of Business Administration" },
  BCom: { accent: "#22ef7e", glow: "rgba(34,239,126,0.2)",  gradient: "linear-gradient(135deg, rgba(34,239,126,0.15), rgba(0,200,80,0.08))",     description: "Bachelor of Commerce" },
  MCA:  { accent: "#00e5ff", glow: "rgba(0,229,255,0.2)",   gradient: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(34,239,126,0.08))",    description: "Master of Computer Applications" },
  MBA:  { accent: "#ffb4ab", glow: "rgba(255,180,171,0.2)", gradient: "linear-gradient(135deg, rgba(255,180,171,0.15), rgba(200,80,60,0.08))",   description: "Master of Business Administration" },
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

  const selectDegree   = (d: Degree)   => { setSelectedDegree(d); setView("years"); };
  const selectYear     = (y: Year)     => { setSelectedYear(y); setView("semesters"); };
  const selectSemester = (s: Semester) => { setSelectedSemester(s); setView("subjects"); };

  const goBack = () => {
    if (view === "subjects")   setView("semesters");
    else if (view === "semesters") setView("years");
    else if (view === "years")     setView("degrees");
  };

  const breadcrumb = () => {
    const parts: { label: string; onClick?: () => void }[] = [];
    if (selectedDegree) parts.push({ label: selectedDegree.code });
    if (selectedYear && view !== "years") parts.push({ label: selectedYear.label });
    if (selectedSemester && view === "subjects") parts.push({ label: selectedSemester.label });
    return parts;
  };

  const title = () => {
    switch (view) {
      case "degrees":   return "Choose Your Degree";
      case "years":     return `${selectedDegree?.code} — Select Year`;
      case "semesters": return `${selectedDegree?.code} ${selectedYear?.label}`;
      case "subjects":  return "Available Subjects";
    }
  };

  const activeConfig = selectedDegree ? degreeConfig[selectedDegree.code] || degreeConfig.BCA : degreeConfig.BCA;

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at 70% -10%, #152d52 0%, #041329 55%)" }}>
      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(0,104,237,0.08) 0%, transparent 70%)", animationDelay: "-2s" }} />
        <div className="absolute inset-0 mesh-pattern opacity-40" />
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
      <div className="relative overflow-hidden py-10 md:py-16 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Pattern */}
        <div className="absolute inset-0 section-pattern opacity-30" />
        {/* Dynamic accent glow */}
        {selectedDegree && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full"
            style={{ background: activeConfig.accent, filter: "blur(80px)", opacity: 0.06 }} />
        )}

        <div className="container relative px-4">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2.5 flex-wrap">
            {view !== "degrees" && (
              <button
                onClick={goBack}
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
                style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", boxShadow: "0 0 14px rgba(0,229,255,0.15)" }}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {breadcrumb().length > 0 && (
              <div className="flex items-center gap-1.5 text-sm overflow-x-auto scrollbar-hide" style={{ color: "#849396" }}>
                <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#00e5ff" }} />
                {breadcrumb().map((p, i) => (
                  <span key={i} className="flex items-center gap-1.5 flex-shrink-0">
                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                    <span className="font-semibold" style={{ color: "#bac9cc" }}>{p.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-up" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
            {title()}
          </h1>
          <p className="text-sm md:text-base animate-fade-up" style={{ color: "#849396", animationDelay: "80ms" }}>
            {view === "degrees"   && "Explore courses across all supported degree programs."}
            {view === "years"     && selectedDegree?.name}
            {view === "semesters" && `Pick a semester to see available subjects for ${selectedYear?.label}.`}
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
                <div className="shimmer h-12 w-12 rounded-xl mb-4" />
                <div className="shimmer h-5 w-3/4 mb-2 rounded" />
                <div className="shimmer h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── Degrees ── */}
            {view === "degrees" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {degrees.map((d, idx) => {
                  const cfg = degreeConfig[d.code] || { accent: "#00e5ff", glow: "rgba(0,229,255,0.15)", gradient: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,104,237,0.06))", description: d.name };
                  return (
                    <div
                      key={d.id}
                      className="glass-card cursor-pointer group overflow-hidden animate-fade-up card-hover-lift"
                      onClick={() => selectDegree(d)}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      {/* Full-width gradient overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ background: cfg.gradient }} />
                      {/* Accent top strip */}
                      <div className="h-1 rounded-t-[0.875rem]" style={{ background: `linear-gradient(to right, ${cfg.accent}, ${cfg.accent}60, transparent)` }} />

                      <div className="p-6 relative">
                        <div className="flex items-start justify-between mb-5">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{ background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}35`, boxShadow: `0 0 24px ${cfg.glow}` }}
                          >
                            <GraduationCap className="h-7 w-7" style={{ color: cfg.accent }} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: `${cfg.accent}15`, color: cfg.accent, border: `1px solid ${cfg.accent}25` }}>
                              {d.duration_years}Y
                            </span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" style={{ color: "#3b494c" }} />
                          </div>
                        </div>
                        <div className="text-3xl font-black mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
                          {d.code}
                        </div>
                        <p className="text-sm mb-4 leading-relaxed" style={{ color: "#849396" }}>
                          {cfg.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="badge-cyan">
                            <Sparkles className="h-3 w-3 inline mr-1" />Popular
                          </span>
                          <span className="text-xs" style={{ color: "#849396" }}>
                            <Clock className="h-3 w-3 inline mr-1" />{d.duration_years} Years
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
                    className="glass-card cursor-pointer group p-5 flex items-center gap-4 animate-fade-up card-hover-lift"
                    onClick={() => selectYear(y)}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    {/* Year number badge */}
                    <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ background: `${activeConfig.accent}15`, border: `1px solid ${activeConfig.accent}30`, boxShadow: `0 0 20px ${activeConfig.glow}` }}>
                      <span className="text-lg font-black" style={{ color: activeConfig.accent, fontFamily: "Montserrat, sans-serif" }}>{y.year_number}</span>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: activeConfig.accent, opacity: 0.7 }}>Year</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>{y.label}</h3>
                      <p className="text-xs flex items-center gap-1.5" style={{ color: "#849396" }}>
                        <Layers className="h-3 w-3" /> 2 Semesters
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300"
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
                {semesters.map((s, idx) => {
                  const isFirst = s.semester_number % 2 === 1;
                  const semAccent = isFirst ? "#00e5ff" : "#22ef7e";
                  return (
                    <div
                      key={s.id}
                      className="glass-card cursor-pointer group p-5 flex items-center gap-4 animate-fade-up card-hover-lift"
                      onClick={() => selectSemester(s)}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${semAccent}15`, border: `1px solid ${semAccent}30`, boxShadow: `0 0 20px ${semAccent}20` }}>
                        <span className="text-lg font-black" style={{ color: semAccent, fontFamily: "Montserrat, sans-serif" }}>{s.semester_number}</span>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: semAccent, opacity: 0.7 }}>Sem</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>{s.label}</h3>
                        <p className="text-xs flex items-center gap-1.5" style={{ color: "#849396" }}>
                          <BookOpen className="h-3 w-3" /> View subjects
                        </p>
                      </div>
                      <div className="h-9 w-9 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <ChevronRight className="h-4 w-4" style={{ color: "#849396" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Subjects ── */}
            {view === "subjects" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.length === 0 && (
                  <div className="col-span-full text-center py-20">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <BookOpen className="h-9 w-9" style={{ color: "#3b494c" }} />
                    </div>
                    <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>No Subjects Yet</h3>
                    <p className="font-medium text-sm" style={{ color: "#849396" }}>No subjects added for this semester yet.</p>
                  </div>
                )}
                {subjects.map((s, idx) => (
                  <Link key={s.id} to={`/courses/subject/${s.id}`} className="no-underline">
                    <div className="glass-card group p-5 h-full animate-fade-up card-hover-lift" style={{ animationDelay: `${idx * 60}ms` }}>
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                          style={{ background: "rgba(176,198,255,0.12)", border: "1px solid rgba(176,198,255,0.25)", boxShadow: "0 0 16px rgba(176,198,255,0.15)" }}
                        >
                          <FileText className="h-6 w-6" style={{ color: "#b0c6ff" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2"
                            style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
                            {s.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs flex items-center gap-1" style={{ color: "#849396" }}>
                              <Hash className="h-3 w-3" />{s.code}
                            </span>
                          </div>
                          <span className="badge-cyan">{s.credits} Credits</span>
                        </div>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform mt-1 flex-shrink-0"
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

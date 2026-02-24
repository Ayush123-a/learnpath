import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap, BookOpen, ChevronRight, ArrowLeft,
  Clock, Layers, FileText,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface Degree {
  id: string;
  name: string;
  code: string;
  duration_years: number;
  description: string | null;
}

interface Year {
  id: string;
  year_number: number;
  label: string;
}

interface Semester {
  id: string;
  semester_number: number;
  label: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  credits: number;
}

type View = "degrees" | "years" | "semesters" | "subjects";

const Courses = () => {
  const [view, setView] = useState<View>("degrees");
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  useEffect(() => {
    loadDegrees();
  }, []);

  const loadDegrees = async () => {
    setLoading(true);
    const { data } = await supabase.from("degrees").select("*").eq("is_active", true).order("code");
    setDegrees((data as Degree[]) || []);
    setLoading(false);
  };

  const loadYears = async (degree: Degree) => {
    setSelectedDegree(degree);
    setView("years");
    setLoading(true);
    const { data } = await supabase.from("years").select("*").eq("degree_id", degree.id).order("year_number");
    setYears((data as Year[]) || []);
    setLoading(false);
  };

  const loadSemesters = async (year: Year) => {
    setSelectedYear(year);
    setView("semesters");
    setLoading(true);
    const { data } = await supabase.from("semesters").select("*").eq("year_id", year.id).order("semester_number");
    setSemesters((data as Semester[]) || []);
    setLoading(false);
  };

  const loadSubjects = async (semester: Semester) => {
    setSelectedSemester(semester);
    setView("subjects");
    setLoading(true);
    const { data } = await supabase.from("subjects").select("*").eq("semester_id", semester.id).eq("is_active", true).order("code");
    setSubjects((data as Subject[]) || []);
    setLoading(false);
  };

  const goBack = () => {
    if (view === "subjects") setView("semesters");
    else if (view === "semesters") setView("years");
    else if (view === "years") setView("degrees");
  };

  const breadcrumb = () => {
    const parts: string[] = [];
    if (selectedDegree) parts.push(selectedDegree.code);
    if (selectedYear) parts.push(selectedYear.label);
    if (selectedSemester) parts.push(selectedSemester.label);
    return parts;
  };

  const title = () => {
    switch (view) {
      case "degrees": return "Choose Your Degree";
      case "years": return `${selectedDegree?.code} — Select Year`;
      case "semesters": return `${selectedDegree?.code} ${selectedYear?.label} — Select Semester`;
      case "subjects": return `Subjects`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="ScholarsHub" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">
              Scholars<span className="text-primary">Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Back + Breadcrumb */}
        <div className="mb-6 flex items-center gap-3">
          {view !== "degrees" && (
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {breadcrumb().length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {breadcrumb().map((p, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3 w-3" />}
                  <span>{p}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">{title()}</h1>
        <p className="text-muted-foreground mb-8">
          {view === "degrees" && "Explore courses across all supported degree programs."}
          {view === "years" && `${selectedDegree?.name}`}
          {view === "semesters" && "Pick a semester to see available subjects."}
          {view === "subjects" && `${selectedDegree?.code} › ${selectedYear?.label} › ${selectedSemester?.label}`}
        </p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Degrees */}
            {view === "degrees" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {degrees.map((d) => (
                  <Card
                    key={d.id}
                    className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                    onClick={() => loadYears(d)}
                  >
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{d.code}</h3>
                        <p className="text-sm text-muted-foreground truncate">{d.name}</p>
                        <Badge variant="secondary" className="mt-1.5 text-xs">{d.duration_years} Years</Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Years */}
            {view === "years" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {years.map((y) => (
                  <Card
                    key={y.id}
                    className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                    onClick={() => loadSemesters(y)}
                  >
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{y.label}</h3>
                        <p className="text-sm text-muted-foreground">2 Semesters</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Semesters */}
            {view === "semesters" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {semesters.map((s) => (
                  <Card
                    key={s.id}
                    className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                    onClick={() => loadSubjects(s)}
                  >
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{s.label}</h3>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Subjects */}
            {view === "subjects" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-12">
                    No subjects added for this semester yet.
                  </p>
                )}
                {subjects.map((s) => (
                  <Link key={s.id} to={`/courses/subject/${s.id}`}>
                    <Card className="group hover:shadow-md hover:border-primary/30 transition-all">
                      <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{s.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{s.code} · {s.credits} Credits</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
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

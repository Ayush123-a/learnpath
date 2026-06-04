import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Calculator, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const gradePoints: Record<string, number> = {
  "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0,
};

interface Subject {
  id: string;
  name: string;
  credits: string;
  grade: string;
}

interface Semester {
  id: string;
  label: string;
  subjects: Subject[];
  gpa: number | null;
}

const createSubject = (): Subject => ({
  id: crypto.randomUUID(), name: "", credits: "3", grade: "",
});

const createSemester = (num: number): Semester => ({
  id: crypto.randomUUID(),
  label: `Semester ${num}`,
  subjects: [createSubject(), createSubject(), createSubject()],
  gpa: null,
});

const GPACalculator = () => {
  const [semesters, setSemesters] = useState<Semester[]>([createSemester(1)]);
  const [cgpa, setCgpa] = useState<number | null>(null);

  const updateSubject = (semIdx: number, subIdx: number, field: keyof Subject, value: string) => {
    setSemesters((prev) =>
      prev.map((sem, si) =>
        si === semIdx
          ? { ...sem, subjects: sem.subjects.map((sub, sbi) => sbi === subIdx ? { ...sub, [field]: value } : sub) }
          : sem
      )
    );
  };

  const addSubject = (semIdx: number) => {
    setSemesters((prev) =>
      prev.map((sem, si) => si === semIdx ? { ...sem, subjects: [...sem.subjects, createSubject()] } : sem)
    );
  };

  const removeSubject = (semIdx: number, subIdx: number) => {
    setSemesters((prev) =>
      prev.map((sem, si) =>
        si === semIdx ? { ...sem, subjects: sem.subjects.filter((_, i) => i !== subIdx) } : sem
      )
    );
  };

  const addSemester = () => setSemesters((prev) => [...prev, createSemester(prev.length + 1)]);
  const removeSemester = (idx: number) => setSemesters((prev) => prev.filter((_, i) => i !== idx));

  const calculate = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    const updated = semesters.map((sem) => {
      let semCredits = 0;
      let semPoints = 0;
      for (const sub of sem.subjects) {
        const cr = parseFloat(sub.credits) || 0;
        const gp = gradePoints[sub.grade];
        if (gp !== undefined && cr > 0) {
          semCredits += cr;
          semPoints += cr * gp;
        }
      }
      const gpa = semCredits > 0 ? semPoints / semCredits : null;
      totalCredits += semCredits;
      totalPoints += semPoints;
      return { ...sem, gpa };
    });

    setSemesters(updated);
    setCgpa(totalCredits > 0 ? totalPoints / totalCredits : null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "radial-gradient(circle at 50% 0%, #112036 0%, #041329 70%)" }}>
      {/* Decorative glows */}
      <div className="bg-glow-blob bg-glow-cyan top-0 left-1/4 w-[400px] h-[400px] opacity-[0.06]" />

      <header className="sticky top-0 z-50 glass-nav">
        <div className="container flex h-14 items-center gap-3 px-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary">
            <Button variant="ghost" size="icon" className="hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <img src={logo} alt="Learn Path" className="h-7 w-7 rounded" />
          <h1 className="font-display text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            <Calculator className="h-4 w-4 text-primary" />
            GPA SOLVER
          </h1>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8 relative z-10 page-enter space-y-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Calculator className="h-7 w-7 text-primary" />
            GPA Calculator
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">Calculate individual semester points and complete CGPA averages instantly.</p>
        </div>

        <div className="space-y-5">
          {semesters.map((sem, semIdx) => (
            <Card key={sem.id} className="glass-card bg-card/40 border-white/5 shadow-lg">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold font-display text-white">{sem.label}</CardTitle>
                  <div className="flex items-center gap-3">
                    {sem.gpa !== null && (
                      <span className="rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-mono font-bold text-primary">
                        GPA: {sem.gpa.toFixed(2)}
                      </span>
                    )}
                    {semesters.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeSemester(semIdx)} className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-4">
                {/* Header labels */}
                <div className="grid grid-cols-[1fr_80px_100px_32px] gap-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                  <span>Subject Title</span><span>Credits</span><span>Grade</span><span />
                </div>
                
                {sem.subjects.map((sub, subIdx) => (
                  <div key={sub.id} className="grid grid-cols-[1fr_80px_100px_32px] gap-2.5 items-center">
                    <Input
                      placeholder="e.g. Programming in C"
                      value={sub.name}
                      onChange={(e) => updateSubject(semIdx, subIdx, "name", e.target.value)}
                      className="bg-white/5 border-white/10 text-white rounded-lg focus-visible:ring-primary focus-visible:ring-1 text-sm h-10"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={sub.credits}
                      onChange={(e) => updateSubject(semIdx, subIdx, "credits", e.target.value)}
                      className="bg-white/5 border-white/10 text-white rounded-lg focus-visible:ring-primary text-sm h-10 text-center font-mono"
                    />
                    <Select value={sub.grade} onValueChange={(v) => updateSubject(semIdx, subIdx, "grade", v)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-lg text-sm h-10">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent className="bg-card/95 border-white/10 backdrop-blur-xl">
                        {Object.entries(gradePoints).map(([g, p]) => (
                          <SelectItem key={g} value={g} className="font-mono">{g} ({p})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeSubject(semIdx, subIdx)} disabled={sem.subjects.length <= 1} className="hover:bg-white/5 text-muted-foreground hover:text-white">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button variant="outline" size="sm" className="gap-1.5 border-white/10 text-white hover:bg-white/10 text-xs font-semibold tracking-wide" onClick={() => addSubject(semIdx)}>
                  <Plus className="h-4 w-4 text-primary" /> ADD SUBJECT
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3">
          <Button variant="outline" onClick={addSemester} className="gap-1.5 border-white/10 text-white hover:bg-white/10 font-bold text-xs tracking-wider uppercase h-11 px-5 rounded-lg">
            <Plus className="h-4 w-4" /> ADD SEMESTER
          </Button>
          <Button onClick={calculate} className="btn-primary gap-2 h-11 px-6 rounded-lg">
            <Calculator className="h-4.5 w-4.5 text-primary-foreground" /> CALCULATE ACADEMIC GPA
          </Button>
        </div>

        {cgpa !== null && (
          <Card className="glass-card bg-primary/10 border-primary/20 shadow-lg mt-8">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-xs font-mono text-primary uppercase tracking-wider">Cumulative Grade Point Average</p>
                <p className="font-display text-5xl font-extrabold text-white mt-3 tracking-tighter">{cgpa.toFixed(2)}</p>
                <p className="mt-2 text-xs text-muted-foreground uppercase font-mono tracking-wider">
                  Computed across {semesters.length} semester{semesters.length > 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default GPACalculator;

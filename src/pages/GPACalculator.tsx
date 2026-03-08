import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Calculator } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Learn Path" className="h-7 w-7 rounded" />
            <span className="font-display text-base font-bold">Learn<span className="text-primary">Path</span></span>
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            GPA / CGPA Calculator
          </h1>
          <p className="mt-2 text-muted-foreground">Enter your grades for each semester to calculate GPA and CGPA.</p>
        </div>

        <div className="space-y-6">
          {semesters.map((sem, semIdx) => (
            <Card key={sem.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-display">{sem.label}</CardTitle>
                  <div className="flex items-center gap-2">
                    {sem.gpa !== null && (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        GPA: {sem.gpa.toFixed(2)}
                      </span>
                    )}
                    {semesters.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeSemester(semIdx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-[1fr_80px_100px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span>Subject</span><span>Credits</span><span>Grade</span><span />
                </div>
                {sem.subjects.map((sub, subIdx) => (
                  <div key={sub.id} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center">
                    <Input
                      placeholder="Subject name"
                      value={sub.name}
                      onChange={(e) => updateSubject(semIdx, subIdx, "name", e.target.value)}
                    />
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={sub.credits}
                      onChange={(e) => updateSubject(semIdx, subIdx, "credits", e.target.value)}
                    />
                    <Select value={sub.grade} onValueChange={(v) => updateSubject(semIdx, subIdx, "grade", v)}>
                      <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(gradePoints).map(([g, p]) => (
                          <SelectItem key={g} value={g}>{g} ({p})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeSubject(semIdx, subIdx)} disabled={sem.subjects.length <= 1}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addSubject(semIdx)}>
                  <Plus className="h-3.5 w-3.5" /> Add Subject
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={addSemester} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Semester
          </Button>
          <Button onClick={calculate} size="lg" className="gap-2">
            <Calculator className="h-4 w-4" /> Calculate
          </Button>
        </div>

        {cgpa !== null && (
          <Card className="mt-8 border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Your CGPA</p>
                <p className="font-display text-5xl font-bold text-primary">{cgpa.toFixed(2)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Across {semesters.length} semester{semesters.length > 1 ? "s" : ""}
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

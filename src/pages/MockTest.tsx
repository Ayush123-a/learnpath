import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, ArrowRight, Flag,
  AlertTriangle, SkipForward, BarChart3, BookOpen, Sparkles
} from "lucide-react";
import logo from "@/assets/logo.png";

interface Quiz {
  id: string; title: string; description: string | null;
  duration_minutes: number; total_marks: number;
  negative_marking: boolean; negative_mark_value: number;
  quiz_type: string;
}

interface Question {
  id: string; question_text: string; question_type: string;
  options: string[]; correct_answer: string; explanation: string | null;
  marks: number; sort_order: number;
}

type Phase = "loading" | "intro" | "active" | "review" | "result";
type QuestionStatus = "answered" | "skipped" | "flagged" | "unanswered";

const MockTest = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadQuiz = useCallback(async () => {
    if (!quizId) return;

    const [qRes, questRes] = await Promise.all([
      supabase.from("quizzes").select("id, title, description, duration_minutes, total_marks, negative_marking, negative_mark_value, quiz_type").eq("id", quizId).single(),
      supabase.from("questions").select("*").eq("quiz_id", quizId).order("sort_order"),
    ]);

    if (qRes.data) setQuiz(qRes.data as unknown as Quiz);
    if (questRes.data) setQuestions(questRes.data as unknown as Question[]);
    setPhase("intro");
  }, [quizId]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const submitTest = useCallback(async () => {
    if (!quiz || phase === "result" || submitting) return;
    setSubmitting(true);

    let totalScore = 0;

    for (const q of questions) {
      const userAns = answers[q.id];
      if (q.question_type === "theory") {
        continue;
      }
      if (userAns === q.correct_answer) {
        totalScore += q.marks;
      } else if (userAns && quiz.negative_marking) {
        totalScore -= quiz.negative_mark_value;
      }
    }

    setScore(totalScore);
    setPhase("result");

    if (user) {
      await supabase.from("quiz_attempts").insert({
        quiz_id: quiz.id,
        user_id: user.id,
        answers,
        score: totalScore,
        total_marks: quiz.total_marks,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });
    }

    setSubmitting(false);
    toast.success("Test submitted!");
  }, [quiz, questions, answers, phase, user, submitting]);

  const startTest = () => {
    if (!quiz) return;
    setTimeLeft(quiz.duration_minutes * 60);
    setPhase("active");
    if (questions[0]) setVisited(new Set([questions[0].id]));
  };

  // Timer with auto-submit
  useEffect(() => {
    if (phase !== "active" || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          toast.warning("Time's up! Auto-submitting...");
          submitTest();
          return 0;
        }
        if (prev === 300) toast.warning("5 minutes remaining!");
        if (prev === 60) toast.error("1 minute remaining!");
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft, submitTest]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const getStatus = (qId: string): QuestionStatus => {
    if (answers[qId]) return flagged.has(qId) ? "flagged" : "answered";
    if (flagged.has(qId)) return "flagged";
    if (visited.has(qId)) return "skipped";
    return "unanswered";
  };

  const statusColors: Record<QuestionStatus, string> = {
    answered: "bg-primary/20 text-primary border-primary/45",
    skipped: "bg-destructive/15 text-destructive border-destructive/30",
    flagged: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    unanswered: "bg-white/5 text-muted-foreground border-white/5",
  };

  const goTo = (idx: number) => {
    setCurrent(idx);
    if (questions[idx]) setVisited(prev => new Set(prev).add(questions[idx].id));
  };

  const toggleFlag = () => {
    const qId = questions[current]?.id;
    if (!qId) return;
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  const clearAnswer = () => {
    const qId = questions[current]?.id;
    if (!qId) return;
    setAnswers(prev => { const next = { ...prev }; delete next[qId]; return next; });
  };

  const stats = useMemo(() => {
    const answered = questions.filter(q => answers[q.id]).length;
    const flaggedCount = flagged.size;
    const skipped = questions.filter(q => visited.has(q.id) && !answers[q.id]).length;
    const unanswered = questions.length - answered - skipped;
    return { answered, flaggedCount, skipped, unanswered };
  }, [questions, answers, flagged, visited]);

  const resultAnalytics = useMemo(() => {
    if (phase !== "result") return null;
    const correct = questions.filter(q => answers[q.id] === q.correct_answer).length;
    const wrong = questions.filter(q => answers[q.id] && answers[q.id] !== q.correct_answer && q.question_type !== "theory").length;
    const unanswered = questions.filter(q => !answers[q.id] && q.question_type !== "theory").length;
    const theory = questions.filter(q => q.question_type === "theory").length;
    const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
    const percentage = quiz ? Math.round(((score || 0) / quiz.total_marks) * 100) : 0;
    return { correct, wrong, unanswered, theory, accuracy, percentage };
  }, [phase, questions, answers, score, quiz]);

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#041329] flex items-center justify-center">
        <div className="container max-w-2xl py-8 space-y-4">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-48 w-full rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen bg-[#041329] items-center justify-center">
        <p className="text-muted-foreground font-mono">QUIZ NOT FOUND.</p>
      </div>
    );
  }

  const q = questions[current];
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const hasTheory = questions.some(q => q.question_type === "theory");

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "radial-gradient(circle at 50% 0%, #112036 0%, #041329 70%)" }}>
      <div className="bg-glow-blob bg-glow-cyan top-0 left-1/4 w-[400px] h-[400px] opacity-[0.06]" />

      <header className="sticky top-0 z-50 glass-nav">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary">
              <Link to="/quizzes"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <img src={logo} alt="Learn Path" className="h-7 w-7 rounded" />
            <span className="font-display text-sm font-bold tracking-tight text-white hidden sm:inline">LEARNPATH ASSESSMENT</span>
          </div>
          {phase === "active" && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 text-xs font-mono text-muted-foreground uppercase">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />{stats.answered} ANS</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{stats.flaggedCount} FLG</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive/60" />{stats.skipped} SKP</span>
              </div>
              <Badge variant={timeLeft < 60 ? "destructive" : timeLeft < 300 ? "secondary" : "outline"} className="gap-1.5 text-sm px-3.5 py-1.5 font-mono border-white/10 shadow-lg">
                <Clock className="h-4 w-4 text-primary animate-pulse" /> {formatTime(timeLeft)}
              </Badge>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-8 relative z-10 page-enter">
        {/* INTRO */}
        {phase === "intro" && (
          <Card className="glass-card bg-card/45 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge className="badge-cyan text-[10px] tracking-wider uppercase">{quiz.quiz_type.replace("_", " ")}</Badge>
              </div>
              <CardTitle className="font-display text-2xl font-extrabold text-white leading-tight">{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {quiz.description && <p className="text-muted-foreground text-sm leading-relaxed">{quiz.description}</p>}
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl glass-card bg-white/5 border-white/5 p-4 text-center">
                  <span className="text-muted-foreground block text-xs uppercase font-mono tracking-wider">Questions</span>
                  <p className="font-extrabold text-white text-xl mt-1">{questions.length}</p>
                </div>
                <div className="rounded-xl glass-card bg-white/5 border-white/5 p-4 text-center">
                  <span className="text-muted-foreground block text-xs uppercase font-mono tracking-wider">Duration</span>
                  <p className="font-extrabold text-white text-xl mt-1">{quiz.duration_minutes} Mins</p>
                </div>
                <div className="rounded-xl glass-card bg-white/5 border-white/5 p-4 text-center">
                  <span className="text-muted-foreground block text-xs uppercase font-mono tracking-wider">Total Marks</span>
                  <p className="font-extrabold text-white text-xl mt-1">{quiz.total_marks}</p>
                </div>
                <div className="rounded-xl glass-card bg-white/5 border-white/5 p-4 text-center">
                  <span className="text-muted-foreground block text-xs uppercase font-mono tracking-wider">Negative</span>
                  <p className="font-extrabold text-white text-xl mt-1">{quiz.negative_marking ? `−${quiz.negative_mark_value}` : "OFF"}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-white uppercase tracking-wider font-mono">Assigned Rules</p>
                  <ul className="text-muted-foreground list-disc pl-3 space-y-1 leading-relaxed">
                    <li>Tests automatically lock and compile when countdown completes.</li>
                    <li>MCQ wrong items trigger negative point deduction: {quiz.negative_marking ? `-${quiz.negative_mark_value}` : "No negative penalty"}.</li>
                    {hasTheory && <li>Subjective theory questions undergo manual review.</li>}
                  </ul>
                </div>
              </div>

              <Button onClick={startTest} className="w-full btn-primary h-11 flex items-center justify-center gap-2">
                START ASSESSMENT <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ACTIVE TEST */}
        {phase === "active" && q && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5 bg-white/5" />
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>QUESTION {current + 1} OF {questions.length}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] py-0 border-white/10 uppercase">{q.question_type}</Badge>
                  <Badge className="badge-cyan text-[10px] py-0">{q.marks} MARKS</Badge>
                </div>
              </div>
            </div>

            <Card className="glass-card bg-card/40 border-white/5">
              <CardContent className="p-6">
                <p className="text-lg font-bold text-white leading-relaxed mb-6 whitespace-pre-wrap">{q.question_text}</p>

                {q.question_type === "mcq" && (
                  <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v }))}>
                    <div className="space-y-2.5">
                      {q.options.map((opt, i) => (
                        <Label
                          key={i}
                          htmlFor={`opt-${i}`}
                          className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                            answers[q.id] === opt 
                              ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(0,229,255,0.1)]" 
                              : "border-white/5 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <RadioGroupItem value={opt} id={`opt-${i}`} className="border-white/30 text-primary focus-visible:ring-primary" />
                          <span className="text-white text-sm font-medium leading-none">{opt}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {q.question_type === "numerical" && (
                  <Input
                    type="number"
                    placeholder="Enter your numerical answer"
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="text-base h-11 bg-white/5 border-white/10 text-white rounded-lg focus-visible:ring-primary focus-visible:ring-1"
                  />
                )}

                {q.question_type === "theory" && (
                  <Textarea
                    placeholder="Provide your text answer here..."
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    rows={8}
                    className="text-sm bg-white/5 border-white/10 text-white rounded-lg leading-relaxed focus-visible:ring-primary"
                  />
                )}
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0} className="border-white/10 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAnswer} disabled={!answers[q.id]} className="text-muted-foreground hover:text-white">
                  Reset
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFlag}
                  className={`gap-1.5 border-white/10 ${flagged.has(q.id) ? "bg-amber-500/20 text-amber-400 border-amber-500/35 hover:bg-amber-500/30" : "text-white hover:bg-white/10"}`}
                >
                  <Flag className="h-4 w-4" /> {flagged.has(q.id) ? "Flagged" : "Flag"}
                </Button>
                {current < questions.length - 1 ? (
                  <Button size="sm" onClick={() => goTo(current + 1)} className="bg-primary text-primary-foreground hover:opacity-90 font-semibold rounded-lg">
                    Next <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setShowConfirm(true)} variant="destructive" className="gap-1.5 rounded-lg font-semibold">
                    <Flag className="h-4 w-4" /> FINISH TEST
                  </Button>
                )}
              </div>
            </div>

            {/* Submit confirmation */}
            {showConfirm && (
              <Card className="border-destructive/35 bg-destructive/10 glass-card">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Submit Assessment?</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Please review your question coverage before confirmation:</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-primary"><span className="h-2 w-2 rounded-full bg-primary" /> {stats.answered} ANS</div>
                    <div className="flex items-center gap-1.5 text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-500" /> {stats.flaggedCount} FLG</div>
                    <div className="flex items-center gap-1.5 text-destructive"><span className="h-2 w-2 rounded-full bg-destructive/60" /> {stats.skipped} SKP</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-white/10" /> {stats.unanswered} UNV</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)} className="flex-1 border-white/10 text-white">Review Test</Button>
                    <Button variant="destructive" size="sm" onClick={submitTest} disabled={submitting} className="flex-1">
                      {submitting ? "Submitting..." : "Confirm & Submit"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigator Panel */}
            <Card className="glass-card bg-card/35 border-white/5">
              <CardContent className="p-4">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Navigator Grid</p>
                <div className="flex flex-wrap gap-2">
                  {questions.map((qu, i) => {
                    const status = getStatus(qu.id);
                    return (
                      <Button
                        key={qu.id}
                        variant="outline"
                        className={`h-9 w-9 text-xs font-mono font-bold rounded-lg border transition-all ${statusColors[status]} ${i === current ? "ring-2 ring-primary ring-offset-1 ring-offset-[#041329]" : ""}`}
                        onClick={() => goTo(i)}
                      >
                        {i + 1}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && resultAnalytics && (
          <div className="space-y-6">
            {/* Score card */}
            <Card className="glass-card bg-primary/10 border-primary/20 shadow-lg text-center p-8">
              <CardContent className="p-0 flex flex-col items-center">
                <p className="text-xs font-mono text-primary uppercase tracking-wider">COMPILATION COMPLETE</p>
                <h3 className="font-display text-5xl font-extrabold text-white mt-3 tracking-tighter">
                  {score?.toFixed(1)} <span className="text-lg text-muted-foreground">/ {quiz.total_marks}</span>
                </h3>
                <Progress value={resultAnalytics.percentage} className="h-2 w-48 mt-5 bg-white/5" />
                <p className="text-xs font-mono text-muted-foreground mt-2 uppercase">{resultAnalytics.percentage}% ACCURACY RATING</p>
              </CardContent>
            </Card>

            {/* Analytics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="glass-card border-white/5 bg-white/5 p-4 text-center">
                <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-2xl font-extrabold text-white">{resultAnalytics.correct}</p>
                <p className="text-xs font-mono text-muted-foreground uppercase">CORRECT</p>
              </Card>
              <Card className="glass-card border-white/5 bg-white/5 p-4 text-center">
                <XCircle className="h-5 w-5 text-destructive mx-auto mb-1.5" />
                <p className="text-2xl font-extrabold text-white">{resultAnalytics.wrong}</p>
                <p className="text-xs font-mono text-muted-foreground uppercase">WRONG</p>
              </Card>
              <Card className="glass-card border-white/5 bg-white/5 p-4 text-center">
                <SkipForward className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-2xl font-extrabold text-white">{resultAnalytics.unanswered}</p>
                <p className="text-xs font-mono text-muted-foreground uppercase">UNANSWERED</p>
              </Card>
              <Card className="glass-card border-white/5 bg-white/5 p-4 text-center">
                <BarChart3 className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
                <p className="text-2xl font-extrabold text-white">{resultAnalytics.accuracy}%</p>
                <p className="text-xs font-mono text-muted-foreground uppercase">ACCURACY</p>
              </Card>
            </div>

            {resultAnalytics.theory > 0 && (
              <Card className="border-amber-500/25 bg-amber-500/10 glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-amber-400" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-white">{resultAnalytics.theory} subjective question(s)</strong> require manual grading parameters. Score will reflect revisions upon examiner confirmation.
                  </p>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={() => setShowExplanations(!showExplanations)} className="w-full border-white/10 text-white hover:bg-white/10 font-bold uppercase tracking-wider text-xs h-11">
              {showExplanations ? "HIDE SOLUTIONS" : "VIEW DETAILED SOLUTIONS"}
            </Button>

            {showExplanations && (
              <div className="space-y-4">
                {questions.map((qu, i) => {
                  const userAns = answers[qu.id];
                  const isCorrect = qu.question_type !== "theory" && userAns === qu.correct_answer;
                  const isWrong = qu.question_type !== "theory" && userAns && userAns !== qu.correct_answer;
                  return (
                    <Card key={qu.id} className={`glass-card bg-card/30 border-white/5 ${isCorrect ? "border-emerald-500/30" : isWrong ? "border-destructive/30" : ""}`}>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <Badge variant="outline" className="shrink-0 font-mono border-white/10 mt-0.5">Q{i + 1}</Badge>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white leading-relaxed whitespace-pre-wrap">{qu.question_text}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge className="bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider font-mono py-0">{qu.marks} MARKS</Badge>
                              <Badge className="bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider font-mono py-0">{qu.question_type}</Badge>
                            </div>
                          </div>
                          {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                          {isWrong && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                        </div>
                        <div className="ml-10 text-xs font-medium space-y-1.5">
                          {qu.question_type !== "theory" && (
                            <p className="text-emerald-400 flex items-center gap-1.5 font-mono"><CheckCircle2 className="h-3.5 w-3.5" /> CORRECT OPTION: {qu.correct_answer}</p>
                          )}
                          {userAns && !isCorrect && qu.question_type !== "theory" && (
                            <p className="text-destructive flex items-center gap-1.5 font-mono"><XCircle className="h-3.5 w-3.5" /> CHOSEN OPTION: {userAns}</p>
                          )}
                          {qu.question_type === "theory" && userAns && (
                            <div className="bg-white/5 rounded-xl border border-white/5 p-3 text-muted-foreground space-y-1">
                              <p className="font-bold text-white font-mono uppercase tracking-wider text-[10px]">Your Answer:</p>
                              <p className="whitespace-pre-wrap text-xs leading-relaxed">{userAns}</p>
                            </div>
                          )}
                          {!userAns && <p className="text-muted-foreground font-mono">— QUESTION WAS SKIPPED</p>}
                          {qu.explanation && (
                            <div className="mt-3 bg-primary/5 rounded-xl border border-primary/10 p-3 text-muted-foreground leading-relaxed">
                              <p className="font-bold text-white font-mono uppercase tracking-wider text-[10px] mb-1">Theoretical Explanation:</p>
                              <p className="text-xs">{qu.explanation}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/10 font-bold tracking-wider text-xs h-11 uppercase" asChild>
                <Link to="/quizzes">Back to List</Link>
              </Button>
              <Button className="flex-1 btn-primary font-bold tracking-wider text-xs h-11 uppercase" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MockTest;

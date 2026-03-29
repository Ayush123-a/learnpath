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
  AlertTriangle, SkipForward, BarChart3, BookOpen,
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
        // Warn at 5 min and 1 min
        if (prev === 300) toast.warning("5 minutes remaining!");
        if (prev === 60) toast.error("1 minute remaining!");
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

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
    answered: "bg-primary text-primary-foreground",
    skipped: "bg-destructive/20 text-destructive",
    flagged: "bg-amber-500 text-white",
    unanswered: "bg-muted text-muted-foreground",
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

  // Stats
  const stats = useMemo(() => {
    const answered = questions.filter(q => answers[q.id]).length;
    const flaggedCount = flagged.size;
    const skipped = questions.filter(q => visited.has(q.id) && !answers[q.id]).length;
    const unanswered = questions.length - answered - skipped;
    return { answered, flaggedCount, skipped, unanswered };
  }, [questions, answers, flagged, visited]);

  const submitTest = useCallback(async () => {
    if (!quiz || phase === "result" || submitting) return;
    setSubmitting(true);

    let totalScore = 0;
    const questionResults: Record<string, { correct: boolean; marks: number }> = {};

    for (const q of questions) {
      const userAns = answers[q.id];
      if (q.question_type === "theory") {
        // Theory questions need manual grading — award 0 for now
        questionResults[q.id] = { correct: false, marks: 0 };
        continue;
      }
      if (userAns === q.correct_answer) {
        totalScore += q.marks;
        questionResults[q.id] = { correct: true, marks: q.marks };
      } else if (userAns && quiz.negative_marking) {
        totalScore -= quiz.negative_mark_value;
        questionResults[q.id] = { correct: false, marks: -quiz.negative_mark_value };
      } else {
        questionResults[q.id] = { correct: false, marks: 0 };
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

  // Result analytics
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
      <div className="min-h-screen bg-background">
        <div className="container py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Quiz not found.</p>
      </div>
    );
  }

  const q = questions[current];
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const hasTheory = questions.some(q => q.question_type === "theory");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/quizzes"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <img src={logo} alt="Learn Path" className="h-7 w-7 rounded" />
            <span className="font-display text-base font-bold hidden sm:inline">Learn<span className="text-primary">Path</span></span>
          </div>
          {phase === "active" && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />{stats.answered}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{stats.flaggedCount}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive/40" />{stats.skipped}</span>
              </div>
              <Badge variant={timeLeft < 60 ? "destructive" : timeLeft < 300 ? "secondary" : "outline"} className="gap-1.5 text-sm px-3 py-1 font-mono">
                <Clock className="h-3.5 w-3.5" /> {formatTime(timeLeft)}
              </Badge>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-3xl py-6">
        {/* INTRO */}
        {phase === "intro" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{quiz.quiz_type === "semester_exam" ? "Semester Exam" : quiz.quiz_type === "unit_quiz" ? "Unit Quiz" : "Practice"}</Badge>
              </div>
              <CardTitle className="font-display text-2xl">{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg border p-3 text-center">
                  <span className="text-muted-foreground block text-xs">Questions</span>
                  <p className="font-bold text-foreground text-lg">{questions.length}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <span className="text-muted-foreground block text-xs">Duration</span>
                  <p className="font-bold text-foreground text-lg">{quiz.duration_minutes} min</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <span className="text-muted-foreground block text-xs">Total Marks</span>
                  <p className="font-bold text-foreground text-lg">{quiz.total_marks}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <span className="text-muted-foreground block text-xs">Negative</span>
                  <p className="font-bold text-foreground text-lg">{quiz.negative_marking ? `−${quiz.negative_mark_value}` : "No"}</p>
                </div>
              </div>

              {/* Question type breakdown */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Question Types</p>
                <div className="flex flex-wrap gap-2">
                  {["mcq", "numerical", "theory"].map(type => {
                    const count = questions.filter(q => q.question_type === type).length;
                    if (!count) return null;
                    return (
                      <Badge key={type} variant="secondary" className="gap-1">
                        {type === "mcq" ? "MCQ" : type === "numerical" ? "Numerical" : "Theory"}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Instructions</p>
                  <ul className="mt-1 text-muted-foreground space-y-1">
                    <li>• Test will auto-submit when time runs out</li>
                    <li>• You can flag questions to review later</li>
                    <li>• Use the question navigator to jump between questions</li>
                    {quiz.negative_marking && <li>• Wrong MCQ/numerical answers will deduct {quiz.negative_mark_value} marks</li>}
                    {hasTheory && <li>• Theory answers will be graded manually by faculty</li>}
                  </ul>
                </div>
              </div>

              <Button onClick={startTest} size="lg" className="w-full gap-2 mt-4">
                Start Test <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ACTIVE TEST */}
        {phase === "active" && q && (
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Question {current + 1} of {questions.length}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{q.question_type === "mcq" ? "MCQ" : q.question_type === "numerical" ? "Numerical" : "Theory"}</Badge>
                <Badge variant="secondary">{q.marks} mark{q.marks > 1 ? "s" : ""}</Badge>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-lg font-medium text-foreground mb-6 whitespace-pre-wrap">{q.question_text}</p>

                {q.question_type === "mcq" && (
                  <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v }))}>
                    <div className="space-y-3">
                      {q.options.map((opt, i) => (
                        <Label
                          key={i}
                          htmlFor={`opt-${i}`}
                          className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                            answers[q.id] === opt ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        >
                          <RadioGroupItem value={opt} id={`opt-${i}`} />
                          <span className="text-foreground">{opt}</span>
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
                    className="text-lg"
                  />
                )}

                {q.question_type === "theory" && (
                  <Textarea
                    placeholder="Write your answer here..."
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    rows={8}
                    className="text-base"
                  />
                )}
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={clearAnswer} disabled={!answers[q.id]}>
                  Clear
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={flagged.has(q.id) ? "default" : "outline"}
                  size="sm"
                  onClick={toggleFlag}
                  className={`gap-1 ${flagged.has(q.id) ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                >
                  <Flag className="h-3.5 w-3.5" /> {flagged.has(q.id) ? "Flagged" : "Flag"}
                </Button>
                {current < questions.length - 1 ? (
                  <Button size="sm" onClick={() => goTo(current + 1)}>
                    Next <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setShowConfirm(true)} variant="destructive" className="gap-1">
                    <Flag className="h-3.5 w-3.5" /> Finish
                  </Button>
                )}
              </div>
            </div>

            {/* Submit confirmation */}
            {showConfirm && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-4 space-y-3">
                  <p className="font-medium text-foreground">Submit Test?</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Answered: {stats.answered}</div>
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Flagged: {stats.flaggedCount}</div>
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-destructive/40" /> Skipped: {stats.skipped}</div>
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" /> Not visited: {stats.unanswered}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)} className="flex-1">Go Back</Button>
                    <Button variant="destructive" size="sm" onClick={submitTest} disabled={submitting} className="flex-1">
                      {submitting ? "Submitting..." : "Confirm Submit"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question navigator panel */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Question Navigator</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Answered</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Flagged</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive/40" /> Skipped</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {questions.map((qu, i) => {
                    const status = getStatus(qu.id);
                    return (
                      <Button
                        key={qu.id}
                        size="icon"
                        variant="outline"
                        className={`h-9 w-9 text-xs font-medium ${statusColors[status]} ${i === current ? "ring-2 ring-offset-1 ring-primary" : ""}`}
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
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="flex flex-col items-center p-8">
                <p className="text-sm font-medium text-muted-foreground">Your Score</p>
                <p className="font-display text-5xl font-bold text-primary mt-1">{score?.toFixed(1)}</p>
                <p className="text-muted-foreground">out of {quiz.total_marks}</p>
                <Progress value={resultAnalytics.percentage} className="h-3 w-48 mt-4" />
                <p className="text-sm font-medium text-foreground mt-2">{resultAnalytics.percentage}%</p>
              </CardContent>
            </Card>

            {/* Analytics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{resultAnalytics.correct}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{resultAnalytics.wrong}</p>
                  <p className="text-xs text-muted-foreground">Wrong</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <SkipForward className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{resultAnalytics.unanswered}</p>
                  <p className="text-xs text-muted-foreground">Unanswered</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{resultAnalytics.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </CardContent>
              </Card>
            </div>

            {resultAnalytics.theory > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  <p className="text-sm text-foreground">
                    <strong>{resultAnalytics.theory} theory question(s)</strong> will be graded manually by faculty. Your final score may change.
                  </p>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={() => setShowExplanations(!showExplanations)} className="w-full">
              {showExplanations ? "Hide" : "Show"} Detailed Solutions
            </Button>

            {showExplanations && (
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const userAns = answers[q.id];
                  const isCorrect = q.question_type !== "theory" && userAns === q.correct_answer;
                  const isWrong = q.question_type !== "theory" && userAns && userAns !== q.correct_answer;
                  return (
                    <Card key={q.id} className={isCorrect ? "border-primary/30" : isWrong ? "border-destructive/30" : ""}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0 mt-0.5">Q{i + 1}</Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{q.question_text}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">{q.marks} mark{q.marks > 1 ? "s" : ""} · {q.question_type.toUpperCase()}</Badge>
                          </div>
                          {isCorrect && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                          {isWrong && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                        </div>
                        <div className="ml-10 text-sm space-y-1">
                          {q.question_type !== "theory" && (
                            <p className="text-primary flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Correct: {q.correct_answer}</p>
                          )}
                          {userAns && !isCorrect && q.question_type !== "theory" && (
                            <p className="text-destructive flex items-center gap-1"><XCircle className="h-3 w-3" /> Your answer: {userAns}</p>
                          )}
                          {q.question_type === "theory" && userAns && (
                            <div className="bg-muted/50 rounded p-2 text-muted-foreground text-xs">
                              <p className="font-medium mb-1">Your answer:</p>
                              <p className="whitespace-pre-wrap">{userAns}</p>
                            </div>
                          )}
                          {!userAns && <p className="text-muted-foreground">— Not answered</p>}
                          {q.explanation && (
                            <div className="mt-2 bg-primary/5 rounded-lg p-3 text-muted-foreground text-sm">
                              <p className="font-medium text-foreground mb-1">Explanation:</p>
                              <p>{q.explanation}</p>
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
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/quizzes">All Tests</Link>
              </Button>
              <Button className="flex-1" asChild>
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

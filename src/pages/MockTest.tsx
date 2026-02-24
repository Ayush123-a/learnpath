import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, ArrowRight, Flag,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface Quiz {
  id: string; title: string; description: string | null;
  duration_minutes: number; total_marks: number;
  negative_marking: boolean; negative_mark_value: number;
}

interface Question {
  id: string; question_text: string; question_type: string;
  options: string[]; correct_answer: string; explanation: string | null;
  marks: number; sort_order: number;
}

type Phase = "loading" | "intro" | "active" | "result";

const MockTest = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    const [qRes, questRes] = await Promise.all([
      supabase.from("quizzes").select("*").eq("id", quizId!).single(),
      supabase.from("questions").select("*").eq("quiz_id", quizId!).order("sort_order"),
    ]);
    if (qRes.data) setQuiz(qRes.data as unknown as Quiz);
    if (questRes.data) setQuestions(questRes.data as unknown as Question[]);
    setPhase("intro");
  };

  const startTest = () => {
    if (!quiz) return;
    setTimeLeft(quiz.duration_minutes * 60);
    setPhase("active");
  };

  // Timer
  useEffect(() => {
    if (phase !== "active" || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { submitTest(); return 0; }
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

  const submitTest = useCallback(async () => {
    if (!quiz || phase === "result") return;
    let totalScore = 0;

    for (const q of questions) {
      const userAns = answers[q.id];
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

    toast.success("Test submitted!");
  }, [quiz, questions, answers, phase, user]);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <img src={logo} alt="ScholarsHub" className="h-7 w-7 rounded" />
            <span className="font-display text-base font-bold">Scholars<span className="text-primary">Hub</span></span>
          </div>
          {phase === "active" && (
            <Badge variant={timeLeft < 60 ? "destructive" : "secondary"} className="gap-1.5 text-sm px-3 py-1">
              <Clock className="h-3.5 w-3.5" /> {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
      </header>

      <main className="container max-w-2xl py-8">
        {/* Intro */}
        {phase === "intro" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <span className="text-muted-foreground">Questions</span>
                  <p className="font-semibold text-foreground">{questions.length}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-semibold text-foreground">{quiz.duration_minutes} min</p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-muted-foreground">Total Marks</span>
                  <p className="font-semibold text-foreground">{quiz.total_marks}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-muted-foreground">Negative Marking</span>
                  <p className="font-semibold text-foreground">{quiz.negative_marking ? `−${quiz.negative_mark_value}` : "No"}</p>
                </div>
              </div>
              <Button onClick={startTest} size="lg" className="w-full gap-2 mt-4">
                Start Test <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active test */}
        {phase === "active" && q && (
          <div className="space-y-6">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {current + 1} of {questions.length}</span>
              <Badge variant="secondary">{q.marks} mark{q.marks > 1 ? "s" : ""}</Badge>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-lg font-medium text-foreground mb-6 whitespace-pre-wrap">{q.question_text}</p>

                {q.question_type === "mcq" && (
                  <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}>
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
                          <span>{opt}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {q.question_type === "numerical" && (
                  <Input
                    type="number"
                    placeholder="Enter your answer"
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              {current < questions.length - 1 ? (
                <Button onClick={() => setCurrent(current + 1)}>
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submitTest} className="gap-1.5 bg-destructive hover:bg-destructive/90">
                  <Flag className="h-4 w-4" /> Submit Test
                </Button>
              )}
            </div>

            {/* Question navigator */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {questions.map((_, i) => (
                <Button
                  key={i}
                  variant={answers[questions[i].id] ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 text-xs ${i === current ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setCurrent(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {phase === "result" && (
          <div className="space-y-6">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col items-center p-8">
                <p className="text-sm font-medium text-muted-foreground">Your Score</p>
                <p className="font-display text-5xl font-bold text-primary">{score?.toFixed(1)}</p>
                <p className="text-muted-foreground">out of {quiz.total_marks}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    {questions.filter((q) => answers[q.id] === q.correct_answer).length} correct
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-4 w-4" />
                    {questions.filter((q) => answers[q.id] && answers[q.id] !== q.correct_answer).length} wrong
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setShowExplanations(!showExplanations)} className="w-full">
              {showExplanations ? "Hide" : "Show"} Explanations
            </Button>

            {showExplanations && (
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.correct_answer;
                  return (
                    <Card key={q.id} className={isCorrect ? "border-primary/30" : userAns ? "border-destructive/30" : ""}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Q{i + 1}.</span>
                          <p className="text-sm font-medium text-foreground">{q.question_text}</p>
                        </div>
                        <div className="ml-6 text-sm space-y-1">
                          <p className="text-primary">✓ Correct: {q.correct_answer}</p>
                          {userAns && !isCorrect && <p className="text-destructive">✗ Your answer: {userAns}</p>}
                          {!userAns && <p className="text-muted-foreground">— Not answered</p>}
                          {q.explanation && (
                            <p className="mt-2 text-muted-foreground italic">{q.explanation}</p>
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
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MockTest;

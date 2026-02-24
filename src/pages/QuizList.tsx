import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, FileQuestion, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";

interface Quiz {
  id: string; title: string; description: string | null;
  quiz_type: string; duration_minutes: number; total_marks: number;
}

const typeLabels: Record<string, string> = {
  unit_quiz: "Unit Quiz",
  mock_exam: "Mock Exam",
  practice: "Practice",
};

const QuizList = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("quizzes")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setQuizzes((data as unknown as Quiz[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ScholarsHub" className="h-7 w-7 rounded" />
            <span className="font-display text-base font-bold">Scholars<span className="text-primary">Hub</span></span>
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <FileQuestion className="h-8 w-8 text-primary" />
          Mock Tests & Quizzes
        </h1>
        <p className="text-muted-foreground mb-8">Test your knowledge with timed quizzes and mock exams.</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : quizzes.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No quizzes available yet. Check back soon!</p>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => (
              <Link key={q.id} to={`/quiz/${q.id}`}>
                <Card className="group hover:shadow-md hover:border-primary/30 transition-all mb-3">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <FileQuestion className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{q.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{typeLabels[q.quiz_type] || q.quiz_type}</Badge>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {q.duration_minutes} min</span>
                        <span>{q.total_marks} marks</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizList;

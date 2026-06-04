import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, FileQuestion, ChevronRight, Sparkles, Award } from "lucide-react";
import logo from "@/assets/logo.png";

interface Quiz {
  id: string; 
  title: string; 
  description: string | null;
  quiz_type: string; 
  duration_minutes: number; 
  total_marks: number;
}

const typeLabels: Record<string, string> = {
  unit_quiz: "Unit Quiz",
  mock_exam: "Mock Exam",
  practice: "Practice",
};

const QuizList = () => {
  const { data: quizzes = [], isLoading: loading } = useQuery({
    queryKey: ["published-quizzes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("id, title, description, quiz_type, duration_minutes, total_marks")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return (data as unknown as Quiz[]) || [];
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "radial-gradient(circle at 50% 0%, #112036 0%, #041329 70%)" }}>
      {/* Decorative radial glows */}
      <div className="bg-glow-blob bg-glow-cyan top-0 left-1/4 w-[400px] h-[400px] opacity-[0.07]" />
      <div className="bg-glow-blob bg-glow-blue bottom-10 right-10 w-[300px] h-[300px] opacity-[0.05]" />

      <header className="sticky top-0 z-50 glass-nav">
        <div className="container flex h-14 items-center gap-3 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <img src={logo} alt="Learn Path" className="h-6 w-6 rounded" />
          </Link>
          <h1 className="font-display text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            <Award className="h-4 w-4 text-primary" />
            EXAMS & QUIZZES
          </h1>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8 relative z-10 page-enter">
        <div className="mb-6 space-y-1">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <FileQuestion className="h-7 w-7 text-primary" />
            Mock Tests
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">Evaluate your subject proficiency through timed quizzes and mock exams.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl bg-white/5 border border-white/5" />)}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="py-12 text-center glass-card border-white/5 p-8">
            <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground/30 animate-bounce" />
            <h3 className="mt-4 font-display text-lg font-bold text-white">No Quizzes Active</h3>
            <p className="text-sm text-muted-foreground mt-1">There are no quizzes currently active. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => (
              <Link key={q.id} to={`/quiz/${q.id}`}>
                <Card className="glass-card bg-card/45 border-white/5 hover:border-primary/40 transition-all duration-300 group">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 shrink-0">
                      <FileQuestion className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors text-base tracking-tight truncate">
                        {q.title}
                      </h3>
                      {q.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{q.description}</p>
                      )}
                      <div className="flex items-center gap-2.5 mt-2 flex-wrap text-xs text-muted-foreground font-mono">
                        <Badge className="text-[10px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 py-0.5">
                          {typeLabels[q.quiz_type] || q.quiz_type}
                        </Badge>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {q.duration_minutes} MIN</span>
                        <span>•</span>
                        <span>{q.total_marks} MARKS</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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

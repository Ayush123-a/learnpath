import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft, BookOpen, Play, FileText, ClipboardList, HelpCircle,
  Lock, Clock,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface Subject { id: string; name: string; code: string; description: string | null; credits: number; }
interface Unit { id: string; unit_number: number; title: string; description: string | null; }
interface Topic { id: string; unit_id: string; topic_number: number; title: string; description: string | null; }
interface Lecture { id: string; topic_id: string; title: string; type: string; duration_minutes: number | null; sort_order: number; is_free: boolean; is_published: boolean; }

const typeIcon: Record<string, typeof Play> = { video: Play, note: FileText, assignment: ClipboardList, quiz: HelpCircle };
const typeColor: Record<string, string> = {
  video: "bg-primary/10 text-primary",
  note: "bg-accent/20 text-accent-foreground",
  assignment: "bg-destructive/10 text-destructive",
  quiz: "bg-secondary text-secondary-foreground",
};

const SubjectDetail = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    loadData();
  }, [subjectId]);

  const loadData = async () => {
    setLoading(true);
    const [subRes, unitRes] = await Promise.all([
      supabase.from("subjects").select("*").eq("id", subjectId!).single(),
      supabase.from("units").select("*").eq("subject_id", subjectId!).order("unit_number"),
    ]);
    setSubject(subRes.data as Subject | null);
    const unitData = (unitRes.data as Unit[]) || [];
    setUnits(unitData);

    if (unitData.length > 0) {
      const unitIds = unitData.map((u) => u.id);
      const [topicRes, lectureRes] = await Promise.all([
        supabase.from("topics").select("*").in("unit_id", unitIds).order("topic_number"),
        supabase.from("lectures").select("*").eq("is_published", true).order("sort_order"),
      ]);
      const topicData = (topicRes.data as Topic[]) || [];
      setTopics(topicData);

      if (topicData.length > 0) {
        const topicIds = topicData.map((t) => t.id);
        const { data: lData } = await supabase
          .from("lectures")
          .select("*")
          .in("topic_id", topicIds)
          .eq("is_published", true)
          .order("sort_order");
        setLectures((lData as Lecture[]) || []);
      }
    }
    setLoading(false);
  };

  const topicsForUnit = (unitId: string) => topics.filter((t) => t.unit_id === unitId);
  const lecturesForTopic = (topicId: string) => lectures.filter((l) => l.topic_id === topicId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center">
            <Link to="/courses" className="flex items-center gap-2.5">
              <img src={logo} alt="ScholarsHub" className="h-8 w-8 rounded" />
              <span className="font-display text-lg font-bold">Scholars<span className="text-primary">Hub</span></span>
            </Link>
          </div>
        </header>
        <main className="container py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Subject not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/courses"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ScholarsHub" className="h-7 w-7 rounded" />
            <span className="font-display text-base font-bold">Scholars<span className="text-primary">Hub</span></span>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        {/* Subject header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">{subject.code}</Badge>
          <h1 className="font-display text-3xl font-bold text-foreground">{subject.name}</h1>
          {subject.description && (
            <p className="mt-2 text-muted-foreground">{subject.description}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {units.length} Units</span>
            <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {topics.length} Topics</span>
            <span className="flex items-center gap-1"><Play className="h-4 w-4" /> {lectures.length} Lectures</span>
          </div>
        </div>

        {/* Units accordion */}
        {units.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No units added yet.</p>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {units.map((unit) => (
              <AccordionItem key={unit.id} value={unit.id} className="border rounded-xl px-1">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {unit.unit_number}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{unit.title}</h3>
                      {unit.description && <p className="text-xs text-muted-foreground">{unit.description}</p>}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {topicsForUnit(unit.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No topics yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {topicsForUnit(unit.id).map((topic) => (
                        <div key={topic.id}>
                          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <span className="text-muted-foreground">{unit.unit_number}.{topic.topic_number}</span>
                            {topic.title}
                          </h4>
                          {lecturesForTopic(topic.id).length > 0 && (
                            <div className="ml-6 space-y-1.5">
                              {lecturesForTopic(topic.id).map((lec) => {
                                const Icon = typeIcon[lec.type] || FileText;
                                return (
                                  <div
                                    key={lec.id}
                                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                                  >
                                    <div className={`rounded-md p-1.5 ${typeColor[lec.type] || "bg-muted"}`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <span className="flex-1 text-sm text-foreground">{lec.title}</span>
                                    {lec.duration_minutes && (
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" /> {lec.duration_minutes}m
                                      </span>
                                    )}
                                    {lec.is_free ? (
                                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Free</Badge>
                                    ) : (
                                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>
    </div>
  );
};

export default SubjectDetail;

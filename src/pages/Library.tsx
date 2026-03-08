import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Search, ArrowLeft, Star, Lock, Eye,
  FileText, BookMarked, FlaskConical, FileQuestion, GraduationCap,
} from "lucide-react";
import logo from "@/assets/logo.png";

const bookTypeConfig: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  textbook: { label: "Textbook", icon: BookOpen, color: "bg-primary/10 text-primary" },
  reference: { label: "Reference", icon: BookMarked, color: "bg-green-500/10 text-green-700" },
  exam_guide: { label: "Exam Guide", icon: Star, color: "bg-accent/20 text-accent-foreground" },
  lab_manual: { label: "Lab Manual", icon: FlaskConical, color: "bg-purple-500/10 text-purple-700" },
  previous_papers: { label: "Previous Papers", icon: FileQuestion, color: "bg-red-500/10 text-red-700" },
  notes: { label: "Notes", icon: FileText, color: "bg-muted text-muted-foreground" },
};

interface Book {
  id: string;
  title: string;
  author: string;
  edition: string | null;
  publication: string | null;
  book_type: string;
  is_required: boolean;
  is_free: boolean;
  total_pages: number | null;
  cover_url: string | null;
  tags: string[];
  description: string | null;
  subject_id: string | null;
}

interface Degree { id: string; name: string; code: string; }
interface Semester { id: string; label: string; semester_number: number; year_id: string; }
interface Subject { id: string; name: string; code: string; semester_id: string; }

const Library = () => {
  const [search, setSearch] = useState("");
  const [selectedDegree, setSelectedDegree] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const { data: libraryData, isLoading: loading } = useQuery({
    queryKey: ["library-data"],
    queryFn: async () => {
      const [booksRes, degreesRes, semestersRes, subjectsRes] = await Promise.all([
        supabase.from("books").select("id, title, author, edition, publication, book_type, is_required, is_free, total_pages, cover_url, tags, description, subject_id").eq("is_published", true),
        supabase.from("degrees").select("id, name, code").eq("is_active", true),
        supabase.from("semesters").select("id, label, semester_number, year_id"),
        supabase.from("subjects").select("id, name, code, semester_id").eq("is_active", true),
      ]);
      return {
        books: (booksRes.data as Book[]) || [],
        degrees: degreesRes.data || [],
        semesters: semestersRes.data || [],
        subjects: subjectsRes.data || [],
      };
    },
  });

  const books = libraryData?.books || [];
  const degrees = libraryData?.degrees || [];
  const semesters = libraryData?.semesters || [];
  const subjects = libraryData?.subjects || [];

  const filtered = useMemo(() => books.filter((b) => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab !== "all" && b.book_type !== activeTab) return false;
    if (selectedSubject !== "all" && b.subject_id !== selectedSubject) return false;
    return true;
  }), [books, search, activeTab, selectedSubject]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <img src={logo} alt="Learn Path" className="h-7 w-7 rounded" />
          </Link>
          <h1 className="font-display text-lg font-bold">Digital Library</h1>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search books, authors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Book type tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-transparent p-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-xs">
              All
            </TabsTrigger>
            {Object.entries(bookTypeConfig).map(([key, cfg]) => (
              <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-xs gap-1">
                <cfg.icon className="h-3 w-3" /> {cfg.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-display text-lg font-semibold">No books found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((book) => {
                  const cfg = bookTypeConfig[book.book_type] || bookTypeConfig.textbook;
                  const TypeIcon = cfg.icon;
                  return (
                    <Link key={book.id} to={`/library/read/${book.id}`}>
                      <Card className="group hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className={`rounded-lg p-2.5 shrink-0 ${cfg.color}`}>
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">{book.title}</h3>
                              <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
                            </div>
                          </div>
                          {book.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className={cfg.color + " text-xs"}>{cfg.label}</Badge>
                            {book.is_required && <Badge variant="outline" className="text-xs border-destructive text-destructive">Required</Badge>}
                            {book.is_free ? (
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700">Free</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs gap-1"><Lock className="h-2.5 w-2.5" /> Premium</Badge>
                            )}
                            {book.total_pages && (
                              <span className="text-xs text-muted-foreground">{book.total_pages} pages</span>
                            )}
                          </div>
                          {book.edition && (
                            <p className="text-xs text-muted-foreground">Edition: {book.edition} {book.publication ? `• ${book.publication}` : ""}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Library;

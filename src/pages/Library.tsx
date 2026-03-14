import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, Search, ArrowLeft, Star, Lock,
  FileText, BookMarked, FlaskConical, FileQuestion,
} from "lucide-react";
import logo from "@/assets/logo.png";

const bookTypeConfig: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  textbook: { label: "Textbook", icon: BookOpen, color: "bg-primary/10 text-primary" },
  reference: { label: "Reference", icon: BookMarked, color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  exam_guide: { label: "Exam Guide", icon: Star, color: "bg-accent/20 text-accent-foreground" },
  lab_manual: { label: "Lab Manual", icon: FlaskConical, color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  previous_papers: { label: "Previous Papers", icon: FileQuestion, color: "bg-red-500/10 text-red-700 dark:text-red-400" },
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
  degree_id: string | null;
  semester_id: string | null;
}

const Library = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDegree, setSelectedDegree] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");

  const { data: books = [], isLoading: loading } = useQuery({
    queryKey: ["library-books"],
    queryFn: async () => {
      const { data } = await supabase
        .from("books")
        .select("id, title, author, edition, publication, book_type, is_required, is_free, total_pages, cover_url, tags, description, degree_id, semester_id")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return (data as Book[]) || [];
    },
  });

  const { data: degrees = [] } = useQuery({
    queryKey: ["library-degrees"],
    queryFn: async () => {
      const { data } = await supabase
        .from("degrees")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["library-semesters", selectedDegree],
    queryFn: async () => {
      let query = supabase
        .from("semesters")
        .select("id, label, semester_number, year_id, years!inner(degree_id)")
        .order("semester_number");
      if (selectedDegree !== "all") {
        query = query.eq("years.degree_id", selectedDegree);
      }
      const { data } = await query;
      return data || [];
    },
  });

  const filtered = useMemo(() => books.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      if (!b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q) && !(b.tags || []).some(t => t.toLowerCase().includes(q))) return false;
    }
    if (activeTab !== "all" && b.book_type !== activeTab) return false;
    if (selectedDegree !== "all" && b.degree_id !== selectedDegree) return false;
    if (selectedSemester !== "all" && b.semester_id !== selectedSemester) return false;
    return true;
  }), [books, search, activeTab, selectedDegree, selectedSemester]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-12 sm:h-14 items-center gap-2 sm:gap-3 px-3 sm:px-6">
          <Link to="/" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <img src={logo} alt="Learn Path" className="h-6 w-6 sm:h-7 sm:w-7 rounded" />
          </Link>
          <h1 className="font-display text-base sm:text-lg font-bold truncate">Digital Library</h1>
          <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{filtered.length}/{books.length}</span>
        </div>
      </header>

      <main className="container px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search books, authors, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 sm:h-10 text-sm" />
        </div>

        {/* Degree & Semester filters */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <Select value={selectedDegree} onValueChange={(v) => { setSelectedDegree(v); setSelectedSemester("all"); }}>
            <SelectTrigger className="w-full sm:w-[160px] h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="All Degrees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Degrees</SelectItem>
              {degrees.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.code} – {d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Book type tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-3 sm:-mx-0 px-3 sm:px-0 scrollbar-hide">
            <TabsList className="w-max sm:w-full flex-nowrap sm:flex-wrap h-auto gap-1 bg-transparent p-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs shrink-0">
                All ({books.length})
              </TabsTrigger>
              {Object.entries(bookTypeConfig).map(([key, cfg]) => {
                const count = books.filter(b => b.book_type === key).length;
                return (
                  <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs gap-1 shrink-0">
                    <cfg.icon className="h-3 w-3" /> <span className="hidden xs:inline">{cfg.label}</span><span className="xs:hidden">{cfg.label.split(' ')[0]}</span> {count > 0 && `(${count})`}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 sm:h-48 rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-display text-lg font-semibold">No books found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">Free</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs gap-1"><Lock className="h-2.5 w-2.5" /> Premium</Badge>
                            )}
                            {book.total_pages && (
                              <span className="text-xs text-muted-foreground">{book.total_pages} pages</span>
                            )}
                          </div>
                          {(book.tags || []).length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {book.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">#{tag}</span>
                              ))}
                            </div>
                          )}
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

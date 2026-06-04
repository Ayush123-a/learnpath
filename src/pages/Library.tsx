import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  FileText, BookMarked, FlaskConical, FileQuestion, Sparkles
} from "lucide-react";
import logo from "@/assets/logo.png";

const bookTypeConfig: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  textbook: { label: "Textbook", icon: BookOpen, color: "bg-primary/10 text-primary border-primary/30" },
  reference: { label: "Reference", icon: BookMarked, color: "bg-secondary/10 text-secondary border-secondary/30" },
  exam_guide: { label: "Exam Guide", icon: Star, color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  lab_manual: { label: "Lab Manual", icon: FlaskConical, color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  previous_papers: { label: "Previous Papers", icon: FileQuestion, color: "bg-destructive/10 text-destructive border-destructive/30" },
  notes: { label: "Notes", icon: FileText, color: "bg-muted text-muted-foreground border-muted" },
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: "radial-gradient(circle at 50% 0%, #112036 0%, #041329 70%)" }}>
      {/* Decorative radial glows */}
      <div className="bg-glow-blob bg-glow-cyan top-0 left-1/4 w-[500px] h-[500px] opacity-[0.08]" />
      <div className="bg-glow-blob bg-glow-blue bottom-10 right-10 w-[400px] h-[400px] opacity-[0.05]" />

      <header className="sticky top-0 z-50 glass-nav">
        <div className="container flex h-14 items-center gap-3 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <img src={logo} alt="Learn Path" className="h-6 w-6 rounded" />
          </Link>
          <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            DIGITAL LIBRARY
          </h1>
          <span className="ml-auto text-xs font-mono badge-cyan bg-primary/5 py-0.5 px-2">
            {filtered.length} / {books.length} BOOKS
          </span>
        </div>
      </header>

      <main className="container max-w-7xl px-4 py-6 space-y-6 relative z-10 page-enter">
        {/* Search */}
        <div className="relative glass-card p-1.5 rounded-xl shadow-lg border-white/5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search books, authors, tags..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10 h-10 border-0 bg-transparent text-sm focus-visible:ring-0 text-white placeholder-muted-foreground" 
          />
        </div>

        {/* Degree & Semester filters */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <Select value={selectedDegree} onValueChange={(v) => { setSelectedDegree(v); setSelectedSemester("all"); }}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-card/45 border-white/10 text-xs sm:text-sm text-foreground rounded-lg glass-card">
              <SelectValue placeholder="All Degrees" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 border-white/10 backdrop-blur-xl">
              <SelectItem value="all">All Degrees</SelectItem>
              {degrees.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.code} – {d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-card/45 border-white/10 text-xs sm:text-sm text-foreground rounded-lg glass-card">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 border-white/10 backdrop-blur-xl">
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Book type tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
            <TabsList className="w-max flex h-auto gap-2 bg-transparent p-0">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-white/5 border border-white/5 text-muted-foreground rounded-full px-4 py-1.5 text-xs font-semibold shrink-0 tracking-wider uppercase transition-all duration-200"
              >
                All ({books.length})
              </TabsTrigger>
              {Object.entries(bookTypeConfig).map(([key, cfg]) => {
                const count = books.filter(b => b.book_type === key).length;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key} 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-white/5 border border-white/5 text-muted-foreground rounded-full px-4 py-1.5 text-xs font-semibold gap-1.5 shrink-0 tracking-wider uppercase transition-all duration-200"
                  >
                    <cfg.icon className="h-3.5 w-3.5" /> 
                    <span>{cfg.label}</span>
                    {count > 0 && <span className="opacity-60">({count})</span>}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="outline-none mt-0">
            {loading ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-44 rounded-xl bg-white/5 border border-white/5" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center glass-card border-white/5 p-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 animate-pulse" />
                <h3 className="mt-4 font-display text-lg font-bold text-white">No publications found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">We couldn't find any books matching your selected filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((book) => {
                  const cfg = bookTypeConfig[book.book_type] || bookTypeConfig.textbook;
                  const TypeIcon = cfg.icon;
                  return (
                    <Link key={book.id} to={`/library/read/${book.id}`}>
                      <Card className="glass-card bg-card/40 border-white/5 hover:border-primary/40 h-full transition-all duration-300 group flex flex-col justify-between">
                        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className={`rounded-xl p-2.5 shrink-0 border ${cfg.color}`}>
                                <TypeIcon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tight text-base">
                                  {book.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5 font-medium">{book.author}</p>
                              </div>
                            </div>
                            
                            {book.description && (
                              <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">{book.description}</p>
                            )}
                          </div>

                          <div className="space-y-3 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge className="text-[10px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                                {cfg.label}
                              </Badge>
                              {book.is_required && (
                                <Badge className="text-[10px] font-mono tracking-wider uppercase bg-destructive/10 text-destructive border border-destructive/20">
                                  Required
                                </Badge>
                              )}
                              {book.is_free ? (
                                <Badge className="text-[10px] font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Free Access
                                </Badge>
                              ) : (
                                <Badge className="text-[10px] font-mono tracking-wider uppercase bg-white/5 text-secondary border border-white/10 gap-1">
                                  <Lock className="h-2.5 w-2.5" /> Premium
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                              {book.total_pages && <span>{book.total_pages} PAGES</span>}
                              {book.edition && <span className="text-[10px] uppercase">{book.edition}</span>}
                            </div>
                          </div>
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

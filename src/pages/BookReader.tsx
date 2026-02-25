import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Moon, Sun, ZoomIn, ZoomOut, Bookmark, BookmarkCheck,
  Highlighter, StickyNote, ChevronLeft, ChevronRight, Search,
  Menu, Sparkles, Lock,
} from "lucide-react";

interface BookData {
  id: string;
  title: string;
  author: string;
  file_url: string | null;
  total_pages: number | null;
  is_free: boolean;
  free_preview_pages: number | null;
}

interface Annotation {
  id: string;
  annotation_type: string;
  page_number: number;
  content: string | null;
  color: string | null;
  created_at: string;
}

const BookReader = () => {
  const { bookId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [noteText, setNoteText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarTab, setSidebarTab] = useState("bookmarks");

  const totalPages = book?.total_pages || 100;
  const previewLimit = book?.free_preview_pages || 5;
  const isLocked = !book?.is_free && !user && currentPage > previewLimit;

  useEffect(() => {
    const fetch = async () => {
      if (!bookId) return;
      const { data } = await supabase.from("books").select("id, title, author, file_url, total_pages, is_free, free_preview_pages").eq("id", bookId).single();
      if (data) setBook(data as BookData);
      setLoading(false);
    };
    fetch();
  }, [bookId]);

  // Load annotations
  useEffect(() => {
    if (!user || !bookId) return;
    const loadAnnotations = async () => {
      const { data } = await supabase.from("book_annotations").select("*").eq("book_id", bookId).eq("user_id", user.id).order("page_number");
      if (data) setAnnotations(data as Annotation[]);
    };
    loadAnnotations();
  }, [user, bookId]);

  // Save reading progress
  useEffect(() => {
    if (!user || !bookId) return;
    const timer = setTimeout(async () => {
      await supabase.from("reading_progress").upsert(
        { user_id: user.id, book_id: bookId, current_page: currentPage, last_read_at: new Date().toISOString() },
        { onConflict: "user_id,book_id" }
      );
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentPage, user, bookId]);

  // Load last reading position
  useEffect(() => {
    if (!user || !bookId) return;
    supabase.from("reading_progress").select("current_page").eq("user_id", user.id).eq("book_id", bookId).single()
      .then(({ data }) => { if (data) setCurrentPage(data.current_page); });
  }, [user, bookId]);

  const addAnnotation = useCallback(async (type: string, content?: string) => {
    if (!user || !bookId) {
      toast({ title: "Sign in required", description: "Please sign in to add annotations." });
      return;
    }
    const { data, error } = await supabase.from("book_annotations").insert({
      user_id: user.id,
      book_id: bookId,
      annotation_type: type,
      page_number: currentPage,
      content: content || null,
      color: type === "highlight" ? "#FFEB3B" : null,
    }).select().single();
    if (data) {
      setAnnotations((prev) => [...prev, data as Annotation]);
      toast({ title: type === "bookmark" ? "Page bookmarked" : type === "highlight" ? "Highlight added" : "Note saved" });
    }
  }, [user, bookId, currentPage, toast]);

  const removeAnnotation = useCallback(async (id: string) => {
    await supabase.from("book_annotations").delete().eq("id", id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const isBookmarked = annotations.some((a) => a.annotation_type === "bookmark" && a.page_number === currentPage);
  const pageBookmark = annotations.find((a) => a.annotation_type === "bookmark" && a.page_number === currentPage);
  const bookmarks = annotations.filter((a) => a.annotation_type === "bookmark");
  const highlights = annotations.filter((a) => a.annotation_type === "highlight");
  const notes = annotations.filter((a) => a.annotation_type === "note");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Book not found.</p>
        <Link to="/library"><Button variant="outline">Back to Library</Button></Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-[hsl(222,47%,6%)] text-[hsl(210,40%,96%)]" : "bg-background text-foreground"}`}>
      {/* Top bar */}
      <header className={`sticky top-0 z-50 border-b ${darkMode ? "bg-[hsl(222,47%,9%)]/95 border-[hsl(221,40%,18%)]" : "bg-background/95 border-border"} backdrop-blur`}>
        <div className="flex h-12 items-center gap-2 px-3">
          <Link to="/library"><Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{book.title}</p>
            <p className="text-xs text-muted-foreground">{book.author}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(50, z - 10))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-10 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(200, z + 10))}>
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="h-4 w-4" /></Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Reader Tools</SheetTitle></SheetHeader>
                <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="mt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="bookmarks" className="flex-1 text-xs">Bookmarks</TabsTrigger>
                    <TabsTrigger value="highlights" className="flex-1 text-xs">Highlights</TabsTrigger>
                    <TabsTrigger value="notes" className="flex-1 text-xs">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bookmarks">
                    <ScrollArea className="h-[60vh]">
                      {bookmarks.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No bookmarks yet</p>
                      ) : (
                        <div className="space-y-2 py-2">
                          {bookmarks.map((b) => (
                            <div key={b.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                              <button onClick={() => setCurrentPage(b.page_number)} className="text-sm hover:text-primary">Page {b.page_number}</button>
                              <Button variant="ghost" size="sm" onClick={() => removeAnnotation(b.id)} className="text-xs text-destructive">Remove</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="highlights">
                    <ScrollArea className="h-[60vh]">
                      {highlights.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No highlights yet</p>
                      ) : (
                        <div className="space-y-2 py-2">
                          {highlights.map((h) => (
                            <div key={h.id} className="p-2 rounded-md border-l-4 border-accent bg-accent/10">
                              <p className="text-xs text-muted-foreground">Page {h.page_number}</p>
                              <button onClick={() => setCurrentPage(h.page_number)} className="text-sm hover:text-primary">{h.content || "Highlighted text"}</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="space-y-3 py-2">
                      <div className="space-y-2">
                        <Textarea placeholder={`Add note for page ${currentPage}...`} value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} />
                        <Button size="sm" className="w-full" disabled={!noteText.trim()} onClick={() => { addAnnotation("note", noteText); setNoteText(""); }}>
                          <StickyNote className="h-3 w-3 mr-1" /> Save Note
                        </Button>
                      </div>
                      <ScrollArea className="h-[40vh]">
                        {notes.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">No notes yet</p>
                        ) : (
                          <div className="space-y-2">
                            {notes.map((n) => (
                              <div key={n.id} className="p-2 rounded-md bg-muted">
                                <p className="text-xs text-muted-foreground mb-1">Page {n.page_number}</p>
                                <p className="text-sm">{n.content}</p>
                                <div className="flex gap-2 mt-1">
                                  <button onClick={() => setCurrentPage(n.page_number)} className="text-xs text-primary hover:underline">Go to page</button>
                                  <button onClick={() => removeAnnotation(n.id)} className="text-xs text-destructive hover:underline">Delete</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Reader area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {isLocked ? (
          <div className="text-center space-y-4 max-w-sm">
            <Lock className="mx-auto h-16 w-16 text-muted-foreground/40" />
            <h2 className="font-display text-xl font-bold">Premium Content</h2>
            <p className="text-muted-foreground text-sm">
              Free preview is limited to {previewLimit} pages. Sign in or upgrade to continue reading.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/auth"><Button>Sign In</Button></Link>
              <Link to="/library"><Button variant="outline">Back to Library</Button></Link>
            </div>
          </div>
        ) : (
          <div
            className={`w-full max-w-3xl rounded-lg border shadow-sm p-8 min-h-[60vh] flex flex-col items-center justify-center ${darkMode ? "bg-[hsl(222,47%,9%)] border-[hsl(221,40%,18%)]" : "bg-card border-border"}`}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            <p className="text-muted-foreground text-sm text-center">
              📄 Page {currentPage} of {totalPages}
            </p>
            <p className="mt-4 text-center text-muted-foreground text-xs">
              {book.file_url ? (
                <span>PDF viewer will render content from: <code className="text-primary">{book.file_url}</code></span>
              ) : (
                "No file uploaded for this book yet. Content will appear here once the file is available."
              )}
            </p>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <footer className={`sticky bottom-0 z-50 border-t ${darkMode ? "bg-[hsl(222,47%,9%)]/95 border-[hsl(221,40%,18%)]" : "bg-background/95 border-border"} backdrop-blur`}>
        <div className="flex h-12 items-center justify-between px-3 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => isBookmarked && pageBookmark ? removeAnnotation(pageBookmark.id) : addAnnotation("bookmark")}>
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => addAnnotation("highlight")}>
              <Highlighter className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => { const p = parseInt(e.target.value); if (p >= 1 && p <= totalPages) setCurrentPage(p); }}
                className="w-14 h-8 text-center text-xs"
                min={1}
                max={totalPages}
              />
              <span className="text-xs text-muted-foreground">/ {totalPages}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default BookReader;

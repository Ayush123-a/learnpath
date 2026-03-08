import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Upload, BookOpen, Newspaper, Plus, FileUp,
  Eye, EyeOff, Trash2, Loader2, Image as ImageIcon,
} from "lucide-react";
import logo from "@/assets/logo.png";
import DocumentScanner from "@/components/DocumentScanner";

const BOOK_TYPES = [
  { value: "textbook", label: "Main Textbook" },
  { value: "reference", label: "Reference Book" },
  { value: "exam_guide", label: "Exam Guide" },
  { value: "lab_manual", label: "Lab Manual" },
  { value: "previous_papers", label: "Previous Year Papers" },
];

const NEWS_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "academic", label: "Academic" },
  { value: "event", label: "Event" },
  { value: "exam", label: "Exam Update" },
  { value: "placement", label: "Placement" },
];

const ContentCreatorDashboard = () => {
  const { user, roles, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Book upload state
  const [bookForm, setBookForm] = useState({
    title: "", author: "", edition: "", publication: "",
    isbn: "", description: "", book_type: "textbook",
    degree_id: "", semester_id: "", subject_id: "",
    is_free: false, is_required: false,
  });
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingBook, setUploadingBook] = useState(false);

  // News state
  const [newsForm, setNewsForm] = useState({
    title: "", content: "", category: "general", is_published: false,
  });
  const [newsImage, setNewsImage] = useState<File | null>(null);
  const [uploadingNews, setUploadingNews] = useState(false);

  // Fetch degrees for dropdown
  const { data: degrees } = useQuery({
    queryKey: ["degrees"],
    queryFn: async () => {
      const { data } = await supabase.from("degrees").select("*").eq("is_active", true).order("code");
      return data || [];
    },
  });

  // Fetch semesters based on degree
  const { data: semesters } = useQuery({
    queryKey: ["semesters", bookForm.degree_id],
    queryFn: async () => {
      if (!bookForm.degree_id) return [];
      const { data: years } = await supabase.from("years").select("id").eq("degree_id", bookForm.degree_id);
      if (!years?.length) return [];
      const { data } = await supabase.from("semesters").select("*").in("year_id", years.map(y => y.id)).order("semester_number");
      return data || [];
    },
    enabled: !!bookForm.degree_id,
  });

  // Fetch subjects based on semester
  const { data: subjects } = useQuery({
    queryKey: ["subjects", bookForm.semester_id],
    queryFn: async () => {
      if (!bookForm.semester_id) return [];
      const { data } = await supabase.from("subjects").select("*").eq("semester_id", bookForm.semester_id).order("name");
      return data || [];
    },
    enabled: !!bookForm.semester_id,
  });

  // Fetch my books
  const { data: myBooks } = useQuery({
    queryKey: ["my-books", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("books").select("*").eq("uploaded_by", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch my news
  const { data: myNews } = useQuery({
    queryKey: ["my-news", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").eq("created_by", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("content-uploads").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("content-uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleBookUpload = async () => {
    if (!bookForm.title || !bookForm.author) {
      toast({ title: "Missing fields", description: "Title and Author are required.", variant: "destructive" });
      return;
    }
    setUploadingBook(true);
    try {
      let file_url = null;
      let cover_url = null;
      if (bookFile) file_url = await uploadFile(bookFile, "books");
      if (coverFile) cover_url = await uploadFile(coverFile, "covers");

      const { error } = await supabase.from("books").insert({
        title: bookForm.title,
        author: bookForm.author,
        edition: bookForm.edition || null,
        publication: bookForm.publication || null,
        isbn: bookForm.isbn || null,
        description: bookForm.description || null,
        book_type: bookForm.book_type,
        degree_id: bookForm.degree_id || null,
        semester_id: bookForm.semester_id || null,
        subject_id: bookForm.subject_id || null,
        is_free: bookForm.is_free,
        is_required: bookForm.is_required,
        file_url,
        cover_url,
        uploaded_by: user!.id,
        is_published: false,
        file_type: bookFile?.name.split(".").pop() || "pdf",
      });
      if (error) throw error;

      toast({ title: "Book uploaded!", description: "Your book has been submitted for admin approval." });
      setBookForm({ title: "", author: "", edition: "", publication: "", isbn: "", description: "", book_type: "textbook", degree_id: "", semester_id: "", subject_id: "", is_free: false, is_required: false });
      setBookFile(null);
      setCoverFile(null);
      queryClient.invalidateQueries({ queryKey: ["my-books"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingBook(false);
    }
  };

  const handleNewsSubmit = async () => {
    if (!newsForm.title || !newsForm.content) {
      toast({ title: "Missing fields", description: "Title and Content are required.", variant: "destructive" });
      return;
    }
    setUploadingNews(true);
    try {
      let image_url = null;
      if (newsImage) image_url = await uploadFile(newsImage, "news-images");

      const { error } = await supabase.from("news").insert({
        title: newsForm.title,
        content: newsForm.content,
        category: newsForm.category,
        is_published: newsForm.is_published,
        image_url,
        created_by: user!.id,
      });
      if (error) throw error;

      toast({ title: "News created!", description: newsForm.is_published ? "Published successfully." : "Saved as draft." });
      setNewsForm({ title: "", content: "", category: "general", is_published: false });
      setNewsImage(null);
      queryClient.invalidateQueries({ queryKey: ["my-news"] });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingNews(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes("content_creator") && !roles.includes("admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <img src={logo} alt="ScholarsHub" className="h-7 w-7 rounded" />
          </Link>
          <h1 className="font-display text-lg font-bold">Content Creator Studio</h1>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        <Tabs defaultValue="upload-book">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upload-book" className="gap-2"><BookOpen className="h-4 w-4" /> Upload Book</TabsTrigger>
            <TabsTrigger value="create-news" className="gap-2"><Newspaper className="h-4 w-4" /> Create News</TabsTrigger>
            <TabsTrigger value="my-content" className="gap-2"><Eye className="h-4 w-4" /> My Content</TabsTrigger>
          </TabsList>

          {/* UPLOAD BOOK TAB */}
          <TabsContent value="upload-book">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload a Book / Document</CardTitle>
                <CardDescription>Upload PDF, EPUB, or notes. Admin will approve before publishing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={bookForm.title} onChange={e => setBookForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Data Structures Using C" />
                  </div>
                  <div className="space-y-2">
                    <Label>Author *</Label>
                    <Input value={bookForm.author} onChange={e => setBookForm(f => ({ ...f, author: e.target.value }))} placeholder="e.g. Reema Thareja" />
                  </div>
                  <div className="space-y-2">
                    <Label>Edition</Label>
                    <Input value={bookForm.edition} onChange={e => setBookForm(f => ({ ...f, edition: e.target.value }))} placeholder="e.g. 3rd Edition" />
                  </div>
                  <div className="space-y-2">
                    <Label>Publication</Label>
                    <Input value={bookForm.publication} onChange={e => setBookForm(f => ({ ...f, publication: e.target.value }))} placeholder="e.g. Oxford University Press" />
                  </div>
                  <div className="space-y-2">
                    <Label>ISBN</Label>
                    <Input value={bookForm.isbn} onChange={e => setBookForm(f => ({ ...f, isbn: e.target.value }))} placeholder="e.g. 978-0-13-468599-1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Book Type</Label>
                    <Select value={bookForm.book_type} onValueChange={v => setBookForm(f => ({ ...f, book_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BOOK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={bookForm.description} onChange={e => setBookForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the book..." rows={3} />
                </div>

                {/* Degree / Semester / Subject selectors */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Select value={bookForm.degree_id} onValueChange={v => setBookForm(f => ({ ...f, degree_id: v, semester_id: "", subject_id: "" }))}>
                      <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                      <SelectContent>
                        {degrees?.map(d => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={bookForm.semester_id} onValueChange={v => setBookForm(f => ({ ...f, semester_id: v, subject_id: "" }))} disabled={!bookForm.degree_id}>
                      <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                      <SelectContent>
                        {semesters?.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={bookForm.subject_id} onValueChange={v => setBookForm(f => ({ ...f, subject_id: v }))} disabled={!bookForm.semester_id}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Book File (PDF/EPUB)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <input type="file" accept=".pdf,.epub,.doc,.docx" onChange={e => setBookFile(e.target.files?.[0] || null)} className="hidden" id="book-file" />
                      <label htmlFor="book-file" className="cursor-pointer flex flex-col items-center gap-2">
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{bookFile ? bookFile.name : "Click to upload book file"}</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="hidden" id="cover-file" />
                      <label htmlFor="cover-file" className="cursor-pointer flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{coverFile ? coverFile.name : "Click to upload cover"}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={bookForm.is_free} onCheckedChange={v => setBookForm(f => ({ ...f, is_free: v }))} />
                    <Label>Free book</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={bookForm.is_required} onCheckedChange={v => setBookForm(f => ({ ...f, is_required: v }))} />
                    <Label>Required textbook</Label>
                  </div>
                </div>

                <Button onClick={handleBookUpload} disabled={uploadingBook} className="w-full gap-2">
                  {uploadingBook ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingBook ? "Uploading..." : "Submit Book for Review"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CREATE NEWS TAB */}
          <TabsContent value="create-news">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" /> Create News / Announcement</CardTitle>
                <CardDescription>Post updates, academic news, or event announcements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={newsForm.title} onChange={e => setNewsForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Semester Exam Schedule Released" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newsForm.category} onValueChange={v => setNewsForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {NEWS_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea value={newsForm.content} onChange={e => setNewsForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your news content here..." rows={6} />
                </div>

                <div className="space-y-2">
                  <Label>Featured Image (optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <input type="file" accept="image/*" onChange={e => setNewsImage(e.target.files?.[0] || null)} className="hidden" id="news-image" />
                    <label htmlFor="news-image" className="cursor-pointer flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{newsImage ? newsImage.name : "Click to upload image"}</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={newsForm.is_published} onCheckedChange={v => setNewsForm(f => ({ ...f, is_published: v }))} />
                  <Label>Publish immediately</Label>
                </div>

                <Button onClick={handleNewsSubmit} disabled={uploadingNews} className="w-full gap-2">
                  {uploadingNews ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {uploadingNews ? "Saving..." : newsForm.is_published ? "Publish News" : "Save as Draft"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MY CONTENT TAB */}
          <TabsContent value="my-content">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> My Books ({myBooks?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {!myBooks?.length ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No books uploaded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {myBooks.map(book => (
                        <div key={book.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium text-foreground">{book.title}</p>
                            <p className="text-sm text-muted-foreground">{book.author} · {book.book_type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={book.is_published ? "default" : "secondary"}>
                              {book.is_published ? "Published" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" /> My News ({myNews?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {!myNews?.length ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No news posted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {myNews.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={item.is_published ? "default" : "secondary"}>
                            {item.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ContentCreatorDashboard;

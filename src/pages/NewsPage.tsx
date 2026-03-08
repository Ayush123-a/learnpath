import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Search, Newspaper, Calendar, Megaphone,
  GraduationCap, Briefcase, Info, Filter,
} from "lucide-react";
import logo from "@/assets/logo.png";

const categories = [
  { value: "all", label: "All", icon: Filter },
  { value: "general", label: "General", icon: Info },
  { value: "academic", label: "Academic", icon: GraduationCap },
  { value: "event", label: "Event", icon: Calendar },
  { value: "exam", label: "Exam", icon: Megaphone },
  { value: "placement", label: "Placement", icon: Briefcase },
];

const categoryColors: Record<string, string> = {
  general: "bg-muted text-muted-foreground",
  academic: "bg-primary/10 text-primary",
  event: "bg-amber-500/10 text-amber-700",
  exam: "bg-red-500/10 text-red-700",
  placement: "bg-green-500/10 text-green-700",
};

const NewsPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: news, isLoading } = useQuery({
    queryKey: ["all-published-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filtered = news?.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <img src={logo} alt="ScholarsHub" className="h-7 w-7 rounded" />
          </Link>
          <h1 className="font-display text-lg font-bold flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" /> News & Announcements
          </h1>
        </div>
      </header>

      <main className="container py-6 max-w-3xl">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news..."
            className="pl-10"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <Button
                key={cat.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="gap-1.5 shrink-0"
              >
                <CatIcon className="h-3.5 w-3.5" /> {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="animate-pulse space-y-3">
                    <div className="h-5 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No news found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {search || activeCategory !== "all"
                ? "Try adjusting your search or filters."
                : "No announcements have been posted yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const color = categoryColors[item.category] || categoryColors.general;
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-28 sm:w-36 object-cover shrink-0"
                        />
                      )}
                      <div className="p-4 sm:p-5 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
                            {item.title}
                          </h3>
                          <Badge variant="outline" className={`shrink-0 text-xs ${color}`}>
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {item.content}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {new Date(item.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default NewsPage;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, Megaphone, GraduationCap, Briefcase, Info } from "lucide-react";

const categoryConfig: Record<string, { label: string; icon: typeof Info; color: string }> = {
  general: { label: "General", icon: Info, color: "bg-muted text-muted-foreground" },
  academic: { label: "Academic", icon: GraduationCap, color: "bg-primary/10 text-primary" },
  event: { label: "Event", icon: Calendar, color: "bg-amber-500/10 text-amber-700" },
  exam: { label: "Exam", icon: Megaphone, color: "bg-red-500/10 text-red-700" },
  placement: { label: "Placement", icon: Briefcase, color: "bg-green-500/10 text-green-700" },
};

const NewsFeed = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ["published-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg"><Newspaper className="h-5 w-5 text-primary" /> Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!news?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Newspaper className="h-5 w-5 text-primary" /> Latest News & Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => {
            const cat = categoryConfig[item.category] || categoryConfig.general;
            const CatIcon = cat.icon;
            return (
              <div key={item.id} className="flex gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                    <CatIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground text-sm leading-tight">{item.title}</h4>
                    <Badge variant="outline" className={`shrink-0 text-xs ${cat.color}`}>{cat.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1.5">
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsFeed;

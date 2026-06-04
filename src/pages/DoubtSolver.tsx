import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Bot, User, Sparkles, Code, BookOpen } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

type Mode = "doubt" | "code" | "theory";
type Msg = { role: "user" | "assistant"; content: string };

const modes: { value: Mode; label: string; icon: typeof Sparkles; desc: string }[] = [
  { value: "doubt", label: "Doubt Solver", icon: Sparkles, desc: "Ask any academic question" },
  { value: "code", label: "Code Explainer", icon: Code, desc: "Paste code to explain" },
  { value: "theory", label: "Theory Answer", icon: BookOpen, desc: "Get exam-ready answers" },
];

const DoubtSolver = () => {
  const [mode, setMode] = useState<Mode>("doubt");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Use current URL from environment variables dynamically
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-doubt-solver`;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, mode }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI service error" }));
        toast.error(err.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to get AI response");
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden" style={{ background: "radial-gradient(circle at 50% 0%, #112036 0%, #041329 70%)" }}>
      {/* Decorative background glows */}
      <div className="bg-glow-blob bg-glow-cyan top-0 left-1/4 w-[400px] h-[400px] opacity-[0.06]" />

      <header className="sticky top-0 z-50 glass-nav">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary hover:bg-white/5">
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <img src={logo} alt="Learn Path" className="h-7 w-7 rounded" />
            <span className="font-display text-sm font-bold tracking-tight text-white hidden sm:inline">LEARNPATH AI</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto max-w-[65%] scrollbar-hide py-1">
            {modes.map((m) => (
              <Button
                key={m.value}
                variant={mode === m.value ? "default" : "ghost"}
                size="sm"
                className={`gap-1.5 text-xs font-semibold rounded-full px-3.5 h-8 tracking-wide transition-all uppercase ${
                  mode === m.value ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setMode(m.value)}
              >
                <m.icon className="h-3.5 w-3.5" />
                <span>{m.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 py-6 relative z-10 page-enter">
        <div className="container max-w-2xl space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 mb-4 shadow-[0_0_20px_rgba(0,229,255,0.08)]">
                <Sparkles className="h-9 w-9 text-primary animate-pulse" />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">AI Doubt Solver</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
                {modes.find((m) => m.value === mode)?.desc}. Submit any syllabus query to start solving.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 items-end ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 rounded-xl bg-primary/10 border border-primary/20 p-2 h-9 w-9 flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5 text-primary" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3.5 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap border shadow-md ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-medium border-primary/30"
                    : "glass-card bg-card/45 border-white/5 text-white"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 rounded-xl bg-white/5 border border-white/10 p-2 h-9 w-9 flex items-center justify-center">
                  <User className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3 items-end">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-2 h-9 w-9 flex items-center justify-center">
                <Bot className="h-4.5 w-4.5 text-primary animate-bounce" />
              </div>
              <div className="rounded-2xl glass-card bg-card/45 border-white/5 px-4 py-3 text-xs font-mono text-muted-foreground flex items-center gap-1.5 uppercase">
                <span className="live-dot" /> Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-white/5 glass-bottom-nav p-4 relative z-20">
        <div className="container max-w-2xl flex gap-2 items-end">
          <Textarea
            placeholder={
              mode === "code" ? "Paste your programming code block..." :
              mode === "theory" ? "Enter query topic for standard answer..." :
              "Ask any doubt or educational question..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-32 resize-none bg-white/5 border-white/10 text-white rounded-xl focus-visible:ring-primary focus-visible:ring-1 text-sm py-3"
            rows={1}
          />
          <Button 
            onClick={send} 
            disabled={isLoading || !input.trim()} 
            size="icon" 
            className="shrink-0 h-11 w-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoubtSolver;

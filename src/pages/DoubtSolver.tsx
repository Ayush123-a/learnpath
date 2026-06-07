import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Bot, User, Sparkles, Code, BookOpen, Wand2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

type Mode = "doubt" | "code" | "theory";
type Msg = { role: "user" | "assistant"; content: string };

const modes: { value: Mode; label: string; icon: typeof Sparkles; desc: string; accent: string }[] = [
  { value: "doubt",  label: "Doubt Solver",   icon: Sparkles, desc: "Ask any academic question", accent: "#00e5ff" },
  { value: "code",   label: "Code Explainer",  icon: Code,     desc: "Paste code to explain",     accent: "#b0c6ff" },
  { value: "theory", label: "Theory Answer",   icon: BookOpen, desc: "Get exam-ready answers",    accent: "#22ef7e" },
];

const quickPrompts = [
  "Explain recursion in simple terms",
  "What is polymorphism in OOP?",
  "How does TCP/IP work?",
  "Explain database normalization",
];

const DoubtSolver = () => {
  const [mode, setMode] = useState<Mode>("doubt");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeMode = modes.find(m => m.value === mode)!;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

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

  const sendQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => send(), 10);
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% -10%, #152d52 0%, #041329 70%)" }}>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full animate-orb"
          style={{ background: `radial-gradient(circle, ${activeMode.accent}12 0%, transparent 70%)` }} />
        <div className="absolute inset-0 mesh-pattern opacity-40" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <button className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#849396" }}>
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${activeMode.accent}15`, border: `1px solid ${activeMode.accent}30` }}>
                <Wand2 className="h-4 w-4" style={{ color: activeMode.accent }} />
              </div>
              <span className="font-bold text-sm hidden sm:inline" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
                LEARNPATH AI
              </span>
            </div>
          </div>

          {/* Mode switcher */}
          <div
            className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {modes.map((m) => (
              <button
                key={m.value}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 whitespace-nowrap"
                style={mode === m.value ? {
                  background: `${m.accent}15`,
                  border: `1px solid ${m.accent}30`,
                  color: m.accent,
                  boxShadow: `0 0 12px ${m.accent}20`,
                } : {
                  background: "transparent",
                  border: "1px solid transparent",
                  color: "#849396",
                }}
                onClick={() => setMode(m.value)}
              >
                <m.icon className="h-3.5 w-3.5" />
                <span>{m.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Chat area ── */}
      <ScrollArea className="flex-1 px-4 py-6 relative z-10">
        <div className="container max-w-2xl space-y-5">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
              <div
                className="relative rounded-3xl p-5 mb-5"
                style={{ background: `${activeMode.accent}10`, border: `1px solid ${activeMode.accent}25`, boxShadow: `0 0 32px ${activeMode.accent}15` }}
              >
                <activeMode.icon className="h-10 w-10" style={{ color: activeMode.accent }} />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse"
                  style={{ background: activeMode.accent, boxShadow: `0 0 8px ${activeMode.accent}` }} />
              </div>
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
                AI Doubt Solver
              </h2>
              <p className="text-sm mb-8 max-w-sm leading-relaxed" style={{ color: "#849396" }}>
                {activeMode.desc}. Submit any syllabus query to start solving.
              </p>

              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); }}
                    className="px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#bac9cc",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 items-end animate-fade-up ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div
                  className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${activeMode.accent}12`, border: `1px solid ${activeMode.accent}25`, boxShadow: `0 0 12px ${activeMode.accent}15` }}
                >
                  <Bot className="h-4 w-4" style={{ color: activeMode.accent }} />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3.5 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user" ? "chat-bubble-user text-white font-medium" : "chat-bubble-ai text-white"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div
                  className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <User className="h-4 w-4" style={{ color: "#849396" }} />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3 items-end animate-fade-up">
              <div
                className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: `${activeMode.accent}12`, border: `1px solid ${activeMode.accent}25` }}
              >
                <Bot className="h-4 w-4" style={{ color: activeMode.accent }} />
              </div>
              <div
                className="chat-bubble-ai px-4 py-3 flex items-center gap-1.5"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* ── Input area ── */}
      <div
        className="border-t p-4 relative z-20"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(8,18,38,0.85)", backdropFilter: "blur(32px)" }}
      >
        <div className="container max-w-2xl">
          <div
            className="flex gap-2 items-end rounded-2xl p-2"
            style={{ background: "rgba(17,32,54,0.8)", border: `1px solid ${activeMode.accent}30`, boxShadow: `0 0 20px ${activeMode.accent}10` }}
          >
            <Textarea
              ref={textareaRef}
              placeholder={
                mode === "code"   ? "Paste your programming code block..." :
                mode === "theory" ? "Enter query topic for standard answer..." :
                "Ask any doubt or educational question..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent text-white placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-2.5 px-2"
              rows={1}
            />
            <button
              onClick={send}
              disabled={isLoading || !input.trim()}
              className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
              style={{
                background: isLoading || !input.trim()
                  ? "rgba(255,255,255,0.06)"
                  : `linear-gradient(135deg, ${activeMode.accent}, ${activeMode.value === "doubt" ? "#0068ed" : activeMode.value === "code" ? "#6860ff" : "#00b860"})`,
                border: `1px solid ${activeMode.accent}40`,
                boxShadow: input.trim() ? `0 0 16px ${activeMode.accent}30` : "none",
                color: input.trim() ? "#041329" : "#849396",
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "#849396" }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoubtSolver;

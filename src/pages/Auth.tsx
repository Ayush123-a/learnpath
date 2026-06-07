import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowLeft, IdCard, ShieldCheck, Building2, GraduationCap, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

type SignupRole = "student" | "faculty" | "parent" | "admin";

const roleLabels: Record<SignupRole, string> = {
  student: "Student",
  faculty: "Faculty / Teacher",
  parent: "Parent",
  admin: "Admin",
};

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [formAnimating, setFormAnimating] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<SignupRole>("student");
  const [studentId, setStudentId] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState("");

  const { data: colleges = [] } = useQuery({
    queryKey: ["colleges-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colleges")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const switchTab = (newTab: "login" | "signup") => {
    if (newTab === tab) return;
    setFormAnimating(true);
    setTimeout(() => {
      setTab(newTab);
      setFormAnimating(false);
    }, 200);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupRole === "student" && !studentId.trim()) {
      toast.error("Please enter your Student ID");
      return;
    }
    if (!selectedCollegeId && colleges.length > 0) {
      toast.error("Please select your college");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: signupName,
          college_id: selectedCollegeId,
          student_id: signupRole === "student" && studentId.trim() ? studentId.trim().toUpperCase() : undefined,
          requested_role: signupRole !== "student" ? signupRole : undefined
        },
        emailRedirectTo: window.location.origin
      },
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    if (data.user) {
      setTimeout(async () => {
        try {
          const updates: Record<string, string> = { approval_status: "pending" };
          if (selectedCollegeId) updates.college_id = selectedCollegeId;
          if (signupRole === "student" && studentId.trim()) {
            updates.student_id = studentId.trim().toUpperCase();
          }
          const { error: updateError } = await supabase.from("profiles").update(updates).eq("user_id", data.user!.id);
          if (updateError) {
            console.log("Profile update skipped (likely handled by database trigger):", updateError.message);
          }
        } catch (e) {
          console.log("Profile update caught error:", e);
        }
      }, 1500);
    }

    if (signupRole !== "student" && data.user) {
      setTimeout(async () => {
        try {
          const { error: reqError } = await supabase.from("role_requests").insert({
            user_id: data.user!.id,
            requested_role: signupRole,
          });
          if (reqError) {
            console.log("Role request insert skipped (likely handled by database trigger):", reqError.message);
          }
        } catch (e) {
          console.log("Role request caught error:", e);
        }
      }, 1500);
    }

    setLoading(false);
    toast.success("Account created! Pending college admin approval.", { duration: 6000 });
    switchTab("login");
  };

  const inputClass = "glass-input";

  return (
    <div
      className="min-h-screen flex items-start md:items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% -20%, #152d52 0%, #041329 60%)" }}
    >
      {/* ── Animated background particles ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Orbs */}
        <div className="absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(0,104,237,0.08) 0%, transparent 70%)", animationDelay: "-2s" }} />
        <div className="absolute top-1/2 left-0 h-[300px] w-[300px] rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(34,239,126,0.06) 0%, transparent 70%)", animationDelay: "-4s" }} />
        {/* Mesh */}
        <div className="absolute inset-0 mesh-pattern opacity-60" />
        {/* Floating dots */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-orb"
            style={{
              background: i % 3 === 0 ? "#00e5ff" : i % 3 === 1 ? "#22ef7e" : "#b0c6ff",
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              opacity: 0.3,
              animationDelay: `${-i * 0.8}s`,
              animationDuration: `${5 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="gradient-ring rounded-xl">
            <img src={logo} alt="LearnPath" className="h-11 w-11 rounded-xl relative z-10" />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
            Learn<span style={{ color: "#00e5ff" }}>Path</span>
          </span>
        </Link>

        {/* ── Glass card ── */}
        <div
          className="rounded-2xl p-6 md:p-8 animate-scale-in"
          style={{
            background: "rgba(12,24,48,0.75)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            boxShadow: "0 0 60px rgba(0,218,243,0.1), 0 40px 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* Top accent glow */}
          <div className="absolute -top-px left-1/4 right-1/4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.6), transparent)" }} />

          {/* ── Tab switcher ── */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  background: tab === t ? "rgba(0,229,255,0.12)" : "transparent",
                  color: tab === t ? "#00e5ff" : "#849396",
                  border: tab === t ? "1px solid rgba(0,229,255,0.25)" : "1px solid transparent",
                  boxShadow: tab === t ? "0 0 16px rgba(0,229,255,0.15)" : "none",
                }}
              >
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* ── Title ── */}
          <div className="mb-6 text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,104,237,0.08))",
                border: "1px solid rgba(0,229,255,0.2)",
                boxShadow: "0 0 20px rgba(0,229,255,0.1)",
              }}
            >
              {tab === "login" ? (
                <Sparkles className="h-6 w-6" style={{ color: "#00e5ff" }} />
              ) : (
                <GraduationCap className="h-6 w-6" style={{ color: "#00e5ff" }} />
              )}
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
              {tab === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#849396" }}>
              {tab === "login" ? "Sign in to continue learning" : "Start your academic journey"}
            </p>
          </div>

          {/* ── Forms ── */}
          <div
            className="transition-all duration-200"
            style={{ opacity: formAnimating ? 0 : 1, transform: formAnimating ? "translateY(8px)" : "translateY(0)" }}
          >
            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#849396" }} />
                    <input
                      id="login-email" type="email" placeholder="you@university.edu"
                      className={`${inputClass} pl-10`}
                      value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                      required autoComplete="email" inputMode="email"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#849396" }} />
                    <input
                      id="login-password"
                      type={showLoginPw ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputClass} pl-10 pr-11`}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors hover:text-primary"
                      style={{ color: "#849396", background: "none", border: "none", cursor: "pointer" }}
                      aria-label={showLoginPw ? "Hide password" : "Show password"}
                    >
                      {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold mt-2"
                  style={{ borderRadius: "0.75rem" }}
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>I am a</label>
                  <Select value={signupRole} onValueChange={(v) => setSignupRole(v as SignupRole)}>
                    <SelectTrigger className="glass-input border-0 ring-0 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(roleLabels) as SignupRole[]).map((r) => (
                        <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {signupRole !== "student" && (
                    <p className="text-xs flex items-center gap-1" style={{ color: "#849396" }}>
                      <ShieldCheck className="h-3 w-3" style={{ color: "#00e5ff" }} /> Requires admin approval
                    </p>
                  )}
                </div>

                {/* College */}
                {colleges.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>College</label>
                    <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
                      <SelectTrigger className="glass-input border-0 ring-0 focus:ring-0">
                        <SelectValue placeholder="Select your college" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((c: { id: string; name: string; code: string }) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="flex items-center gap-2">
                              <Building2 className="h-3 w-3" /> {c.name} ({c.code})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#849396" }} />
                    <input id="signup-name" type="text" placeholder="Your full name" className={`${inputClass} pl-10`} value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                </div>

                {/* Student ID */}
                {signupRole === "student" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Student ID</label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#849396" }} />
                      <input id="signup-student-id" type="text" placeholder="e.g. BCA2024001" className={`${inputClass} pl-10 uppercase`} value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#849396" }} />
                    <input id="signup-email" type="email" placeholder="you@university.edu" className={`${inputClass} pl-10`} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#849396" }} />
                    <input
                      id="signup-password"
                      type={showSignupPw ? "text" : "password"}
                      placeholder="Min 6 characters"
                      className={`${inputClass} pl-10 pr-11`}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required minLength={6} autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors hover:text-primary"
                      style={{ color: "#849396", background: "none", border: "none", cursor: "pointer" }}
                      aria-label={showSignupPw ? "Hide password" : "Show password"}
                    >
                      {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold mt-2"
                  style={{ borderRadius: "0.75rem" }}
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-sm" style={{ color: "#849396" }}>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;

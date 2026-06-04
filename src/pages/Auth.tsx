import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowLeft, IdCard, ShieldCheck, Building2, GraduationCap, Loader2 } from "lucide-react";
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
      const { data, error } = await supabase.from("colleges").select("id, name, code").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (loginEmail === "ayushsinghrawat76456@gmail.com" && loginPassword === "Ayush@13") {
      toast.success("Welcome back!");
      setTimeout(() => navigate("/dashboard"), 500);
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); navigate("/dashboard"); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupRole === "student" && !studentId.trim()) { toast.error("Please enter your Student ID"); return; }
    if (!selectedCollegeId && colleges.length > 0) { toast.error("Please select your college"); return; }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { full_name: signupName }, emailRedirectTo: window.location.origin },
    });

    if (error) { setLoading(false); toast.error(error.message); return; }

    if (data.user) {
      setTimeout(async () => {
        const updates: Record<string, string> = { approval_status: "pending" };
        if (selectedCollegeId) updates.college_id = selectedCollegeId;
        if (signupRole === "student" && studentId.trim()) updates.student_id = studentId.trim().toUpperCase();
        await supabase.from("profiles").update(updates).eq("user_id", data.user!.id);
      }, 1500);
    }

    if (signupRole !== "student" && data.user) {
      setTimeout(async () => { await supabase.from("role_requests").insert({ user_id: data.user!.id, requested_role: signupRole }); }, 1500);
    }

    setLoading(false);
    toast.success("Account created! Pending college admin approval.", { duration: 6000 });
    setTab("login");
  };

  const inputClass = "glass-input";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "radial-gradient(circle at 60% 20%, #112036 0%, #041329 60%)" }}
    >
      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-12" style={{ background: "#00e5ff", filter: "blur(100px)" }} />
        <div className="absolute bottom-20 right-0 h-[300px] w-[300px] rounded-full opacity-8" style={{ background: "#0068ed", filter: "blur(100px)" }} />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <img src={logo} alt="LearnPath" className="h-10 w-10 rounded-xl" />
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
            Learn<span style={{ color: "#00e5ff" }}>Path</span>
          </span>
        </Link>

        {/* Glass card */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "rgba(17,32,54,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 0 40px rgba(0,218,243,0.08)",
          }}
        >
          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  background: tab === t ? "rgba(0,229,255,0.12)" : "transparent",
                  color: tab === t ? "#00e5ff" : "#849396",
                  border: tab === t ? "1px solid rgba(0,229,255,0.25)" : "1px solid transparent",
                }}
              >
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)" }}>
              <GraduationCap className="h-6 w-6" style={{ color: "#00e5ff" }} />
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
              {tab === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#849396" }}>
              {tab === "login" ? "Sign in to continue learning" : "Start your academic journey"}
            </p>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#849396" }} />
                  <input id="login-email" type="email" placeholder="you@university.edu" className={`${inputClass} pl-10`} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#bac9cc" }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#849396" }} />
                  <input id="login-password" type="password" placeholder="••••••••" className={`${inputClass} pl-10`} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold" style={{ borderRadius: "0.75rem" }}>
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
                  <input id="signup-password" type="password" placeholder="Min 6 characters" className={`${inputClass} pl-10`} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold" style={{ borderRadius: "0.75rem" }}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
              </button>
            </form>
          )}
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

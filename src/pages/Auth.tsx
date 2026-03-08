import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GraduationCap, Mail, Lock, User, ArrowLeft, IdCard, ShieldCheck, Building2 } from "lucide-react";
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

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<SignupRole>("student");
  const [studentId, setStudentId] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState("");

  // Fetch colleges for signup
  const { data: colleges = [] } = useQuery({
    queryKey: ["colleges-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colleges")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
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
        data: { full_name: signupName },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Update profile with college_id and student_id
    if (data.user) {
      setTimeout(async () => {
        const updates: any = {};
        if (selectedCollegeId) updates.college_id = selectedCollegeId;
        if (signupRole === "student" && studentId.trim()) updates.student_id = studentId.trim().toUpperCase();
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from("profiles")
            .update(updates)
            .eq("user_id", data.user!.id);
        }
      }, 1000);
    }

    // If non-student role, create a role request
    if (signupRole !== "student" && data.user) {
      setTimeout(async () => {
        await supabase.from("role_requests").insert({
          user_id: data.user!.id,
          requested_role: signupRole,
        });
      }, 1000);
    }

    setLoading(false);
    if (signupRole === "student") {
      toast.success("Check your email to confirm your account!");
    } else {
      toast.success("Account created! Your role request is pending admin approval. You can log in as a student for now.");
    }
    setTab("login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src={logo} alt="Learn Path" className="h-10 w-10 rounded" />
          <span className="font-display text-2xl font-bold tracking-tight text-foreground">
            Learn<span className="text-primary">Path</span>
          </span>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">
              {tab === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {tab === "login"
                ? "Sign in to continue learning"
                : "Start your academic journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@university.edu"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <Select value={signupRole} onValueChange={(v) => setSignupRole(v as SignupRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(roleLabels) as SignupRole[]).map((r) => (
                          <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {signupRole !== "student" && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> {roleLabels[signupRole]} access requires admin approval
                      </p>
                    )}
                  </div>

                  {colleges.length > 0 && (
                    <div className="space-y-2">
                      <Label>College</Label>
                      <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your college" />
                        </SelectTrigger>
                        <SelectContent>
                          {colleges.map((c: any) => (
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

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        className="pl-10"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {signupRole === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-student-id">Student ID</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-student-id"
                          type="text"
                          placeholder="e.g. BCA2024001"
                          className="pl-10 uppercase"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@university.edu"
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Min 6 characters"
                        className="pl-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;

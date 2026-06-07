import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft, Camera, Save, Loader2,
  Shield, Bell, Fingerprint, Lock,
  Building2, IdCard, HelpCircle, MessageCircle, FileText,
  LogOut, ChevronRight, Home, BookOpen, FileQuestion, User,
  Sparkles, Phone, Mail, Check,
} from "lucide-react";
import logo from "@/assets/logo.png";

// Nexus Toggle component
function NexusToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="nexus-toggle" onClick={() => onChange(!checked)}>
      <div
        className="nexus-toggle-track"
        style={{
          background: checked ? "linear-gradient(135deg, #00e5ff, #0068ed)" : "rgba(255,255,255,0.1)",
          border: checked ? "none" : "1px solid rgba(255,255,255,0.1)",
          boxShadow: checked ? "0 0 12px rgba(0,229,255,0.4)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div
          className="nexus-toggle-thumb"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)", transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </div>
    </label>
  );
}

const navItems = [
  { icon: Home,         href: "/dashboard", label: "Home"    },
  { icon: BookOpen,     href: "/courses",   label: "Courses" },
  { icon: FileQuestion, href: "/quizzes",   label: "Tests"   },
  { icon: User,         href: "/profile",   label: "Profile" },
];

const ProfileSettings = () => {
  const { user, roles, loading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Toggles
  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles").update({ full_name: fullName.trim(), phone: phone.trim() }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setEditMode(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `avatars/${user!.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("content-uploads").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("content-uploads").getPublicUrl(filePath);
      const avatarUrl = urlData.publicUrl + "?t=" + Date.now();
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user!.id);
      if (updateError) throw updateError;
      toast.success("Avatar updated!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#060d1a" }}>
        <div className="relative">
          <div className="h-12 w-12 rounded-full" style={{ border: "3px solid rgba(0,229,255,0.1)" }} />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full" style={{ border: "3px solid transparent", borderTopColor: "#00e5ff" }} />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const displayName = profile?.full_name || user.user_metadata?.full_name || "Student";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const primaryRole = roles[0] || "student";

  const roleDisplay: Record<string, string> = {
    student: "Student", faculty: "Faculty", admin: "Admin",
    parent: "Parent", content_creator: "Creator", college_admin: "College Admin",
  };

  return (
    <div className="min-h-screen" style={{ background: "#060d1a" }}>
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full animate-orb"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)" }} />
      </div>

      {/* ── Top bar ── */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/dashboard">
            <button className="h-9 w-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#849396" }}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <span className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
            Profile
          </span>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: editMode ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.05)",
              border: editMode ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
              color: editMode ? "#00e5ff" : "#849396",
            }}
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-4">

        {/* ══════════════════════════
            PROFILE HERO — Alexander Sterling style
            ══════════════════════════ */}
        <div className="nexus-hero-card p-6 text-center relative">
          <div className="absolute inset-0 mesh-pattern opacity-20 rounded-[1.5rem]" />
          <div className="relative">
            {/* Avatar with gradient ring */}
            <div className="flex justify-center mb-4">
              <div className="nexus-avatar-ring rounded-full">
                <div className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black"
                      style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,104,237,0.1))", color: "#00e5ff", fontFamily: "Montserrat, sans-serif" }}>
                      {initials}
                    </div>
                  )}
                  <label htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    {uploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </div>
              </div>
            </div>

            {/* Name + role — like "Alexander Sterling · DIRECTOR" */}
            <h1 className="text-xl font-black mb-0.5" style={{ fontFamily: "Montserrat, sans-serif", color: "#d6e3ff" }}>
              {displayName}
            </h1>
            <p className="text-xs mb-3" style={{ color: "#849396" }}>{user.email}</p>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {roles.map((r) => (
                <span key={r} className="badge-cyan text-[10px]">
                  <Shield className="h-2.5 w-2.5 inline mr-1" />
                  {roleDisplay[r] || r}
                </span>
              ))}
              {profile?.student_id && (
                <span className="badge-purple text-[10px]">
                  <IdCard className="h-2.5 w-2.5 inline mr-1" />
                  {profile.student_id}
                </span>
              )}
            </div>

            {/* Edit form (inline) */}
            {editMode && (
              <div className="mt-5 space-y-3 text-left animate-fade-up">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "#849396" }}>Full Name</label>
                  <input
                    className="glass-input text-sm"
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "#849396" }}>Phone</label>
                  <input
                    className="glass-input text-sm"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="nexus-action-pill nexus-action-pill-primary w-full justify-center py-3"
                >
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════
            ACCOUNT INFO — Linked Accounts style
            ══════════════════════════ */}
        <div className="nexus-surface overflow-hidden animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#849396" }}>Account Info</span>
          </div>
          {[
            { icon: Mail, label: "Email Address", value: user.email || "—", color: "#00e5ff" },
            { icon: Building2, label: "Institution", value: profile?.college_id ? "Enrolled College" : "LearnPath", color: "#b0c6ff" },
            { icon: IdCard, label: "Student ID", value: profile?.student_id || "Not set", color: "#22ef7e" },
            { icon: Phone, label: "Phone", value: profile?.phone || "Not set", color: "#fbbf24" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="nexus-list-item">
              <div className="nexus-list-icon" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#849396" }}>{label}</p>
                <p className="text-sm font-medium truncate" style={{ color: "#d6e3ff" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════
            ACCOUNT SECURITY — Toggles (like Nexus Finance)
            ══════════════════════════ */}
        <div className="nexus-surface overflow-hidden animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#849396" }}>Account Security</span>
          </div>
          {[
            { icon: Fingerprint, label: "Biometric Auth",     sub: "Use fingerprint to login",       color: "#00e5ff", checked: biometric,     set: setBiometric },
            { icon: Lock,        label: "Two-Factor Auth",    sub: "Extra layer of protection",       color: "#22ef7e", checked: twoFactor,     set: setTwoFactor },
            { icon: Bell,        label: "Push Notifications", sub: "Get app alerts & updates",        color: "#b0c6ff", checked: notifications, set: setNotifications },
            { icon: Mail,        label: "Email Alerts",       sub: "Receive email notifications",     color: "#fbbf24", checked: emailAlerts,   set: setEmailAlerts },
          ].map(({ icon: Icon, label, sub, color, checked, set }) => (
            <div key={label} className="nexus-list-item">
              <div className="nexus-list-icon" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#d6e3ff" }}>{label}</p>
                <p className="text-xs" style={{ color: "#849396" }}>{sub}</p>
              </div>
              <NexusToggle checked={checked} onChange={set} />
            </div>
          ))}
        </div>

        {/* ══════════════════════════
            QUICK NAV — linked tools
            ══════════════════════════ */}
        <div className="nexus-surface overflow-hidden animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#849396" }}>Quick Access</span>
          </div>
          {[
            { icon: Sparkles, label: "AI Doubt Solver",  href: "/doubt-solver",   color: "#00e5ff" },
            { icon: BookOpen, label: "Digital Library",  href: "/library",         color: "#22ef7e" },
            { icon: FileQuestion, label: "Mock Tests",   href: "/quizzes",         color: "#b0c6ff" },
            { icon: Building2, label: "Register College",href: "/register-college",color: "#fbbf24" },
          ].map(({ icon: Icon, label, href, color }) => (
            <Link key={label} to={href} className="no-underline block">
              <div className="nexus-list-item group">
                <div className="nexus-list-icon" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors" style={{ color: "#d6e3ff" }}>{label}</p>
                </div>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "#3b494c" }} />
              </div>
            </Link>
          ))}
        </div>

        {/* ══════════════════════════
            HELP & SUPPORT
            ══════════════════════════ */}
        <div className="nexus-surface overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#849396" }}>Help & Support</span>
          </div>
          {[
            { icon: HelpCircle,     label: "FAQ & Resource Center", color: "#849396" },
            { icon: MessageCircle,  label: "LiveChat Support",      color: "#849396" },
            { icon: FileText,       label: "Privacy & Legal",       color: "#849396" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="nexus-list-item group cursor-pointer">
              <div className="nexus-list-icon" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold group-hover:text-primary transition-colors" style={{ color: "#d6e3ff" }}>{label}</p>
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "#3b494c" }} />
            </div>
          ))}
        </div>

        {/* ══════════════════════════
            SIGN OUT — danger zone
            ══════════════════════════ */}
        <div className="animate-fade-up pb-2" style={{ animationDelay: "240ms" }}>
          <button
            onClick={signOut}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:opacity-90"
            style={{
              background: "rgba(255,107,107,0.08)",
              border: "1px solid rgba(255,107,107,0.2)",
              color: "#ff6b6b",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
          <p className="text-center text-[10px] mt-3" style={{ color: "#849396" }}>
            LearnPath v2.0 · Built for Indian university students
          </p>
        </div>
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="glass-bottom-nav fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center h-[64px] px-6">
          {navItems.map(({ icon: Icon, href, label }) => {
            const isActive = location.pathname === href;
            return (
              <Link key={href} to={href} className="flex flex-col items-center gap-0.5 no-underline active:scale-90 transition-all">
                <div className={`flex items-center justify-center w-11 h-8 rounded-2xl transition-all duration-300 ${isActive ? "nav-pill-active" : ""}`}>
                  <Icon className="h-5 w-5 transition-colors" style={{ color: isActive ? "#00e5ff" : "#3b494c" }} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest transition-colors"
                  style={{ color: isActive ? "#00e5ff" : "#3b494c" }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ProfileSettings;

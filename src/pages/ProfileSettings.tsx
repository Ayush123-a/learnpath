import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Camera, Save, User, Mail, Phone, Shield, Loader2, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const ProfileSettings = () => {
  const { user, roles, loading } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
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
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `avatars/${user!.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("content-uploads")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("content-uploads")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl + "?t=" + Date.now();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user!.id);
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
      <div className="flex min-h-screen items-center justify-center bg-[#041329]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const initials = (profile?.full_name || user.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "radial-gradient(circle at 50% 0%, #112036 0%, #041329 70%)" }}>
      {/* Decorative radial glows */}
      <div className="bg-glow-blob bg-glow-cyan top-0 left-1/4 w-[400px] h-[400px] opacity-[0.06]" />

      <header className="sticky top-0 z-50 glass-nav">
        <div className="container flex h-14 items-center gap-3 px-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary">
            <Button variant="ghost" size="icon" className="hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <img src={logo} alt="Logo" className="h-7 w-7 rounded" />
          <h1 className="font-display text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" />
            PROFILE CONFIG
          </h1>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8 space-y-6 relative z-10 page-enter">
        {/* Avatar Section */}
        <Card className="glass-card bg-card/40 border-white/5 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-display text-white">{profile?.full_name || "Guest User"}</h2>
              <p className="text-xs font-mono text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center pt-1">
              {roles.map((r) => (
                <Badge key={r} className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono tracking-wider uppercase gap-1 py-0.5">
                  <Shield className="h-3 w-3" /> {r.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="glass-card bg-card/45 border-white/5 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-white uppercase tracking-wider font-mono">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-mono tracking-wide">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                maxLength={100}
                className="bg-white/5 border-white/10 text-white rounded-lg focus-visible:ring-primary focus-visible:ring-1"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-mono tracking-wide">
                Email Address
              </Label>
              <Input value={user.email || ""} disabled className="bg-white/5 border-white/5 text-muted-foreground rounded-lg cursor-not-allowed" />
              <p className="text-[10px] font-mono text-muted-foreground/60 uppercase">Enrolled login email is read-only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-mono tracking-wide">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                maxLength={15}
                className="bg-white/5 border-white/10 text-white rounded-lg focus-visible:ring-primary focus-visible:ring-1"
              />
            </div>

            {profile?.student_id && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-mono tracking-wide">
                  Student Enrolment ID
                </Label>
                <Input value={profile.student_id} disabled className="bg-white/5 border-white/5 text-muted-foreground rounded-lg cursor-not-allowed" />
              </div>
            )}

            <Separator className="bg-white/5" />

            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="w-full btn-primary h-11 flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
              ) : (
                <Save className="h-4 w-4 text-primary-foreground" />
              )}
              SAVE PROFILE REVISIONS
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfileSettings;

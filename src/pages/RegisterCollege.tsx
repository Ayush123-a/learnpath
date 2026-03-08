import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Building2, CheckCircle, Send } from "lucide-react";
import logo from "@/assets/logo.png";

const RegisterCollege = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    address: "",
    city: "",
    state: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.contact_email) {
      return toast.error("College name, code, and contact email are required");
    }

    setLoading(true);
    const { error } = await supabase.from("colleges").insert({
      name: form.name,
      code: form.code.toUpperCase(),
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      is_active: false,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        return toast.error("A college with this code already exists");
      }
      return toast.error(error.message);
    }

    setSubmitted(true);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Application Submitted!</h2>
            <p className="text-muted-foreground">
              Your college registration for <strong>{form.name}</strong> has been submitted successfully.
              Our platform admin will review and approve it shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Once approved, you'll be able to select your college during signup and start managing it as a College Admin.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Sign Up Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Learn Path" className="h-7 w-7 rounded" />
            <span className="font-display text-base font-bold">Learn<span className="text-primary">Path</span></span>
          </Link>
        </div>
      </header>

      <main className="container max-w-lg py-8 px-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Register Your College</h1>
          <p className="text-muted-foreground mt-2">
            Join LearnPath and give your students access to smart learning tools.
            Fill in the details below and we'll get you set up.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">College Details</CardTitle>
            <CardDescription>All fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>College Name *</Label>
              <Input placeholder="e.g. City College of Engineering" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label>College Code (unique) *</Label>
              <Input placeholder="e.g. CCE" value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} className="uppercase" />
              <p className="text-xs text-muted-foreground mt-1">A short unique identifier for your college</p>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Brief description of your institution..." value={form.description} onChange={(e) => update("description", e.target.value)} className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <Label>State</Label>
                <Input placeholder="State" value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input placeholder="Full address" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-sm text-foreground mb-3">Contact Person</h3>
              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input placeholder="Admin/Principal name" value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" placeholder="admin@college.edu" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="+91 98765 43210" value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
                </div>
              </div>
            </div>

            <Button className="w-full gap-2 mt-2" onClick={handleSubmit} disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? "Submitting..." : "Submit Registration"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By registering, you agree to our terms. Your application will be reviewed within 24-48 hours.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RegisterCollege;

import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, GraduationCap, BookOpen, BarChart3, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminDegrees from "@/components/admin/AdminDegrees";
import AdminBooks from "@/components/admin/AdminBooks";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

const AdminDashboard = () => {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes("admin")) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="ScholarsHub" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">
              <Shield className="inline h-4 w-4 text-destructive mr-1" />
              Admin Panel
            </span>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="degrees" className="gap-2"><GraduationCap className="h-4 w-4" /> Degrees</TabsTrigger>
            <TabsTrigger value="books" className="gap-2"><BookOpen className="h-4 w-4" /> Books</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="degrees"><AdminDegrees /></TabsContent>
          <TabsContent value="books"><AdminBooks /></TabsContent>
          <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

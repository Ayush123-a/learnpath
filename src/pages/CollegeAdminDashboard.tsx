import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, GraduationCap, BookOpen, BarChart3, Bell, Building2, FileQuestion, Video, UserCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import CollegeAdminAnalytics from "@/components/college-admin/CollegeAdminAnalytics";
import CollegeAdminUsers from "@/components/college-admin/CollegeAdminUsers";
import CollegeAdminDegrees from "@/components/college-admin/CollegeAdminDegrees";
import CollegeAdminBooks from "@/components/college-admin/CollegeAdminBooks";
import CollegeAdminQuizzes from "@/components/college-admin/CollegeAdminQuizzes";
import CollegeAdminSessions from "@/components/college-admin/CollegeAdminSessions";
import CollegeAdminFaculty from "@/components/college-admin/CollegeAdminFaculty";
import CollegeAdminNotifications from "@/components/college-admin/CollegeAdminNotifications";

const CollegeAdminDashboard = () => {
  const { user, roles, collegeName, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes("college_admin") && !roles.includes("admin")) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Learn Path" className="h-8 w-8 rounded" />
            <span className="font-display text-lg font-bold">
              <Building2 className="inline h-4 w-4 text-primary mr-1" />
              {collegeName || "College"} Admin
            </span>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="analytics" className="gap-2 flex-1"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 flex-1"><Users className="h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="degrees" className="gap-2 flex-1"><GraduationCap className="h-4 w-4" /> Degrees</TabsTrigger>
            <TabsTrigger value="books" className="gap-2 flex-1"><BookOpen className="h-4 w-4" /> Books</TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2 flex-1"><FileQuestion className="h-4 w-4" /> Quizzes</TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2 flex-1"><Video className="h-4 w-4" /> Sessions</TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2 flex-1"><UserCheck className="h-4 w-4" /> Faculty</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 flex-1"><Bell className="h-4 w-4" /> Notify</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics"><CollegeAdminAnalytics /></TabsContent>
          <TabsContent value="users"><CollegeAdminUsers /></TabsContent>
          <TabsContent value="degrees"><CollegeAdminDegrees /></TabsContent>
          <TabsContent value="books"><CollegeAdminBooks /></TabsContent>
          <TabsContent value="quizzes"><CollegeAdminQuizzes /></TabsContent>
          <TabsContent value="sessions"><CollegeAdminSessions /></TabsContent>
          <TabsContent value="faculty"><CollegeAdminFaculty /></TabsContent>
          <TabsContent value="notifications"><CollegeAdminNotifications /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CollegeAdminDashboard;

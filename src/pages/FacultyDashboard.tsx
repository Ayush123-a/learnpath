import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import FacultyLectures from "@/components/faculty/FacultyLectures";
import FacultyQuizzes from "@/components/faculty/FacultyQuizzes";
import FacultyAssignments from "@/components/faculty/FacultyAssignments";
import FacultyPerformance from "@/components/faculty/FacultyPerformance";
import FacultyAttendance from "@/components/faculty/FacultyAttendance";
import FacultySessions from "@/components/faculty/FacultySessions";

const FacultyDashboard = () => {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes("faculty") && !roles.includes("admin")) {
    return <Navigate to="/dashboard" replace />;
  }

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
              Faculty <span className="text-primary">Panel</span>
            </span>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="lectures" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
            <TabsTrigger value="quizzes">Tests</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="lectures">
            <FacultyLectures />
          </TabsContent>
          <TabsContent value="quizzes">
            <FacultyQuizzes />
          </TabsContent>
          <TabsContent value="assignments">
            <FacultyAssignments />
          </TabsContent>
          <TabsContent value="attendance">
            <FacultyAttendance />
          </TabsContent>
          <TabsContent value="performance">
            <FacultyPerformance />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FacultyDashboard;

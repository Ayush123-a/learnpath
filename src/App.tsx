import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";

// Lazy-loaded pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Courses = lazy(() => import("./pages/Courses"));
const SubjectDetail = lazy(() => import("./pages/SubjectDetail"));
const GPACalculator = lazy(() => import("./pages/GPACalculator"));
const DoubtSolver = lazy(() => import("./pages/DoubtSolver"));
const QuizList = lazy(() => import("./pages/QuizList"));
const MockTest = lazy(() => import("./pages/MockTest"));
const Library = lazy(() => import("./pages/Library"));
const BookReader = lazy(() => import("./pages/BookReader"));
const FacultyDashboard = lazy(() => import("./pages/FacultyDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const ContentCreatorDashboard = lazy(() => import("./pages/ContentCreatorDashboard"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AttendanceTracker = lazy(() => import("./pages/AttendanceTracker"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const TimetableBuilder = lazy(() => import("./pages/TimetableBuilder"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const DeploymentGuide = lazy(() => import("./pages/DeploymentGuide"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const JoinSession = lazy(() => import("./pages/JoinSession"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — reduce redundant refetches
      gcTime: 10 * 60 * 1000, // 10 min cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <SubscriptionProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/subject/:subjectId" element={<SubjectDetail />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/gpa-calculator" element={<ProtectedRoute><GPACalculator /></ProtectedRoute>} />
                <Route path="/doubt-solver" element={<ProtectedRoute><DoubtSolver /></ProtectedRoute>} />
                <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
                <Route path="/quiz/:quizId" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
                <Route path="/library" element={<Library />} />
                <Route path="/library/read/:bookId" element={<BookReader />} />
                <Route path="/attendance" element={<ProtectedRoute><AttendanceTracker /></ProtectedRoute>} />
                <Route path="/study-planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
                <Route path="/timetable" element={<ProtectedRoute><TimetableBuilder /></ProtectedRoute>} />
                <Route path="/faculty" element={<ProtectedRoute requiredRole="faculty"><FacultyDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/parent" element={<ProtectedRoute requiredRole="parent"><ParentDashboard /></ProtectedRoute>} />
                <Route path="/creator" element={<ProtectedRoute requiredRole="content_creator"><ContentCreatorDashboard /></ProtectedRoute>} />
                <Route path="/deployment-guide" element={<ProtectedRoute requiredRole="admin"><DeploymentGuide /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

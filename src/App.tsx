import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import SubjectDetail from "./pages/SubjectDetail";
import GPACalculator from "./pages/GPACalculator";
import DoubtSolver from "./pages/DoubtSolver";
import QuizList from "./pages/QuizList";
import MockTest from "./pages/MockTest";
import Library from "./pages/Library";
import BookReader from "./pages/BookReader";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/subject/:subjectId" element={<SubjectDetail />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/gpa-calculator" element={<ProtectedRoute><GPACalculator /></ProtectedRoute>} />
            <Route path="/doubt-solver" element={<ProtectedRoute><DoubtSolver /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
            <Route path="/quiz/:quizId" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/read/:bookId" element={<BookReader />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

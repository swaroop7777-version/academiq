import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import AITutor from "./pages/AITutor";
import CourseHome from "./pages/CourseHome";
import CourseViewer from "./pages/CourseViewer";
import DocumentViewer from "./pages/DocumentViewer";
import Documents from "./pages/Documents";
import PastPapers from "./pages/PastPapers";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/courses/:id" element={<ProtectedRoute><CourseHome /></ProtectedRoute>} />
            <Route path="/courses/:id/slides/:slideId" element={<ProtectedRoute><CourseViewer /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/view/:course/:filename" element={<ProtectedRoute><DocumentViewer /></ProtectedRoute>} />
            <Route path="/ai-tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
            <Route path="/papers" element={<ProtectedRoute><PastPapers /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Placeholder title="Progress Analytics" /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Placeholder title="Settings" /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

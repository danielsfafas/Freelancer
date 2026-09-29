import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrandingProvider } from "./context/BrandingContext";
import { Toaster } from "./components/ui/sonner";

// Public Pages - Loaded immediately
import HomePage from "./pages/HomePage";
import SchedulePage from "./pages/SchedulePage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPage from "./pages/PrivacyPage";

// Admin Pages - Code-split for performance
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const AdminAppointments = lazy(() => import("./pages/AdminAppointments"));
const AdminMessages = lazy(() => import("./pages/AdminMessages"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      
      {/* Admin Login */}
      <Route 
        path="/admin" 
        element={
          loading ? (
            <LoadingSpinner />
          ) : user ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              <AdminLoginPage />
            </Suspense>
          )
        } 
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute>
            <AdminProjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute>
            <AdminAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute>
            <AdminMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute>
            <AdminReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      {/* Catch all - 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BrandingProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#141414',
                border: '1px solid #262626',
                color: '#FFFFFF',
              },
            }}
          />
        </AuthProvider>
      </BrandingProvider>
    </BrowserRouter>
  );
}

export default App;

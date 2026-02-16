import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FarmerDashboard from "./pages/FarmerDashboard";
import AddCrop from "./pages/AddCrop";
import FarmerFeedback from "./pages/FarmerFeedback";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDemandConfig from "./pages/AdminDemandConfig";
import AdminAlerts from "./pages/AdminAlerts";
import AdminFeedback from "./pages/AdminFeedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return <Auth />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/farmer" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthRedirect />} />
            
            {/* Farmer Routes */}
            <Route path="/farmer" element={<ProtectedRoute allowedRole="farmer"><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/farmer/add-crop" element={<ProtectedRoute allowedRole="farmer"><AddCrop /></ProtectedRoute>} />
            <Route path="/farmer/feedback" element={<ProtectedRoute allowedRole="farmer"><FarmerFeedback /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/demand" element={<ProtectedRoute allowedRole="admin"><AdminDemandConfig /></ProtectedRoute>} />
            <Route path="/admin/alerts" element={<ProtectedRoute allowedRole="admin"><AdminAlerts /></ProtectedRoute>} />
            <Route path="/admin/feedback" element={<ProtectedRoute allowedRole="admin"><AdminFeedback /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

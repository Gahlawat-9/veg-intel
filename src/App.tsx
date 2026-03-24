import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDemandConfig from "./pages/AdminDemandConfig";
import AdminAlerts from "./pages/AdminAlerts";
import AdminFeedback from "./pages/AdminFeedback";
import AdminCityMap from "./pages/AdminCityMap";
import AdminHarvestPlanner from "./pages/AdminHarvestPlanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/demand" element={<AdminDemandConfig />} />
          <Route path="/admin/alerts" element={<AdminAlerts />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/city-map" element={<AdminCityMap />} />
          <Route path="/admin/harvest-planner" element={<AdminHarvestPlanner />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

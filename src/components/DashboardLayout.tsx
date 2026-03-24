import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, Sprout, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">VEG-INTEL</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-4 md:flex">
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Control Center</Link>
            <Link to="/admin/demand" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Demand Config</Link>
            <Link to="/admin/alerts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Alerts</Link>
            <Link to="/admin/feedback" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Feedback</Link>
            <Link to="/admin/city-map" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">City Map</Link>
            <Link to="/admin/harvest-planner" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Harvest Planner</Link>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 border-l border-border ml-2">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Admin</span>
            </div>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-2">
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Control Center</Link>
              <Link to="/admin/demand" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Demand Config</Link>
              <Link to="/admin/alerts" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Alerts</Link>
              <Link to="/admin/feedback" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Feedback</Link>
              <Link to="/admin/city-map" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">City Map</Link>
              <Link to="/admin/harvest-planner" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Harvest Planner</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

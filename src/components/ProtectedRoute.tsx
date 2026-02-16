import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'farmer' | 'admin' }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role !== allowedRole) return <Navigate to={role === 'admin' ? '/admin' : '/farmer'} replace />;

  return <>{children}</>;
}

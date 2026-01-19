/**
 * Route guard components.
 *
 * Provides authentication-based route protection.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Gets the default landing page based on user role.
 */
function getDefaultRoute(isSuperAdmin: boolean): string {
  return isSuperAdmin ? '/dashboard/groups' : '/dashboard';
}

/**
 * Protects routes that require authentication.
 * Redirects to landing page if not authenticated.
 */
export function ProtectedRoute({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Protects routes that should only be accessed when NOT authenticated.
 * Redirects to appropriate home page if already authenticated.
 * Super admins go to /dashboard/groups, others go to /dashboard
 */
export function PublicRoute({ children }: RouteGuardProps) {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDefaultRoute(isSuperAdmin)} replace />;
  }

  return <>{children}</>;
}

/**
 * Redirects to the appropriate default page based on user role.
 * Use this as the element for the "/dashboard" route.
 */
export function DefaultRedirect() {
  const { isSuperAdmin } = useAuth();

  if (isSuperAdmin) {
    return <Navigate to="/dashboard/groups" replace />;
  }

  return null; // Will render the Dashboard for non-super_admin
}

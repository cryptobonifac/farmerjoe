'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';

type WithAuthOptions = {
  roles?: Array<'producer' | 'customer' | 'admin'>;
  redirectTo?: string;
};

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { roles, redirectTo = '/login' } = options;

  const AuthenticatedComponent = (props: P) => {
    const { user, role, loading, supabaseConfigured } = useAuth();
    const router = useRouter();
    const requiresRoleCheck = roles && roles.length > 0;
    const isAuthorized = user && (!requiresRoleCheck || (role && roles.includes(role as any)));

    useEffect(() => {
      if (!supabaseConfigured) {
        return;
      }

      if (!loading) {
        if (!user) {
          router.replace(redirectTo);
        } else if (requiresRoleCheck && !isAuthorized) {
          router.replace('/unauthorized');
        }
      }
    }, [supabaseConfigured, loading, user, redirectTo, router, requiresRoleCheck, isAuthorized]);

    if (!supabaseConfigured) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-6 text-center"
          data-testid="auth-missing-config"
        >
          <h2
            className="text-xl font-semibold text-zinc-900"
            data-testid="auth-missing-config-title"
          >
            Authentication is not configured
          </h2>
          <p className="max-w-md text-sm text-zinc-600" data-testid="auth-missing-config-message">
            Set the Supabase environment variables in <code>.env.local</code> to enable login.
          </p>
        </div>
      );
    }

    if (loading || !isAuthorized) {
      return (
        <div
          className="flex min-h-screen items-center justify-center bg-zinc-50"
          data-testid="auth-loading-state"
        >
          <div
            className="flex flex-col items-center gap-3 rounded-md border border-zinc-200 bg-white p-8 shadow-sm"
            data-testid="auth-loading-card"
          >
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"
              data-testid="auth-loading-spinner"
            />
            <p className="text-sm text-zinc-600" data-testid="auth-loading-message">
              Preparing your workspace…
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName ?? Component.name ?? 'Component'})`;

  return AuthenticatedComponent;
}


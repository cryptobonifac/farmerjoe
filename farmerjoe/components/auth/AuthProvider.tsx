'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

type SignUpPayload = {
  email: string;
  password: string;
  fullName: string;
  role: 'producer' | 'customer';
  metadata?: Record<string, unknown>;
};

type AuthContextValue = {
  supabaseConfigured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: string | null;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'twitter') => Promise<void>;
  signUpWithEmail: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      if (!supabase) {
        setLoading(false);
        setError(
          'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable authentication.'
        );
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        const currentSession = data.session ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setRole(
          (currentSession?.user?.user_metadata?.role as string | undefined) ??
            (currentSession?.user?.app_metadata?.role as string | undefined) ??
            null
        );
      } catch (authError) {
        console.error(authError);
        if (!mounted) return;
        setError('Unable to load authentication session.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: authListener } = supabase?.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setRole(
        (newSession?.user?.user_metadata?.role as string | undefined) ??
          (newSession?.user?.app_metadata?.role as string | undefined) ??
          null
      );
    }) ?? { data: { subscription: { unsubscribe: () => undefined } } };

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase environment variables are not configured.');
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      throw authError;
    }
    router.replace('/dashboard');
  };

  const signInWithProvider = async (provider: 'google' | 'facebook' | 'twitter') => {
    if (!supabase) {
      throw new Error('Supabase environment variables are not configured.');
    }

    const redirectTo =
      process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/login`;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (authError) {
      throw authError;
    }
  };

  const signUpWithEmail = async ({
    email,
    password,
    fullName,
    role: targetRole,
    metadata,
  }: SignUpPayload) => {
    if (!supabase) {
      throw new Error('Supabase environment variables are not configured.');
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: targetRole,
          ...(metadata ?? {}),
        },
      },
    });

    if (authError) {
      throw authError;
    }

    router.replace('/login?message=confirm');
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase environment variables are not configured.');
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw signOutError;
    }
    router.replace('/');
  };

  const value: AuthContextValue = {
    supabaseConfigured: Boolean(supabase),
    loading,
    session,
    user,
    role,
    error,
    signInWithEmail,
    signInWithProvider,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

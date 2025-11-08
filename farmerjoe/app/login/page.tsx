'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const { signInWithEmail, signInWithProvider, user, loading, supabaseConfigured, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const message = searchParams.get('message');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signInWithEmail(email, password);
    } catch (signInError: unknown) {
      const message =
        signInError instanceof Error
          ? signInError.message
          : 'We were unable to sign you in. Please check your credentials and try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'twitter') => {
    setIsSocialLoading(provider);
    setFormError(null);
    try {
      await signInWithProvider(provider);
    } catch (socialError: unknown) {
      const message =
        socialError instanceof Error
          ? socialError.message
          : `We were unable to sign you in with ${provider}. Please try again.`;
      setFormError(message);
      setIsSocialLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50" data-testid="login-page">
      <div
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10"
        data-testid="login-wrapper"
      >
        <div
          className="grid gap-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm md:grid-cols-2"
          data-testid="login-content"
        >
          <div data-testid="login-intro">
            <h1 className="text-2xl font-semibold text-zinc-900" data-testid="login-title">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-zinc-600" data-testid="login-description">
              Sign in to access your Farmer Joe account and continue discovering local farm events or
              managing your producer store.
            </p>

            {message === 'confirm' && (
              <div
                className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                data-testid="login-confirmation-alert"
              >
                <p className="font-semibold" data-testid="login-confirmation-title">
                  Check your email
                </p>
                <p className="mt-1" data-testid="login-confirmation-message">
                  We've sent you a confirmation link. Click it to verify your account, then return here to
                  sign in.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4" data-testid="login-form-section">
            {!supabaseConfigured && (
              <div
                className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700"
                data-testid="login-config-warning"
              >
                Supabase environment variables are not set. Authentication is disabled until{' '}
                <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are
                provided.
              </div>
            )}

            {error && (
              <div
                className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                data-testid="login-error-alert"
              >
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleEmailSubmit} data-testid="login-form">
              <div>
                <label
                  className="block text-sm font-medium text-zinc-700"
                  htmlFor="email"
                  data-testid="login-email-label"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  data-testid="login-email"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-zinc-700"
                  htmlFor="password"
                  data-testid="login-password-label"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  data-testid="login-password"
                />
              </div>

              {formError && (
                <p className="text-sm text-rose-600" role="alert" data-testid="login-form-error">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={!supabaseConfigured || isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="login-submit-button"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="relative" data-testid="login-divider">
              <div className="absolute inset-0 flex items-center" data-testid="login-divider-line-wrapper">
                <div className="w-full border-t border-zinc-200" data-testid="login-divider-line" />
              </div>
              <div className="relative flex justify-center text-xs uppercase" data-testid="login-divider-text">
                <span className="bg-white px-2 text-zinc-500" data-testid="login-divider-label">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid gap-2" data-testid="login-social-buttons">
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                disabled={!supabaseConfigured || isSocialLoading !== null}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="login-google-button"
              >
                {isSocialLoading === 'google' ? (
                  <>
                    <div
                      className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"
                      data-testid="login-google-spinner"
                    />
                    Connecting…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignIn('facebook')}
                disabled={!supabaseConfigured || isSocialLoading !== null}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="login-facebook-button"
              >
                {isSocialLoading === 'facebook' ? (
                  <>
                    <div
                      className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"
                      data-testid="login-facebook-spinner"
                    />
                    Connecting…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignIn('twitter')}
                disabled={!supabaseConfigured || isSocialLoading !== null}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="login-twitter-button"
              >
                {isSocialLoading === 'twitter' ? (
                  <>
                    <div
                      className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"
                      data-testid="login-twitter-spinner"
                    />
                    Connecting…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Twitter
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-zinc-500" data-testid="login-register-prompt">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
                data-testid="login-register-link"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


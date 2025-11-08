'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProducerRegistrationWizard from '@/components/register/ProducerRegistrationWizard';

type ProducerSignUpPayload = {
  email: string;
  password: string;
  fullName: string;
  role: 'producer';
  metadata?: Record<string, unknown>;
};

export default function RegisterPage() {
  const { signUpWithEmail, user, loading, supabaseConfigured, error } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<'producer' | 'customer'>('producer');
  const [customerFullName, setCustomerFullName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const resetFormError = () => setFormError(null);

  const handleProducerSubmit = async (payload: ProducerSignUpPayload) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signUpWithEmail(payload);
    } catch (signUpError: unknown) {
      const message =
        signUpError instanceof Error
          ? signUpError.message
          : 'We were unable to create your account. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await signUpWithEmail({
        email: customerEmail,
        password: customerPassword,
        fullName: customerFullName,
        role: 'customer',
      });
    } catch (signUpError: unknown) {
      const message =
        signUpError instanceof Error
          ? signUpError.message
          : 'We were unable to create your account. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50" data-testid="register-page">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-10" data-testid="register-wrapper">
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.4fr)]" data-testid="register-content">
          <aside className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm" data-testid="register-intro">
            <h1 className="text-3xl font-semibold text-zinc-900" data-testid="register-title">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-zinc-600" data-testid="register-description">
              Producers follow a guided five-step onboarding to capture full profile details. Customers can sign up quickly and personalise their preferences later.
            </p>

            <div className="mt-6 space-y-4 rounded-md border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-600" data-testid="register-role-info">
              <div data-testid="register-producer-info">
                <h2 className="text-sm font-semibold text-zinc-900" data-testid="register-producer-title">
                  Producer
                </h2>
                <p data-testid="register-producer-description">
                  Progress through basic details, social links, preferred event locations, virtual store setup, and a confirmation review. Each step keeps you on track, under five minutes.
                </p>
              </div>
              <div data-testid="register-customer-info">
                <h2 className="text-sm font-semibold text-zinc-900" data-testid="register-customer-title">
                  Customer
                </h2>
                <p data-testid="register-customer-description">
                  Discover local events and favourite farms. Register instantly, then tailor preferences when you are ready.
                </p>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <fieldset className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm" data-testid="register-role-fieldset">
              <legend className="text-sm font-medium text-zinc-700" data-testid="register-role-legend">
                Select your role
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2" data-testid="register-role-options">
                {(['producer', 'customer'] as const).map((value) => {
                  const isActive = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setRole(value);
                        resetFormError();
                      }}
                      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300'
                      }`}
                      data-testid={`register-role-option-${value}`}
                    >
                      <span
                        className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                          isActive ? 'border-emerald-600 bg-emerald-600' : 'border-zinc-300'
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-white" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{value === 'producer' ? 'Producer' : 'Customer'}</p>
                        <p className="text-xs text-zinc-500">
                          {value === 'producer' ? 'Full onboarding with store setup' : 'Quick profile creation'}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={isActive}
                        onChange={() => setRole(value)}
                        className="sr-only"
                        data-testid={`register-role-input-${value}`}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {!supabaseConfigured && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700" data-testid="register-config-warning">
                Supabase environment variables are not set. Authentication is disabled until{' '}
                <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are provided.
              </div>
            )}

            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" data-testid="register-error-alert">
                {error}
              </div>
            )}

            {formError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" data-testid="register-form-error">
                {formError}
              </div>
            )}

            {role === 'producer' ? (
              <ProducerRegistrationWizard
                onSubmit={handleProducerSubmit}
                isSubmitting={isSubmitting}
                supabaseConfigured={supabaseConfigured}
                onResetError={resetFormError}
              />
            ) : (
              <form className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm" onSubmit={handleCustomerSubmit} data-testid="register-customer-form">
                <div>
                  <label className="block text-sm font-medium text-zinc-700" htmlFor="customer-full-name" data-testid="register-full-name-label">
                    Full name
                  </label>
                  <input
                    id="customer-full-name"
                    type="text"
                    value={customerFullName}
                    onChange={(event) => {
                      setCustomerFullName(event.target.value);
                      resetFormError();
                    }}
                    required
                    className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    data-testid="register-full-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700" htmlFor="customer-email" data-testid="register-email-label">
                    Email
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(event) => {
                      setCustomerEmail(event.target.value);
                      resetFormError();
                    }}
                    required
                    className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    data-testid="register-email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700" htmlFor="customer-password" data-testid="register-password-label">
                    Password
                  </label>
                  <input
                    id="customer-password"
                    type="password"
                    minLength={8}
                    value={customerPassword}
                    onChange={(event) => {
                      setCustomerPassword(event.target.value);
                      resetFormError();
                    }}
                    required
                    className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    data-testid="register-password"
                  />
                  <p className="mt-1 text-xs text-zinc-400" data-testid="register-password-helper">
                    Password must be at least 8 characters.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!supabaseConfigured || isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="register-submit-button"
                >
                  {isSubmitting ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            )}

            <p className="text-sm text-zinc-500" data-testid="register-login-prompt">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800" data-testid="register-sign-in-link">
                Sign in instead
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}





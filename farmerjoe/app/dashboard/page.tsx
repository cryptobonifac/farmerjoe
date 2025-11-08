/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

function LinkButton({
  href,
  label,
  variant,
  testId,
}: {
  href: string;
  label: string;
  variant: 'primary' | 'secondary';
  testId: string;
}) {
  const baseClasses =
    'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500';
  const variants: Record<typeof variant, string> = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-900',
  };

  return (
    <Link href={href} className={`${baseClasses} ${variants[variant]}`} data-testid={testId}>
      {label}
    </Link>
  );
}

function DashboardPage() {
  const { user, role, signOut, loading, supabaseConfigured } = useAuth();

  const showAuthenticatedView = !!user && supabaseConfigured;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50" data-testid="dashboard-page">
      <header className="border-b border-zinc-200 bg-white" data-testid="dashboard-header">
        <div
          className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4"
          data-testid="dashboard-header-content"
        >
          <div data-testid="dashboard-logo-area">
            <Link href="/" className="text-lg font-semibold text-zinc-900" data-testid="dashboard-logo">
              Farmer Joe
            </Link>
          </div>
          <div className="flex items-center gap-3" data-testid="dashboard-header-actions">
            {loading ? null : showAuthenticatedView ? (
              <>
                <div data-testid="dashboard-user-details">
                  <p
                    className="text-xs font-medium uppercase tracking-wide text-zinc-500"
                    data-testid="dashboard-signed-in-label"
                  >
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-zinc-900" data-testid="dashboard-user-email">
                    {user?.email}
                  </p>
                </div>
                <span
                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"
                  data-testid="dashboard-role-badge"
                >
                  Role: {role ?? 'unassigned'}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  data-testid="dashboard-sign-out-button"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <LinkButton
                  href="/login"
                  label="Log in"
                  variant="secondary"
                  testId="dashboard-login-button"
                />
                <LinkButton
                  href="/register"
                  label="Register"
                  variant="primary"
                  testId="dashboard-register-button"
                />
              </>
            )}
          </div>
        </div>
      </header>

      <main
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10"
        data-testid="dashboard-main"
      >
        {showAuthenticatedView ? (
          <>
            <section
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
              data-testid="dashboard-welcome-card"
            >
              <h1
                className="text-2xl font-semibold text-zinc-900"
                data-testid="dashboard-welcome-title"
              >
                Welcome to Farmer Joe
              </h1>
              <p className="mt-2 text-sm text-zinc-600" data-testid="dashboard-welcome-description">
                You're authenticated and ready to continue building the event marketplace experience for
                local producers and customers.
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-2" data-testid="dashboard-highlights">
              <article
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
                data-testid="dashboard-producer-card"
              >
                <h2
                  className="text-lg font-semibold text-zinc-900"
                  data-testid="dashboard-producer-title"
                >
                  Next steps for producers
                </h2>
                <p
                  className="mt-2 text-sm text-zinc-600"
                  data-testid="dashboard-producer-description"
                >
                  Build the multi-step onboarding flow, set up the virtual store, and connect Stripe to
                  manage subscription plans. This dashboard will evolve into the producer hub.
                </p>
                <span
                  className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700"
                  data-testid="dashboard-producer-cta"
                >
                  Coming soon →
                </span>
              </article>

              <article
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
                data-testid="dashboard-customer-card"
              >
                <h2
                  className="text-lg font-semibold text-zinc-900"
                  data-testid="dashboard-customer-title"
                >
                  What customers can expect
                </h2>
                <p
                  className="mt-2 text-sm text-zinc-600"
                  data-testid="dashboard-customer-description"
                >
                  Discover nearby farm events, follow favourite producers, and receive real-time updates
                  when new products drop. Future sprints will bring search, maps, and QR code sales.
                </p>
                <span
                  className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700"
                  data-testid="dashboard-customer-cta"
                >
                  View product vision →
                </span>
              </article>
            </section>
          </>
        ) : (
          <section
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            data-testid="dashboard-guest-card"
          >
            <h1 className="text-3xl font-semibold text-zinc-900" data-testid="guest-title">
              Discover local farm experiences
            </h1>
            <p className="mt-2 text-zinc-600" data-testid="guest-description">
              Farmer Joe connects producers and customers through curated events, seasonal produce, and
              community-first experiences. Create an account to start hosting or exploring.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row" data-testid="guest-actions">
              <LinkButton
                href="/register"
                label="Create an account"
                variant="primary"
                testId="guest-register-button"
              />
              <LinkButton
                href="/login"
                label="Log in"
                variant="secondary"
                testId="guest-login-button"
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;



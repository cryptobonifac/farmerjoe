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

export default function HomePage() {
  const { user, supabaseConfigured } = useAuth();

  const isAuthenticated = Boolean(user && supabaseConfigured);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50" data-testid="home-page">
      <header className="border-b border-zinc-200 bg-white" data-testid="home-header">
        <div
          className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4"
          data-testid="home-header-content"
        >
          <Link href="/" className="text-lg font-semibold text-zinc-900" data-testid="home-logo">
            Farmer Joe
          </Link>
          <div className="flex items-center gap-3" data-testid="home-header-actions">
            {isAuthenticated ? (
              <LinkButton
                href="/dashboard"
                label="Open dashboard"
                variant="primary"
                testId="home-dashboard-button"
              />
            ) : (
              <>
                <LinkButton
                  href="/login"
                  label="Log in"
                  variant="secondary"
                  testId="home-login-button"
                />
                <LinkButton
                  href="/register"
                  label="Register"
                  variant="primary"
                  testId="home-register-button"
                />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16" data-testid="home-main">
        <section className="grid gap-10 md:grid-cols-2 md:items-center" data-testid="home-hero">
          <div className="space-y-4" data-testid="home-hero-content">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600" data-testid="home-eyebrow">
              Community-first agriculture
            </p>
            <h1 className="text-4xl font-bold text-zinc-900" data-testid="home-title">
              Discover local farm experiences and seasonal produce drops
            </h1>
            <p className="text-base text-zinc-600" data-testid="home-description">
              Farmer Joe connects producers and customers through curated events, harvest updates, and
              direct-to-community subscriptions. Join now to host farm days, follow favourite growers, and
              unlock member-only drops.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row" data-testid="home-hero-actions">
              <LinkButton
                href="/register"
                label="Get started"
                variant="primary"
                testId="home-get-started-button"
              />
              <LinkButton
                href="/login"
                label="I already have an account"
                variant="secondary"
                testId="home-existing-account-button"
              />
            </div>
          </div>

          <div
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            data-testid="home-highlight-card"
          >
            <h2 className="text-lg font-semibold text-zinc-900" data-testid="home-highlight-title">
              Why producers love Farmer Joe
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600" data-testid="home-highlight-list">
              <li data-testid="home-highlight-item-events">• Host ticketed farm tours and workshops.</li>
              <li data-testid="home-highlight-item-inventory">
                • Share live inventory updates with loyal customers.
              </li>
              <li data-testid="home-highlight-item-community">
                • Build a community with follow, RSVP, and subscription tools.
              </li>
            </ul>
          </div>
        </section>

        <section
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          data-testid="home-cta-card"
        >
          <h2 className="text-xl font-semibold text-zinc-900" data-testid="home-cta-title">
            Ready to start exploring?
          </h2>
          <p className="mt-2 text-sm text-zinc-600" data-testid="home-cta-description">
            Create a free account to curate farm experiences, follow producers, and stay in the loop with
            fresh drops near you.
          </p>
          <div className="mt-4 flex gap-3" data-testid="home-cta-actions">
            <LinkButton
              href="/register"
              label="Create an account"
              variant="primary"
              testId="home-cta-register-button"
            />
            <LinkButton
              href="/login"
              label="Log in"
              variant="secondary"
              testId="home-cta-login-button"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

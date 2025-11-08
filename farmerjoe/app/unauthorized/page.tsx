'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-24"
      data-testid="unauthorized-page"
    >
      <div
        className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm"
        data-testid="unauthorized-card"
      >
        <h1 className="text-2xl font-semibold text-zinc-900" data-testid="unauthorized-title">
          You don't have access yet
        </h1>
        <p className="mt-3 text-sm text-zinc-600" data-testid="unauthorized-message">
          This area is restricted. If you believe you should have access, reach out to an
          administrator or try signing in with a different account.
        </p>
        <div
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          data-testid="unauthorized-actions"
        >
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
            data-testid="unauthorized-home-link"
          >
            Go back home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            data-testid="unauthorized-switch-account-link"
          >
            Switch account
          </Link>
        </div>
      </div>
    </div>
  );
}




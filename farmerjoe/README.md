## Farmer Joe Web – Authenticated App Shell

This folder contains the Next.js 16 application for the Farmer Joe marketplace. The app now ships with Supabase-backed authentication, role-aware routing, and starter flows for email/password and social sign-in.

---

## 1. Prerequisites

- Node.js 18+ (the pipeline uses v24)
- A Supabase project with Google, Facebook, and Instagram OAuth providers enabled
- Supabase project values:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - (optional) `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` for custom OAuth callbacks

> ⚠️ Authentication is disabled until these environment variables are provided. The UI will surface a configuration warning when values are missing.

---

## 2. Configure Environment Variables

Create a `.env.local` file at the project root (`farmerjoe/.env.local`) and populate it with your Supabase details:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
# Optional: customise where Supabase redirects after OAuth flows
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/login
```

Restart the dev server after updates so Next.js can pick up the new values.

---

## 3. Available Scripts

Run from the `farmerjoe` directory:

```bash
# Start the development server
npm run dev

# Compile production assets
npm run build

# Lint the project
npm run lint
```

The root `package.json` proxies common commands (`npm run dev`, `npm run build`, etc.) to this workspace if you prefer running from the repo root.

---

## 4. Auth Features Included

- Supabase client initialised with safe fallbacks for missing env configuration
- `AuthProvider` to expose session, role, and helper methods across the app
- Email/password login and registration flows, including role selection (producer or customer)
- Social sign-in buttons for Google, Facebook, and Instagram
- `withAuth` higher-order component for guarding routes with optional role restrictions
- `unauthorized` page to handle blocked access

> Roles are stored in each user's Supabase metadata. Ensure your Supabase auth schema includes a `role` field (e.g., via `auth.users` metadata or a dedicated profile table) so role-based gates can work reliably.

---

## 5. Next Steps

- Add server-side role enforcement (e.g., using RLS policies or edge middleware)
- Expand the dashboard with producer/customer-specific views
- Hook registration into Supabase functions to persist richer profile data
- Record OAuth redirect URL inside the Supabase dashboard to match `NEXT_PUBLIC_SUPABASE_REDIRECT_URL`

---

For broader project context, see the top-level `docs/plan.md`, which outlines the product roadmap and feature milestones.

# Farmer Joe Web Application – Project Plan

## 1. Project Foundations
- Initialize Git repository, add README, .gitignore, and set up remote origin.
- Configure CI/CD pipeline using GitHub Actions for linting, testing, and building.
- Scaffold Next.js application with TypeScript via `npx create-next-app@latest farmer-joe --ts`.
- Install and configure Material-UI (MUI) core and icons packages.
- Set up environment variable files: `.env.local` for local development and `.env.example` as a template.
- Add ESLint and Prettier configurations for consistent code style.
- Define npm scripts in `package.json` for `dev`, `build`, `lint`, and `test`.
- setup deployment to production using https://vercel.com/, use token XVu3fLLWwF35MiNv5uS9BcGH

## 2. Authentication & Authorization
- Supabase project (Auth enabled)
- Enable Google, Facebook, Instagram providers
- Build AuthProvider and login/register pages
- Implement route protection (withAuth HOC)
- Extend users table with `role` column (producer / customer)

## 3. Producer Registration Flow
- Step 1: Basic info (name, email, phone, business name)
- Step 2: Social links (optional)
- Step 3: Preferences (product categories, locations via map)
- Step 4: Virtual store (CRUD items)
- Step 5: Confirmation (summary & save)
- UX: progress bar, each step ≤5 min

## 4. Customer Registration Flow
- Step 1: Basic info (username, email, phone)
- Step 2: Preferences (favourite producers, items, notification radius)
- Step 3: Confirmation (save profile)
- Reuse AuthProvider and progress UI

## 5. Virtual Store Management (Producer)
- Store page listing items with edit/delete
- Add item modal (name, quantity, unit, price, image upload)
- Live stock update when events are created
- Validation (no negative quantities, required fields)

## 6. Event Creation (Producer)
- Event form (title, dates, location picker, minimum order)
- Select items from virtual store (override quantity per event)
- QR code generation (event ID)
- Publish / Draft toggle
- Social sharing (link + QR image)

## 7. Event Search (Customer)
- Search UI (radius, producer, product filters)
- Map view with pins
- Result list cards (event name, date, distance)
- Pagination / infinite scroll

## 8. On‑Spot Sales (Mobile)
- QR scanner integration
- Order summary screen
- Payment (cash, mark as paid)
- Order status update & push notification

## 9. Subscription Model (Stripe)
- Stripe test account & API keys
- Define Free, Monthly, Yearly plans
- Checkout flow for producers
- Admin pricing UI (edit plan prices)
- Feature gating for free vs paid users

## 10. User Preferences (Both Roles)
- Referral link generation & usage count
- Favourites lists (producers, products, locations)
- Notification settings (new events, order status)
- Profile edit reuse registration forms

## 11. Admin Dashboard (Super‑admin)
- User management (search, block/unblock, role change)
- Subscription control (view plans, adjust pricing/trial)
- Basic analytics stub (total events, active producers)
- Access guard (admin role only)

## 12. Push Notifications
- Service worker setup (e.g., Firebase Cloud Messaging)
- Subscribe UI on preferences page
- Trigger on event publish (targeted by radius/favourites)
- Trigger on order updates

## 13. Testing & Quality Assurance
- Unit tests (Jest + React Testing Library)
- Integration tests (Cypress for core flows)
- Lint & format enforcement in CI
- Accessibility audit (axe-core)

## 14. UI/UX Review & Iteration
- Design hand‑off (Figma export)
- Small user testing session
- Iterate based on feedback

## 15. Deployment & Launch
- Staging deployment (Vercel preview)
- Smoke tests
- Production rollout (DNS switch, analytics)
- Post‑launch support (1 week bug triage)
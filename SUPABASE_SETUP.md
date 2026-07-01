# Supabase Setup - Thayyib

## 1. Create Project

Create a Supabase project and copy:

- Project URL
- Publishable key

Add them to `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## 2. Run Schema

Open the Supabase SQL editor and run:

```text
supabase/schema.sql
```

This enables company-scoped data with Row Level Security.

If the project was created before demo seeding was added, run this small upgrade
file too:

```text
supabase/demo-seed-upgrade.sql
```

## 3. Configure Auth

For local demos, either:

- Disable email confirmation temporarily, or
- Confirm the demo user manually in Supabase Auth.

Recommended demo account:

```text
Email: thayyib.demo.2026@gmail.com
Password: ThayyibDemo123!
```

## 4. Create Demo User

Option A: Supabase Dashboard

1. Go to Authentication > Users.
2. Click Add user.
3. Enter the demo email and password.
4. Confirm the user if needed.

Option B: Script

```bash
cd apps/web
npm run seed:demo-user
```

If email rate limiting happens, use Option A.

The seed script also prepares mock data for the demo workspace:

- Suppliers
- Documents
- Audit checklist progress
- Notifications, after the latest notification insert policy is applied

## 5. Run App

```bash
cd apps/web
npm run dev
```

Then open:

```text
http://localhost:3000/login
```

## Notes

- The app falls back to demo data when the schema is not installed.
- Once schema and auth are configured, protected pages read/write live Supabase data.
- AI features are not wired yet by design.

## Google Sign-In

The app includes Google OAuth buttons on `/login` and `/register`.

You still need to configure Google as a Supabase provider:

1. In Supabase, go to Authentication > Providers > Google.
2. Copy the callback URL shown by Supabase.
3. In Google Cloud Console, create an OAuth Client ID for a Web application.
4. Add this local origin:

```text
http://localhost:3000
```

5. Add the Supabase callback URL to Google Authorized redirect URIs.
6. Copy the Google Client ID and Client Secret into Supabase's Google provider settings.
7. In Supabase Authentication URL configuration, ensure these URLs are allowed:

```text
http://localhost:3000
http://localhost:3000/auth/callback
```

Supabase's official guide: https://supabase.com/docs/guides/auth/social-login/auth-google

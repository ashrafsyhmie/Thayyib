# Thayyib

Thayyib is a halal compliance management platform for food manufacturers.

Current MVP focus:

- Supabase authentication
- Company workspace foundation
- Supplier compliance tracking
- Document metadata and upload flow
- Certificate expiry monitoring
- Audit readiness dashboard
- Notifications

AI/OCR/RAG features are intentionally parked for now.

## Web App

```bash
cd apps/web
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Supabase Setup

Run the SQL in:

```text
supabase/schema.sql
```

Use the Supabase SQL editor. This creates:

- companies
- company_members
- suppliers
- documents
- audit_checklist_items
- notifications
- activity_logs
- private `documents` storage bucket
- RLS policies
- new-user company workspace trigger

## Demo User

Default demo credentials:

```text
Email: thayyib.demo.2026@gmail.com
Password: ThayyibDemo123!
```

Create the user in Supabase Auth manually or run:

```bash
cd apps/web
npm run seed:demo-user
```

If Supabase rate limits signup emails, create the user manually in
Authentication > Users.

## Google Sign-In

Google sign-in is available on `/login` and `/register`.

Configure the Google provider in Supabase first. See:

```text
SUPABASE_SETUP.md
```

## Quality Checks

```bash
cd apps/web
npm run lint
npm run test
npm run build
```

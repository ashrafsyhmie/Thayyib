# Thayyib

Thayyib is an AI-assisted halal compliance intelligence platform for food
manufacturers. It helps teams track suppliers, documents, certificate expiry,
audit readiness, reminders, and ingredient/document risk signals.

Important: Thayyib is decision support software. It should flag possible issues
with language such as "Potential risk detected. Please verify with a qualified
halal compliance officer." It must not claim that an item is finally halal or
non-halal.

## Hackathon Quick Start

Use this path if you are a judge, teammate, or reviewer who wants to run the
demo quickly.

### 1. Install prerequisites

- Node.js 22 or newer
- npm
- Git
- A Supabase account if you want to create your own backend project

### 2. Clone and install

```bash
git clone https://github.com/ashrafsyhmie/Thayyib.git
cd Thayyib/apps/web
npm install
```

### 3. Create the environment file

Copy the example file:

```bash
cp .env.example .env.local
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

The committed example contains the hackathon Supabase project URL and
publishable browser key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eyttlwvxafgiuhmampnw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_bBmpxXjCCA96H8uAzOEm1w_5TlQpo72
```

This is not a `service_role` key. Do not commit private keys, database
passwords, or OpenAI keys. Keep those only in `.env.local` or deployment
secrets.

### 4. Run the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 5. Log in

Default demo account:

```text
Email: thayyib.demo.2026@gmail.com
Password: ThayyibDemo123!
```

If the shared demo user is not available, create your own account from
`/register`. The database trigger creates a company workspace for new users.

## Full Supabase Setup

If you want to run the project with your own Supabase backend:

1. Create a Supabase project.
2. Copy the Project URL and publishable key from Project Settings > API.
3. Put them in `apps/web/.env.local`.
4. Open the Supabase SQL editor.
5. Run `supabase/schema.sql`.
6. If you are upgrading an older database, also run the relevant files in
   `supabase/*-upgrade.sql`.
7. Configure Authentication. For a local demo, disable email confirmation
   temporarily or confirm users manually.
8. Optionally seed the demo workspace:

```bash
cd apps/web
npm run seed:demo-user
```

More detail is available in `SUPABASE_SETUP.md`.

## AI Analyzer

The app includes OCR/document analysis code. To enable OpenAI-backed analysis,
add these server-only values to `apps/web/.env.local`:

```env
OPENAI_API_KEY=your_openai_project_api_key_here
OPENAI_MODEL=gpt-5.4-mini
```

Never expose `OPENAI_API_KEY` as a `NEXT_PUBLIC_` value and never commit it.
AI output must be treated as an auditable assistant finding with confidence,
sources, and human verification.

## Main Features

- Supabase authentication
- Company workspace foundation
- Supplier compliance tracking
- Document metadata and upload flow
- Certificate expiry monitoring
- Audit readiness dashboard
- Notifications
- OCR and AI-assisted risk analysis foundations
- Demo data for halal compliance workflows

## Useful Commands

```bash
cd apps/web
npm run lint
npm run test
npm run build
```

## Project Structure

```text
apps/web/                 Next.js web app
supabase/                 Database schema, storage setup, upgrade scripts
context/                  Product, engineering, AI, and business context
api-testing/              Postman collection and API testing notes
SUPABASE_SETUP.md         Detailed Supabase configuration guide
TESTING.md                Test procedure
MANUAL_TESTING_CHECKLIST.md
```

# Thayyib

**Group:** Low Battery

**Live Demo:** https://thayyib.vercel.app/

Thayyib is an AI-assisted halal compliance intelligence platform for food
manufacturers. It helps halal operations teams move away from scattered Excel
files, email threads, paper certificates, and manual reminders by putting
supplier compliance, documents, expiry tracking, audit readiness, and AI risk
signals in one workspace.

Thayyib is built as a serious FYP-to-startup MVP for food manufacturers,
especially SMEs preparing for halal audits.

## Demo Access

Open the live app:

```text
https://thayyib.vercel.app/
```

Demo account:

```text
Email: thayyib.demo.2026@gmail.com
Password: ThayyibDemo123!
```

If the demo account is unavailable, create a new account from `/register`.
Thayyib creates a company workspace for each new user.

## What It Does

- Tracks suppliers, documents, certificate expiry, reminders, and audit tasks.
- Shows audit readiness and compliance visibility in a dashboard.
- Supports document upload and metadata management.
- Uses OCR and AI-assisted analysis to highlight possible ingredient or document
  risks.
- Keeps AI findings auditable with confidence, sources, and recommended next
  actions.

## AI Safety

Thayyib is decision support software. It should flag possible issues with
language such as:

```text
Potential risk detected. Please verify with a qualified halal compliance officer.
```

It must not claim that an item is finally halal or non-halal, and it must not
replace human halal compliance officers.

## Hackathon Quick Start

Use this path if you are a judge, teammate, or reviewer who wants to run the app
locally.

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

Use the demo account shown in the Demo Access section, or register a new user.

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

## MVP Features

- Supabase authentication
- Company workspace foundation
- Supplier compliance tracking
- Document metadata and upload flow
- Certificate expiry monitoring
- Audit readiness dashboard
- Notifications
- OCR and AI-assisted risk analysis foundations
- Demo data for halal compliance workflows

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- OpenAI-compatible AI analyzer support
- Tesseract/OCR document text extraction foundations

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

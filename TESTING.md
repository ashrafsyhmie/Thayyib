# TESTING.md - Thayyib Feature Test Checklist

Use this file to check whether the current non-AI MVP works correctly.

AI analyzer testing is intentionally excluded for now because AI features are parked.

## 1. Before Testing

From the web app folder:

```bash
cd apps/web
npm install
```

Make sure `apps/web/.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

In Supabase SQL Editor, run:

```text
supabase/schema.sql
```

If your Supabase project already existed before the latest seed changes, also run:

```text
supabase/demo-seed-upgrade.sql
```

Then create or prepare the demo account:

```bash
npm run seed:demo-user
```

Default account:

```text
Email: thayyib.demo.2026@gmail.com
Password: ThayyibDemo123!
```

Expected seed result:

- At least 5 suppliers
- At least 5 documents
- At least 4 notifications
- Audit checklist items visible

## 2. Automated Checks

Run these before manual testing:

```bash
npm run lint
npm run test
npm run build
```

Expected result:

- `lint` finishes without errors
- `test` passes all unit tests
- `build` completes successfully

## 3. Start the App

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If you are not logged in, the app should redirect to:

```text
http://localhost:3000/login
```

## 4. Authentication Tests

### Email Login

Steps:

1. Open `/login`.
2. Enter the default demo email and password.
3. Submit the form.

Expected:

- User lands on the dashboard.
- Sidebar and topbar are visible.
- Logout button is visible in the sidebar on desktop.

### Logout

Steps:

1. Click `Logout`.
2. Open `/suppliers`.

Expected:

- User returns to `/login`.
- Protected pages redirect unauthenticated users to login.

### Registration

Steps:

1. Open `/register`.
2. Fill in full name, company name, email, password, and confirm password.
3. Submit the form.

Expected:

- Account is created or Supabase shows a clear auth message.
- If email confirmation is enabled, user is asked to check email.
- New workspace is created after the first login.

### Google Sign-In

Before testing, configure Google provider in Supabase.

Steps:

1. Open `/login`.
2. Click `Continue with Google`.
3. Complete Google authentication.

Expected:

- User returns to `/auth/callback`.
- App redirects to the dashboard.
- A Supabase workspace exists for the Google user.
- Mock suppliers, documents, and notifications are available after workspace setup.

## 5. Dashboard Tests

Steps:

1. Login.
2. Open `/`.

Expected:

- Compliance readiness score is visible.
- Total suppliers count is visible.
- Missing documents count is visible.
- Audit checklist progress is visible.
- Upcoming renewals show expiring certificates, especially Crescent Dairy.

## 6. Supplier Tests

### Supplier List

Steps:

1. Open `/suppliers`.

Expected:

- Supplier table is visible.
- Mock suppliers are listed.
- Status badges include `Valid`, `Expiring Soon`, `Expired`, or `Missing Certificate`.
- Expiry dates are visible.

### Add Supplier

Steps:

1. Fill the Add Supplier form.
2. Use a future certificate expiry date.
3. Submit.

Expected:

- Page returns to `/suppliers?message=Supplier%20added`.
- New supplier appears in the table.
- Certificate status is calculated from the expiry date.

### Supplier Detail

Steps:

1. Click a supplier name.

Expected:

- Supplier detail page opens.
- Profile, certificate expiry, contact person, and linked documents are shown.
- Missing supplier IDs show a friendly "Supplier Not Found" state.

## 7. Document Tests

### Document List

Steps:

1. Open `/documents`.

Expected:

- Document table is visible.
- Mock documents are listed.
- Document type, supplier, uploaded date, expiry date, and status are visible.

### Upload Document

Steps:

1. Fill the upload form.
2. Select document type.
3. Optionally link a supplier.
4. Upload a PDF, JPG, PNG, or DOCX.
5. Submit.

Expected:

- Page returns to `/documents?message=Document%20uploaded`.
- New document appears in the table.
- If a file was attached, document detail page shows a secure download link.

### Document Detail

Steps:

1. Click a document name.

Expected:

- Metadata is visible.
- Linked supplier is visible.
- Expiry date and status are visible.
- Missing document IDs show a friendly "Document Not Found" state.

## 8. Audit Readiness Tests

Steps:

1. Open `/audit-readiness`.

Expected:

- Overall readiness percentage is visible.
- Evidence needing review is shown.
- Checklist is grouped by category.
- Completed and missing items use clear status badges.

Steps:

1. Click `Export Summary`.

Expected:

- Printable audit summary page opens.
- Print button is available.

## 9. Notification Tests

Steps:

1. Open `/notifications`.

Expected:

- Mock notifications are visible.
- Unread items are visually distinct.
- High-priority certificate expiry/expired reminders are visible.

Steps:

1. Click the mark-as-read action if visible.

Expected:

- Notifications become read.
- Page refreshes without errors.

## 10. Settings Tests

Steps:

1. Open `/settings`.
2. Update company name, registration number, address, sector, or contact email.
3. Submit.

Expected:

- Page returns with a success message.
- Updated company details remain visible after refresh.

## 11. Current MVP Requirement Coverage

| Requirement | Current Status |
|---|---|
| Authentication and company workspace | Implemented with Supabase Auth |
| Supplier compliance tracker | Implemented |
| Document management | Implemented |
| Certificate expiry monitoring | Implemented |
| Audit readiness dashboard | Implemented |
| Smart reminders | Implemented as notification records |
| Compliance score | Implemented from checklist completion |
| AI document analyzer | Parked by decision |

## 12. Known Non-AI Limitations

- Search and filter controls are visual only.
- Document preview is a placeholder; secure download is implemented when a file exists.
- Team member management is a placeholder.
- Password reset page is a placeholder.
- Audit checklist item updates are not yet editable from the UI.

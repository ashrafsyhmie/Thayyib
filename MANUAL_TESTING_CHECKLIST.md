# Thayyib Manual Testing Checklist

Use this as an Obsidian checklist while manually testing the MVP. Each item is grouped by feature so bugs can be traced back to the product area.

Status tags:
- `Current MVP` = expected to work in the current non-AI app.
- `Parked AI` = part of the intended MVP vision, but currently parked or partially available.
- `Post-MVP` = visible or planned beyond the core MVP.

## Test Session

- [ ] Tester:
- [ ] Date:
- [ ] Browser:
- [ ] Environment: `local` / `staging` / `production`
- [ ] App URL:
- [ ] Supabase project:
- [ ] Notes:

## 0. Setup and Smoke Checks

### Local Setup `Current MVP`

- [ ] From `apps/web`, run `npm install`.
- [ ] Confirm `apps/web/.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Confirm `apps/web/.env.local` contains `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Run the latest database schema in Supabase SQL editor.
- [ ] If needed, run the demo seed upgrade SQL.
- [ ] Run `npm run seed:demo-user`.
- [ ] Confirm demo account exists.
- [ ] Confirm seed data includes at least 5 suppliers.
- [ ] Confirm seed data includes at least 5 documents.
- [ ] Confirm seed data includes notifications.
- [ ] Confirm audit checklist items are visible after login.

### Automated Checks `Current MVP`

- [ ] Run `npm run lint` successfully.
- [ ] Run `npm run test` successfully.
- [ ] Run `npm run build` successfully.
- [ ] Start the app with `npm run dev`.
- [ ] Open `http://localhost:3000`.
- [ ] Confirm unauthenticated users are redirected to `/login`.

## 1. Authentication and Company Workspace

### Login `Current MVP`

- [ ] Open `/login`.
- [ ] Enter demo email.
- [ ] Enter demo password.
- [ ] Submit the form.
- [ ] Confirm login succeeds.
- [ ] Confirm user lands on dashboard or `/`.
- [ ] Confirm sidebar is visible on desktop.
- [ ] Confirm topbar/page header is visible.
- [ ] Confirm logout button is visible.
- [ ] Confirm invalid email/password shows a clear error.
- [ ] Confirm loading state prevents accidental double submit.

### Logout and Route Protection `Current MVP`

- [ ] Click `Logout`.
- [ ] Confirm user is signed out.
- [ ] Open `/suppliers`.
- [ ] Confirm protected route redirects to `/login`.
- [ ] Open `/documents`.
- [ ] Confirm protected route redirects to `/login`.
- [ ] Open `/settings`.
- [ ] Confirm protected route redirects to `/login`.

### Registration `Current MVP`

- [ ] Open `/register`.
- [ ] Fill full name.
- [ ] Fill company name.
- [ ] Fill email.
- [ ] Fill password.
- [ ] Fill confirm password.
- [ ] Submit the form.
- [ ] Confirm account creation succeeds or Supabase returns a clear auth message.
- [ ] If email confirmation is enabled, confirm the app tells the user to check email.
- [ ] Login with the new account.
- [ ] Confirm a company workspace exists after first login.
- [ ] Confirm workspace-specific seed or empty states do not expose another company data.

### Google Sign-In `Current MVP`

- [ ] Confirm Google provider is configured in Supabase.
- [ ] Open `/login`.
- [ ] Click `Continue with Google`.
- [ ] Complete Google authentication.
- [ ] Confirm callback reaches `/auth/callback`.
- [ ] Confirm user redirects back into the app.
- [ ] Confirm a workspace exists for the Google user.
- [ ] Confirm suppliers/documents/notifications load for that workspace.

### Forgot Password `Current MVP`

- [ ] Open `/forgot-password`.
- [ ] Enter a valid email address.
- [ ] Submit the form.
- [ ] Confirm user receives a clear reset instruction or placeholder message.
- [ ] Confirm invalid email input is handled clearly.

## 2. Dashboard

### Dashboard Overview `Current MVP`

- [ ] Login successfully.
- [ ] Open `/` or `/dashboard`.
- [ ] Confirm compliance readiness score is visible.
- [ ] Confirm total suppliers count is visible.
- [ ] Confirm missing documents count is visible.
- [ ] Confirm audit checklist progress is visible.
- [ ] Confirm upcoming renewals are visible.
- [ ] Confirm expiring certificates appear in upcoming renewals.
- [ ] Confirm recent documents or activity are visible if implemented.
- [ ] Confirm dashboard data matches supplier/document/audit records.
- [ ] Confirm empty states are friendly when no data exists.

### Dashboard Risk Language `Current MVP`

- [ ] Confirm dashboard avoids final halal/non-halal claims.
- [ ] Confirm any risk wording frames output as assistance.
- [ ] Confirm high-risk copy uses language similar to: "Potential risk detected. Please verify with a qualified halal compliance officer."

## 3. Supplier Compliance Tracker

### Supplier List `Current MVP`

- [ ] Open `/suppliers`.
- [ ] Confirm supplier table/list is visible.
- [ ] Confirm seeded suppliers are listed.
- [ ] Confirm supplier name is visible.
- [ ] Confirm contact person is visible where available.
- [ ] Confirm certificate expiry date is visible.
- [ ] Confirm status badge is visible.
- [ ] Confirm statuses can show `Valid`.
- [ ] Confirm statuses can show `Expiring Soon`.
- [ ] Confirm statuses can show `Expired`.
- [ ] Confirm statuses can show `Missing Certificate`.
- [ ] Confirm search/filter controls do not break the page, even if visual only.

### Add Supplier `Current MVP`

- [ ] Fill supplier name.
- [ ] Fill contact person.
- [ ] Fill contact email or phone if available.
- [ ] Fill certificate number if available.
- [ ] Select a future certificate expiry date.
- [ ] Submit the form.
- [ ] Confirm success message appears.
- [ ] Confirm page returns to `/suppliers?message=Supplier%20added` or equivalent success state.
- [ ] Confirm new supplier appears in the list.
- [ ] Confirm certificate status is calculated from expiry date.
- [ ] Try submitting required fields empty.
- [ ] Confirm validation errors are clear.

### Supplier Detail `Current MVP`

- [ ] Click a supplier name.
- [ ] Confirm supplier detail page opens.
- [ ] Confirm supplier profile is visible.
- [ ] Confirm certificate expiry is visible.
- [ ] Confirm contact person is visible.
- [ ] Confirm linked documents are visible.
- [ ] Confirm status badge matches list page.
- [ ] Open a non-existing supplier ID.
- [ ] Confirm friendly `Supplier Not Found` state appears.

## 4. Document Management

### Document List `Current MVP`

- [ ] Open `/documents`.
- [ ] Confirm document table/list is visible.
- [ ] Confirm seeded documents are listed.
- [ ] Confirm document name is visible.
- [ ] Confirm document type is visible.
- [ ] Confirm linked supplier is visible where available.
- [ ] Confirm uploaded date is visible.
- [ ] Confirm expiry date is visible where available.
- [ ] Confirm status is visible.
- [ ] Confirm search/filter controls do not break the page, even if visual only.

### Upload Document `Current MVP`

- [ ] Open document upload form.
- [ ] Fill document name/title.
- [ ] Select document type.
- [ ] Optionally link a supplier.
- [ ] Add expiry date if relevant.
- [ ] Upload a PDF file.
- [ ] Submit the form.
- [ ] Confirm success message appears.
- [ ] Confirm page returns to `/documents?message=Document%20uploaded` or equivalent success state.
- [ ] Confirm new document appears in the list.
- [ ] Confirm document metadata is saved correctly.
- [ ] Upload a JPG file.
- [ ] Confirm accepted file uploads successfully.
- [ ] Upload a PNG file.
- [ ] Confirm accepted file uploads successfully.
- [ ] Upload a DOCX file.
- [ ] Confirm accepted file uploads successfully.
- [ ] Try uploading an unsupported file type.
- [ ] Confirm validation or error message is clear.

### Document Detail `Current MVP`

- [ ] Click a document name.
- [ ] Confirm document detail page opens.
- [ ] Confirm metadata is visible.
- [ ] Confirm linked supplier is visible.
- [ ] Confirm expiry date is visible where available.
- [ ] Confirm document status is visible.
- [ ] If a file exists, confirm secure download link is visible.
- [ ] Click secure download link.
- [ ] Confirm file opens or downloads without exposing public storage unexpectedly.
- [ ] Open a non-existing document ID.
- [ ] Confirm friendly `Document Not Found` state appears.

## 5. Certificate Expiry Monitoring

### Expiry Status Rules `Current MVP`

- [ ] Create or inspect supplier with future certificate expiry.
- [ ] Confirm status is `Valid`.
- [ ] Create or inspect supplier with near-future certificate expiry.
- [ ] Confirm status is `Expiring Soon`.
- [ ] Create or inspect supplier with past certificate expiry.
- [ ] Confirm status is `Expired`.
- [ ] Create or inspect supplier with no certificate expiry.
- [ ] Confirm status is `Missing Certificate`.
- [ ] Confirm expiry status is consistent on dashboard, supplier list, supplier detail, documents, and notifications.

### Expiry Reminders `Current MVP`

- [ ] Confirm dashboard upcoming renewals show expiring certificates.
- [ ] Confirm notifications include certificate expiry reminders.
- [ ] Confirm high-priority expired/expiring certificate reminders are visually clear.
- [ ] Confirm reminder dates are readable and not ambiguous.

## 6. Audit Readiness Dashboard

### Readiness Page `Current MVP`

- [ ] Open `/audit-readiness`.
- [ ] Confirm overall readiness percentage is visible.
- [ ] Confirm evidence needing review is visible.
- [ ] Confirm checklist is grouped by category.
- [ ] Confirm completed checklist items are clearly marked.
- [ ] Confirm missing checklist items are clearly marked.
- [ ] Confirm status badges are readable.
- [ ] Confirm readiness score matches checklist completion logic.
- [ ] Confirm page avoids claiming final halal compliance approval.

### Export Summary `Current MVP`

- [ ] Click `Export Summary`.
- [ ] Confirm printable audit summary page opens.
- [ ] Confirm print button is available.
- [ ] Confirm summary includes readiness score.
- [ ] Confirm summary includes checklist status.
- [ ] Confirm summary includes documents or evidence needing review.
- [ ] Confirm printed layout is readable.

## 7. Notifications and Smart Reminders

### Notification List `Current MVP`

- [ ] Open `/notifications`.
- [ ] Confirm notification list is visible.
- [ ] Confirm seeded notifications are visible.
- [ ] Confirm unread items are visually distinct.
- [ ] Confirm read items are less prominent.
- [ ] Confirm high-priority certificate expiry reminders are visible.
- [ ] Confirm expired certificate reminders are visible.
- [ ] Confirm notification dates are readable.
- [ ] Confirm empty state is friendly when no notifications exist.

### Mark as Read `Current MVP`

- [ ] Click mark-as-read action on an unread notification.
- [ ] Confirm notification becomes read.
- [ ] Confirm page refreshes or updates without errors.
- [ ] Confirm read state persists after refresh.

## 8. Compliance Score

### Score Visibility `Current MVP`

- [ ] Confirm compliance score appears on dashboard.
- [ ] Confirm compliance/readiness score appears on audit readiness page.
- [ ] Confirm score is easy to understand.
- [ ] Confirm score changes when checklist data changes, if editable through seed/database.
- [ ] Confirm score does not present itself as an official halal ruling.

### Score Explainability `Current MVP`

- [ ] Confirm user can see which missing items affect readiness.
- [ ] Confirm missing documents are connected to checklist or dashboard warnings.
- [ ] Confirm risky/expired items are visible enough for manual follow-up.

## 9. Settings and Workspace Profile

### Company Settings `Current MVP`

- [ ] Open `/settings`.
- [ ] Update company name.
- [ ] Update registration number.
- [ ] Update address.
- [ ] Update sector.
- [ ] Update contact email.
- [ ] Submit the form.
- [ ] Confirm success message appears.
- [ ] Refresh the page.
- [ ] Confirm updated company details remain visible.
- [ ] Confirm invalid email is rejected or clearly handled.

### Workspace Safety `Current MVP`

- [ ] Confirm company settings only show the current user's workspace.
- [ ] Confirm data does not leak across demo/new accounts.
- [ ] Confirm settings page redirects unauthenticated users to `/login`.

## 10. AI Document Analyzer

### AI Analyzer Screen `Parked AI`

- [ ] Open `/ai-analyzer`.
- [ ] Confirm page loads without crashing.
- [ ] Confirm current state clearly communicates whether AI is available, parked, mocked, or requires configuration.
- [ ] Confirm user can upload or select a document if the UI supports it.
- [ ] Confirm unsupported actions show a clear message.

### OCR and Text Extraction `Parked AI`

- [ ] Upload a readable PDF ingredient list.
- [ ] Confirm text extraction runs or shows a clear unavailable state.
- [ ] Upload a readable image ingredient list.
- [ ] Confirm OCR runs or shows a clear unavailable state.
- [ ] Upload poor-quality OCR sample.
- [ ] Confirm low confidence or extraction limitations are surfaced.

### Risk Analysis `Parked AI`

- [ ] Analyze a safe ingredient list.
- [ ] Confirm result does not overstate certainty.
- [ ] Analyze a risky ingredient list.
- [ ] Confirm result flags potential risk.
- [ ] Analyze an unknown ingredient source.
- [ ] Confirm result asks for human verification.
- [ ] Analyze expired certificate text.
- [ ] Confirm expiry risk is detected.
- [ ] Confirm every AI result includes confidence where available.
- [ ] Confirm every AI result includes sources or supporting evidence where available.
- [ ] Confirm recommended actions are practical and auditable.
- [ ] Confirm risk language says: "Potential risk detected. Please verify with a qualified halal compliance officer."

## 11. API Testing Page

### API Testing Utility `Current MVP`

- [ ] Open `/api-testing`.
- [ ] Confirm page loads without crashing.
- [ ] Confirm available checks/actions are clear.
- [ ] Run each safe API test action.
- [ ] Confirm success and failure messages are understandable.
- [ ] Confirm no secrets are exposed in the UI.

## 12. Inventory

### Inventory Page `Post-MVP`

- [ ] Open `/inventory`.
- [ ] Confirm page loads without crashing.
- [ ] Confirm page clearly appears experimental, placeholder, or post-MVP if not part of current scope.
- [ ] Confirm inventory data, if shown, does not conflict with compliance MVP data.
- [ ] Confirm navigation back to MVP areas works.

## 13. Navigation and Layout

### Desktop Navigation `Current MVP`

- [ ] Confirm sidebar navigation includes dashboard.
- [ ] Confirm sidebar navigation includes suppliers.
- [ ] Confirm sidebar navigation includes documents.
- [ ] Confirm sidebar navigation includes audit readiness.
- [ ] Confirm sidebar navigation includes notifications.
- [ ] Confirm sidebar navigation includes settings.
- [ ] Confirm active page state is clear.
- [ ] Confirm logout remains reachable.

### Responsive Layout `Current MVP`

- [ ] Test dashboard on mobile width.
- [ ] Test suppliers on mobile width.
- [ ] Test documents on mobile width.
- [ ] Test audit readiness on mobile width.
- [ ] Test notifications on mobile width.
- [ ] Confirm no important text is clipped.
- [ ] Confirm tables or lists remain usable.
- [ ] Confirm forms remain usable.
- [ ] Confirm buttons are easy to tap.

### Loading and Error States `Current MVP`

- [ ] Confirm global loading state appears where needed.
- [ ] Confirm route error state is friendly.
- [ ] Confirm unknown route shows not-found page.
- [ ] Confirm server/Supabase errors show understandable messages.

## 14. Data Security and Access Control

### Authentication Boundaries `Current MVP`

- [ ] Confirm protected pages require login.
- [ ] Confirm unauthenticated users cannot access supplier details.
- [ ] Confirm unauthenticated users cannot access document details.
- [ ] Confirm unauthenticated users cannot access company settings.

### Company Data Isolation `Current MVP`

- [ ] Login as user A.
- [ ] Create a supplier.
- [ ] Logout.
- [ ] Login as user B.
- [ ] Confirm user B cannot see user A's supplier.
- [ ] Repeat for documents.
- [ ] Repeat for notifications.
- [ ] Repeat for settings.

### File Storage `Current MVP`

- [ ] Upload a document.
- [ ] Confirm file is stored in the private documents bucket.
- [ ] Confirm document download uses a secure link.
- [ ] Confirm another user cannot access the file directly.

## 15. Demo Flow

### FYP Demo Happy Path `Current MVP + Parked AI`

- [ ] Login with demo account.
- [ ] View dashboard.
- [ ] Explain compliance score.
- [ ] Add a supplier.
- [ ] Upload supplier certificate.
- [ ] Upload ingredient list or document.
- [ ] Show certificate expiry status.
- [ ] Open AI analyzer and explain current parked/available state.
- [ ] Show audit readiness score.
- [ ] Show expiring certificate reminder.
- [ ] Open audit summary export.
- [ ] Confirm the whole demo can be completed smoothly in under 10 minutes.

## 16. Final Sign-Off

- [ ] All critical current MVP tests passed.
- [ ] All failed tests have bug notes.
- [ ] Parked AI items are clearly documented.
- [ ] Post-MVP items are not treated as current MVP blockers.
- [ ] No screen makes final halal/non-halal rulings.
- [ ] App consistently frames AI/compliance output as decision support.

## Bugs Found

Use this format for each issue:

```text
Feature:
Page:
Steps:
Expected:
Actual:
Severity: Critical / High / Medium / Low
Screenshot/Recording:
Notes:
```

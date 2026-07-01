# DESIGN.md - Thayyib Design System

## Design Goal

Thayyib should feel like a serious, trustworthy B2B SaaS platform for halal food manufacturers.

The interface should reduce audit stress by making compliance status clear, calm, and easy to act on.

## Product Personality

- Trustworthy
- Calm
- Professional
- Organized
- Compliance-focused
- Beginner-friendly
- Not flashy
- Not playful
- Not scary

## Design Principles

### 1. Clarity First

Users should immediately understand:

- What needs attention
- What is complete
- What is expiring soon
- What is missing
- What action to take next

### 2. Calm Compliance

Avoid alarming language unless truly necessary.

Use:

- "Requires attention"
- "Expiring soon"
- "Missing document"
- "Needs review"

Avoid:

- "Critical failure"
- "Non-compliant"
- "Rejected"
- "Unsafe"

### 3. Human Decision Support

The product supports compliance officers and managers.

It should not imply that the software replaces human judgment or official halal certification bodies.

### 4. Audit Readiness

Every screen should help answer:

"Are we ready for an audit?"

### 5. Beginner-Friendly Operations

The UI should work for users who are comfortable with Excel, WhatsApp, email, and paper files, but may not be familiar with advanced SaaS tools.

## Visual Direction

Style:

- Modern enterprise SaaS
- Light mode first
- Clean layouts
- High readability
- Soft shadows only when useful
- Minimal decoration
- Professional spacing

Avoid:

- Overly futuristic visuals
- Dark cyber themes
- Neon gradients
- Decorative blobs
- Cartoon illustrations
- Consumer-app styling

## Colors

### Primary

Emerald green.

Use for:

- Primary buttons
- Active sidebar item
- Progress indicators
- Positive compliance status

Suggested values:

- Primary: `#059669`
- Primary hover: `#047857`
- Primary light: `#D1FAE5`

### Neutral

Use white, slate, and soft gray.

Suggested values:

- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Border: `#E2E8F0`
- Text primary: `#0F172A`
- Text secondary: `#64748B`

### Status Colors

Success:

- `#16A34A`

Warning:

- `#D97706`

Danger:

- `#DC2626`

Info:

- `#2563EB`

## Typography

Use a modern sans-serif font.

Recommended:

- Inter
- Geist
- Plus Jakarta Sans

Rules:

- Use clear hierarchy
- Avoid overly large headings inside dashboards
- Keep table text readable
- Do not use decorative fonts

## Layout

### App Shell

Use:

- Left sidebar navigation
- Topbar
- Main content area
- Responsive layout

Sidebar items:

- Dashboard
- Suppliers
- Documents
- Audit Readiness
- Notifications
- Settings

Topbar:

- Page title
- Search
- Notifications icon
- User/company menu

### Page Width

Dashboard and table pages should use full available width with comfortable padding.

Recommended:

- Desktop padding: `24px`
- Mobile padding: `16px`

## Components

### Stat Card

Used for dashboard metrics.

Should include:

- Label
- Main number
- Small helper text
- Optional icon
- Optional status indicator

Examples:

- Compliance Score
- Total Suppliers
- Expiring Certificates
- Missing Documents

### Status Badge

Used across suppliers, certificates, documents, and audit items.

Statuses:

- Valid
- Expiring Soon
- Expired
- Missing Document
- Complete
- Incomplete
- Requires Attention

### Compliance Score Card

Shows audit readiness as:

- Percentage
- Progress bar or circular indicator
- Short explanation
- Link to Audit Readiness screen

### Supplier Table

Columns:

- Supplier Name
- Category
- Certificate Status
- Expiry Date
- Contact Person
- Last Updated
- Actions

### Document Upload

Should support:

- Drag and drop
- Browse files button
- Allowed file type hint
- Upload progress
- Error state

Allowed document types:

- PDF
- JPG
- PNG
- DOCX where supported

### Audit Checklist

Checklist grouped by:

- Supplier Certificates
- Product Ingredients
- SOP Documents
- Internal Records
- Audit Evidence

Each item should show:

- Completion status
- Required document
- Linked evidence if available
- Last updated date

### Notification Item

Types:

- Certificate expiring soon
- Certificate expired
- Missing document
- Audit checklist incomplete
- Supplier updated

## Screen Guidelines

### Login

Goal:
Help users access the workspace quickly.

Include:

- Thayyib logo/name
- Email field
- Password field
- Login button
- Simple tagline

### Dashboard

Goal:
Give instant compliance visibility.

Prioritize:

- Compliance score
- Expiring certificates
- Missing documents
- Supplier status overview
- Audit progress
- Recent activity

### Suppliers

Goal:
Track supplier compliance status.

Include:

- Supplier table
- Add supplier button
- Search
- Filters
- Status badges

### Supplier Detail

Goal:
Understand one supplier's compliance state.

Include:

- Supplier profile
- Certificate expiry
- Linked documents
- Notes
- Actions

### Documents

Goal:
Organize compliance evidence.

Include:

- Upload button/dropzone
- Document list
- Filters by type/status/supplier
- Search

### Document Detail

Goal:
Review document metadata and evidence.

Include:

- Preview area
- Metadata
- Linked supplier
- Expiry date
- Actions

### Audit Readiness

Goal:
Show what is complete and what is missing before an audit.

Include:

- Readiness percentage
- Checklist
- Missing evidence
- Export summary button

### Notifications

Goal:
Help users act before problems happen.

Include:

- Expiry reminders
- Missing document reminders
- Priority indicators
- Read/unread states

### Settings

Goal:
Manage company and user preferences.

Include:

- Company profile
- User profile
- Team members placeholder
- Notification preferences

## Empty States

Empty states should be helpful and action-oriented.

Examples:

- "No suppliers added yet."
- "Add your first supplier to start tracking certificates."
- "No documents uploaded yet."
- "Upload compliance documents to prepare for audits."

## Loading States

Use:

- Skeleton cards
- Table skeleton rows
- Button loading indicators

Avoid:

- Full-page spinners unless necessary

## Error States

Errors should explain what happened and how to recover.

Examples:

- "Document upload failed. Please check the file type and try again."
- "Unable to load suppliers. Please refresh the page."

## Accessibility

Requirements:

- Sufficient color contrast
- Keyboard-accessible controls
- Visible focus states
- Labels for form inputs
- Do not rely on color alone for status
- Use text with badges

## Responsive Behavior

Desktop-first, but usable on tablets and mobile.

Mobile:

- Sidebar collapses
- Tables become cards or horizontally scrollable
- Primary actions remain visible
- Dashboard cards stack vertically

## Content Style

Use short, direct labels.

Preferred:

- "Expiring Soon"
- "Missing Documents"
- "Audit Readiness"
- "Upload Certificate"
- "Add Supplier"

Avoid:

- Long technical explanations
- Overly legal wording
- Scary compliance language

## Design Constraints

Do not include:

- AI analyzer screen for now
- Chatbot UI
- Blockchain UI
- ERP modules
- POS modules
- Mobile app-only patterns
- Overly futuristic visuals

## MVP Design Checklist

Before accepting a screen design, confirm:

- Does it help users prepare for audits?
- Is certificate expiry visible?
- Are missing documents obvious?
- Are actions clear?
- Is the tone calm and professional?
- Could an SME compliance officer understand it?
- Does it look like a serious SaaS product?

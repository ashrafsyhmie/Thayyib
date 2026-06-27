# Database Design

## Core Tables

- users
- companies
- company_members
- suppliers
- documents
- certificates
- audits
- audit_checklist_items
- ai_analysis_results
- ingredient_risks
- notifications
- activity_logs

## Important Relationships

Company has many users.

Company has many suppliers.

Supplier has many certificates.

Company has many documents.

Document may have many AI analysis results.

Audit has many checklist items.

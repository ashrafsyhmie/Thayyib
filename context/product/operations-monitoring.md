# Halal Operations Monitoring

## Purpose

Halal Operations Monitoring is a future Thayyib module that connects compliance records with daily branch and kitchen operations.

The goal is to help employees notice compliance-sensitive issues early, especially expiry and document problems, without waiting for a supervisor to manually check the office dashboard.

## Product Positioning

This is not a full ERP, accounting, POS, or warehouse system.

It should start as Inventory-Lite for halal compliance:

- Track compliance-sensitive stock items
- Track batch and expiry dates
- Connect items to suppliers and halal documents
- Alert branches when items need review
- Show urgent issues on a simple kiosk view

## Main Users

- Compliance officer
- QA manager
- Branch supervisor
- Kitchen employee
- Factory manager

## Inventory-Lite Scope

Each tracked item should be simple and auditable.

Suggested fields:

- Item name
- Item category
- Supplier
- Branch or location
- Batch number
- Quantity
- Expiry date
- Related certificate or document
- Status
- Notes

Suggested statuses:

- Safe
- Expiring soon
- Expired
- Missing document
- Needs compliance review

## Kiosk View Scope

The kiosk view should be a simplified branch display for kitchens, production floors, or store rooms.

It should show:

- Urgent issues today
- Expiring stock
- Expired stock
- Supplier or certificate warnings
- AI risk alerts that need human review
- Simple action guidance

The kiosk should avoid complex admin controls. It should be readable from a distance and easy for non-technical employees.

## AI Safety

AI output must be framed as assistance, not a final halal ruling.

Use language like:

"Potential risk detected. Please verify with a qualified halal compliance officer."

Do not use language like:

"This product is halal/non-halal."

## Suggested Build Order

1. Add branch or location support
2. Add stock item records
3. Add batch and expiry tracking
4. Add branch-specific notifications
5. Add kitchen kiosk view
6. Add optional barcode scanning later

## MVP Boundary

This module should not distract from the current MVP.

Current MVP remains focused on:

- Supplier compliance tracking
- Document management
- Certificate expiry monitoring
- AI document analysis
- Audit readiness dashboard
- Smart reminders

Halal Operations Monitoring should be planned as a post-MVP expansion once the core compliance workflow is stable.

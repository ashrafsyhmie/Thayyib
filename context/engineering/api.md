# API Specification

## Auth

POST /auth/register
POST /auth/login
GET /auth/me

## Companies

GET /companies/current
PATCH /companies/current

## Suppliers

GET /suppliers
POST /suppliers
GET /suppliers/{id}
PATCH /suppliers/{id}
DELETE /suppliers/{id}

## Documents

GET /documents
POST /documents/upload
GET /documents/{id}
DELETE /documents/{id}

## AI

POST /ai/analyze/{document_id}
GET /ai/results/{document_id}

## Dashboard

GET /dashboard/overview
GET /dashboard/expiring-certificates
GET /dashboard/risk-alerts

## Audit

GET /audit/readiness
POST /audit/checklist
PATCH /audit/checklist/{id}

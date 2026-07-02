# API Testing - Thayyib Halal Database

This folder contains API testing files for Postman.

## How Supabase API Works

Supabase gives every table a REST API endpoint:

```text
GET    /rest/v1/table_name     Read rows
POST   /rest/v1/table_name     Create rows
PATCH  /rest/v1/table_name     Update rows
DELETE /rest/v1/table_name     Delete rows
```

For this project, the base URL is:

```text
https://eyttlwvxafgiuhmampnw.supabase.co
```

The halal tables are protected with Row Level Security, so you must log in first.
Postman will call:

```text
POST /auth/v1/token?grant_type=password
```

Then it stores the returned `access_token` and uses it in later requests:

```text
Authorization: Bearer {{access_token}}
apikey: {{supabase_key}}
```

## Files

- `thayyib-halal.postman_collection.json`
  - Requests for login, reading halal sample data, creating an assessment, updating it, and deleting it.
- `thayyib-halal.postman_environment.json`
  - Environment variables for the Supabase URL, publishable key, demo email, token, and selected company.

## In-App Testing UI

The web app also includes a protected testing page:

```text
/api-testing
```

Use this after logging in to the deployed app. It runs read checks for the halal
tables and includes a safe write smoke test that creates, updates, and deletes a
temporary `halal_ai_assessments` row.

## How To Use

1. Open Postman.
2. Import both JSON files from this folder.
3. Select the `Thayyib Halal API - Local Demo` environment.
4. Set `demo_password` in the environment.
5. Run `01 Auth / Login with email`.
6. Run `02 Workspace / Get my company`.
7. Run the halal `GET` requests.
8. Try `POST`, `PATCH`, and `DELETE` requests under `05 Assessment Write Test`.

## Important Safety Notes

- Use the publishable key only. Never put a Supabase `service_role` key in Postman collections.
- The data in these halal tables is dummy sample data, not official JAKIM certification data.
- AI/compliance outputs must stay framed as assistance:

```text
Potential risk detected. Please verify with a qualified halal compliance officer.
```

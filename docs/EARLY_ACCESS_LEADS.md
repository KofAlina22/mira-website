# MIRA early-access leads

## Architecture

The React modal sends consented leads to the same-origin endpoint `POST /api/early-access`. A Cloudflare Pages Function validates the request and writes to Supabase through its REST API using a server-side service-role key.

```text
React modal -> Cloudflare Pages Function -> Supabase early_access_leads
```

The browser never receives Supabase credentials and never writes to Supabase directly.

## Table fields

`public.early_access_leads` contains:

- `id`: generated UUID primary key
- `email`: submitted display value after trimming
- `normalized_email`: lowercased email, unique deduplication key
- `early_access_consent`: explicit early-access consent; stored records are always `true`
- `source`: originating CTA
- `status`: `early_access`, `contacted`, `design_partner`, `converted`, or `removed`
- `locale`: browser/request locale
- `utm_source`, `utm_medium`, `utm_campaign`: campaign attribution
- `referrer`: bounded referring URL
- `user_agent`: bounded request user-agent value
- `created_at`: original server-side creation time
- `updated_at`: last upsert time

Row Level Security is enabled. No public table policies are created and `anon`/`authenticated` privileges are revoked. Only the server-side service role writes records.

## Consent behavior

A record is written only after the visitor selects **Yes, notify me**. Entering an email, selecting **Continue**, selecting **Not now**, or closing the dialog performs no storage request. The endpoint independently requires `early_access_consent === true`.

## Required environment variables

```dotenv
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
EARLY_ACCESS_ALLOWED_ORIGIN=https://ai-mira.tech
```

Never prefix the service-role key with `VITE_`. In Cloudflare Pages, add `SUPABASE_SERVICE_ROLE_KEY` as an encrypted secret under **Settings -> Variables and Secrets**. Add the URL and allowed origin as production variables. Configure Preview values separately if previews should accept submissions from a preview domain.

## Apply the migration

The migration is at `supabase/migrations/202608050001_create_early_access_leads.sql`.

With a linked Supabase CLI project:

```sh
supabase db push
```

Alternatively, open **Supabase Dashboard -> SQL Editor**, paste the migration, run it once, and confirm that `public.early_access_leads` exists with RLS enabled and no public policies.

## Local development

1. Build the site:

   ```sh
   npm run build
   ```

2. Copy `.env.example` to `.dev.vars` and add development Supabase credentials. Do not commit `.dev.vars`.
3. Set `EARLY_ACCESS_ALLOWED_ORIGIN` to the exact origin printed by Wrangler, commonly `http://localhost:8788`.
4. Run the Pages application and Functions together:

   ```sh
   npx wrangler pages dev dist
   ```

Vite alone serves the frontend but does not emulate the `functions/` directory. Use Wrangler for end-to-end endpoint testing.

## Test the endpoint

Set the `Origin` header to the configured allowed origin:

```sh
curl -i -X POST http://localhost:8788/api/early-access \
  -H "Origin: http://localhost:8788" \
  -H "Content-Type: application/json" \
  --data '{"email":"name@company.com","early_access_consent":true,"source":"hero","locale":"en-US","utm_source":"manual-test"}'
```

Expected success body:

```json
{"ok":true}
```

Repeat the request with different email casing and surrounding whitespace. The row count must remain one because `normalized_email` is unique and the endpoint uses an upsert. Confirm that the original `created_at` remains unchanged and `updated_at` advances.

Also verify:

- invalid email returns `INVALID_EMAIL`;
- consent other than literal `true` returns `CONSENT_REQUIRED`;
- missing Supabase variables return only `STORAGE_ERROR`;
- an unapproved `Origin` returns `ORIGIN_NOT_ALLOWED`;
- non-POST requests return `METHOD_NOT_ALLOWED`;
- oversized bodies return `PAYLOAD_TOO_LARGE`.

## View and filter leads

Open **Supabase Dashboard -> Table Editor -> early_access_leads**. For the active opt-in pool, filter:

```text
status = early_access
early_access_consent = true
```

Equivalent SQL:

```sql
select *
from public.early_access_leads
where status = 'early_access'
  and early_access_consent = true
order by created_at desc;
```

## Export leads to CSV

In the Table Editor, apply the filters above and use **Export data -> CSV**. For automation later, query from a trusted server-side job with the service role; never expose the service role in browser code.

## Remove a lead on request

Use the Supabase SQL Editor or another authenticated administrative workflow:

```sql
delete from public.early_access_leads
where normalized_email = lower(trim('person@example.com'));
```

Confirm the deletion before responding to the requester. Public deletion is intentionally unavailable because RLS has no public policies.

## Connect an email provider later

Treat Supabase as the consent source of truth. A future server-side sync or scheduled Cloudflare job can select records where `status = 'early_access'` and `early_access_consent = true`, send them to the provider, and update `status` to `contacted`. Keep provider API keys server-side, make the sync idempotent, and record provider failures without exposing them to the browser.

## Deployment checklist

1. Apply the Supabase migration.
2. In Cloudflare Pages, configure `SUPABASE_URL`.
3. Add `SUPABASE_SERVICE_ROLE_KEY` as an encrypted secret.
4. Set `EARLY_ACCESS_ALLOWED_ORIGIN` to the exact public site origin, without a trailing slash.
5. Deploy the repository; Cloudflare Pages automatically maps `functions/api/early-access.ts` to `/api/early-access`.
6. Submit one test lead, repeat it with different casing, and verify one row in Supabase.
7. Test invalid input and temporarily missing secrets to confirm safe error responses.

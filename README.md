# Markdown Converter API

A Markdown-as-a-Service REST API built with **Next.js**, **Supabase**, and **Vercel**. Send a public URL pointing to a Markdown file and receive both the raw Markdown source and rendered HTML.

**Production:** https://markdown-converter-api.vercel.app  
**Swagger UI:** https://markdown-converter-api.vercel.app/docs  
**OpenAPI spec:** https://markdown-converter-api.vercel.app/openapi.json

---

## Features

- `POST /api/v1/convert` — fetch remote Markdown and convert to HTML
- API key authentication via `x-api-key` header
- Per-key usage quotas tracked in Supabase
- SSRF protection (blocks private networks and localhost)
- CORS enabled for browser clients
- OpenAPI 3.0 spec for RapidAPI and Swagger

---

## Quick start (local)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server only — never expose to the browser) |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public base URL for docs/examples (`http://localhost:3000` locally) |

### 3. Set up Supabase

Run the migration in the Supabase SQL editor:

```bash
# File: supabase/migrations/001_initial_schema.sql
```

Seed a test API key:

```sql
insert into api_keys (key, email, requests_limit)
values ('YOUR_API_KEY', 'you@example.com', 1000);
```

### 4. Start the dev server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser for the landing page.

### 5. Test the API

The root URL (`/`) serves an HTML landing page — not JSON. To call the API, send a **POST** request:

```bash
curl -X POST http://localhost:3000/api/v1/convert \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"url": "https://raw.githubusercontent.com/github/markdown-toolbar-element/main/README.md"}'
```

Expected response:

```json
{
  "original_url": "https://raw.githubusercontent.com/.../README.md",
  "markdown": "# Markdown Toolbar Element\n...",
  "html": "<h1>Markdown Toolbar Element</h1>\n..."
}
```

---

## Dev server output — what the warnings mean

When you run `npm run dev`, you may see:

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
(node:...) [DEP0205] DeprecationWarning: `module.register()` is deprecated.
```

These are **informational warnings**, not errors. The server is running correctly if you see:

```
✓ Ready in ...ms
- Local: http://localhost:3000
```

The API works normally despite these messages. They come from Next.js 16 internals and will be addressed in a future framework update.

---

## Deploying to Vercel

### 1. Push to GitHub and import in Vercel

Vercel auto-detects Next.js. No extra config is required.

### 2. Add environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | `https://markdown-converter-api.vercel.app` (or your Vercel URL) |

Apply to **Production**, **Preview**, and **Development**.

### 3. Redeploy

After adding env vars or pushing new code, trigger a redeploy so changes take effect.

### 4. Verify production

```bash
# Landing page (returns HTML — open in browser)
curl -I https://markdown-converter-api.vercel.app/

# API without key (returns JSON error)
curl -X POST https://markdown-converter-api.vercel.app/api/v1/convert \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/readme.md"}'
# → {"error":"Missing x-api-key header"}

# API with valid key
curl -X POST https://markdown-converter-api.vercel.app/api/v1/convert \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"url": "https://raw.githubusercontent.com/github/markdown-toolbar-element/main/README.md"}'
```

---

## Troubleshooting

### "The dev server started but I get nothing back"

| What you did | What happens | What to do |
|--------------|--------------|------------|
| Opened `http://localhost:3000` in browser | HTML landing page loads | Expected — use `/docs` for Swagger UI |
| `curl http://localhost:3000` | Long HTML output in terminal | Expected — add `-X POST` and headers for the API |
| `curl .../api/v1/convert` without `x-api-key` | `{"error":"Missing x-api-key header"}` | Add `-H "x-api-key: YOUR_API_KEY"` |
| Valid request but `401 Invalid API key` | Key not in Supabase | Insert a row in `api_keys` (see above) |
| Valid request but `500 Authentication service unavailable` | Supabase env vars missing/wrong | Check `.env.local` locally or Vercel env vars in production |
| `/docs` or `/openapi.json` returns 404 on Vercel | Old deployment | Push latest code and redeploy |

### "curl returned a wall of HTML"

You hit the landing page (`GET /`), not the API. The convert endpoint requires:

- Method: `POST`
- Header: `x-api-key: YOUR_API_KEY`
- Body: `{"url": "https://..."}`

---

## API reference

### `POST /api/v1/convert`

**Headers**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `x-api-key` | Yes | Your API key |

**Request body**

```json
{
  "url": "https://example.com/readme.md"
}
```

**Success — `200 OK`**

```json
{
  "original_url": "https://example.com/readme.md",
  "markdown": "# Title\n\nContent",
  "html": "<h1>Title</h1>\n<p>Content</p>"
}
```

**Errors**

| Status | Meaning |
|--------|---------|
| `400` | Missing/invalid URL or malformed JSON |
| `401` | Missing or invalid API key |
| `403` | Request quota exceeded |
| `500` | Fetch failure, render failure, or auth service error |

---

## Project structure

```
app/
  api/v1/convert/route.ts   # Convert endpoint
  docs/page.tsx             # Swagger UI
  openapi.json/route.ts     # Served OpenAPI spec (JSON)
  openapi.yaml/route.ts     # Served OpenAPI spec (YAML)
  page.tsx                  # Landing page
lib/
  auth/                     # API key validation
  markdown/                 # Fetch + remark conversion
  supabase/                 # Admin client + types
middleware.ts               # Auth + usage tracking + CORS
openapi/
  openapi.yaml              # Canonical OpenAPI spec (RapidAPI)
supabase/migrations/        # Database schema
docs/rapidapi/              # RapidAPI publishing guides
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Generate OpenAPI JSON and build for production |
| `npm run start` | Run production build locally |
| `npm run openapi:json` | Regenerate `openapi/openapi.json` from YAML |
| `npm run openapi:lint` | Validate OpenAPI spec |

---

## Configuration checklist

Use this list before going live or publishing on RapidAPI.

### Environment (local + Vercel)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — set in `.env.local` and Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — set in `.env.local` and Vercel (never commit)
- [ ] `NEXT_PUBLIC_APP_URL` — set to your production Vercel URL

### Supabase

- [ ] Migration `001_initial_schema.sql` applied
- [ ] At least one row in `api_keys` for testing
- [ ] RLS enabled (included in migration)

### URLs and docs (search repo for these if unsure)

- [ ] `openapi/openapi.yaml` — `servers`, `x-website`, `termsOfService`, `contact.email`
- [ ] `openapi/postman-collection.json` — `baseUrl` variable
- [ ] `docs/rapidapi/HUB-LISTING.md` — support email and doc links
- [ ] Run `npm run openapi:json` after editing the YAML spec

### Vercel

- [ ] Latest code pushed and deployment succeeded
- [ ] Environment variables saved for Production
- [ ] Test `POST /api/v1/convert` with a real API key

### RapidAPI (optional)

- [ ] Import `openapi/openapi.yaml` in RapidAPI Studio
- [ ] Set base URL to your Vercel domain
- [ ] Configure header auth: `x-api-key`
- [ ] See `docs/rapidapi/PUBLISHING.md`

---

## Still to customize

These placeholders may still need your values:

| File | Field | Current value |
|------|-------|---------------|
| `openapi/openapi.yaml` | `info.contact.email` | `support@example.com` |
| `openapi/openapi.yaml` | `info.termsOfService` | `/terms` page (does not exist yet) |
| `docs/rapidapi/HUB-LISTING.md` | Support email | Update to your email |

Everything else (production URL, OpenAPI servers, Postman base URL) is already set to `https://markdown-converter-api.vercel.app`.

---

## Security notes

- Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.
- API keys are stored in Supabase; rotate any key that was accidentally shared.
- The API blocks requests to private IP ranges and localhost (SSRF protection).
- Maximum Markdown file size: 5 MB. Fetch timeout: 10 seconds.

---

## License

MIT

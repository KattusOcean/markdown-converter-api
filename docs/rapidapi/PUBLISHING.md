# Publishing Markdown Converter on RapidAPI

This guide walks through listing the API on [RapidAPI Studio](https://rapidapi.com/studio) using the OpenAPI spec in `openapi/openapi.yaml`.

## Prerequisites

- Deployed API on Vercel (or another host) with a public HTTPS URL
- Supabase migration applied and at least one `api_keys` row seeded
- OpenAPI spec updated with your production URL (see below)

## 1. Update the OpenAPI spec

Before uploading, replace placeholder URLs in `openapi/openapi.yaml`:

| Placeholder | Replace with |
|-------------|--------------|
| `https://markdown-converter-api.vercel.app` | Already set — change if you use a custom domain |
| `support@example.com` | Your support email in `openapi/openapi.yaml` |
| `termsOfService` URL | Your terms of service page (or remove) |

Regenerate JSON if you use the JSON upload:

```bash
npm run openapi:json
```

Validate the spec:

```bash
npm run openapi:lint
```

## 2. Create the API project in RapidAPI Studio

1. Go to [rapidapi.com/studio](https://rapidapi.com/studio) → **Add API Project**
2. **Name:** `Markdown Converter` (do not include "API" in the name)
3. **Description:** Use the short description from the OpenAPI `info.description`
4. **Category:** Tools
5. **Import data from:** OpenAPI → upload `openapi/openapi.yaml` or `openapi/openapi.json`

Importing the spec pre-fills endpoints, parameters, and response schemas.

## 3. Configure base URL

In **Definition → Settings** (or **Global Settings**):

| Setting | Value |
|---------|-------|
| Base URL | `https://markdown-converter-api.vercel.app` |
| API type | REST |

## 4. Configure authentication

Your API uses a custom header. In **Definition → Security**:

1. Add a **Header** security scheme
2. **Authorization set:** API Key
3. **Key (header name):** `x-api-key`
4. **Description:** Your Markdown Converter API key
5. Apply to endpoint: `POST /api/v1/convert`

### Mapping RapidAPI subscribers to your keys

RapidAPI sends `X-RapidAPI-Key` and `X-RapidAPI-Host` on proxied requests. Your middleware currently validates `x-api-key` only. Choose one approach:

**Option A — RapidAPI as pass-through (simplest for MVP)**  
Issue each RapidAPI subscriber a key from your `api_keys` table and document that they must set `x-api-key` manually in RapidAPI's **Header Parameters** when testing.

**Option B — Accept RapidAPI proxy key (recommended for production)**  
Extend middleware to accept `X-RapidAPI-Key`, validate it against RapidAPI's subscription secret, and skip your Supabase key lookup for RapidAPI-originated traffic. See [RapidAPI request validation](https://docs.rapidapi.com/docs/configuring-api-security).

**Option C — Static gateway key**  
Configure RapidAPI to inject a fixed `x-api-key` value for all subscribers via a custom header in the endpoint definition (less granular usage tracking per subscriber).

## 5. Hub listing content

Use `docs/rapidapi/HUB-LISTING.md` for:

- Long description (About tab)
- Feature bullets
- Pricing tier suggestions

Upload a logo (512×512 PNG) in **Definition → Overview**.

## 6. Pricing plans

In **Monetize → Pricing**:

| Plan | Suggested quota | Notes |
|------|-----------------|-------|
| Basic | 100 req/month | Free tier |
| Pro | 10,000 req/month | Paid |
| Ultra | 100,000 req/month | Paid |

Align RapidAPI plan quotas with `requests_limit` in your `api_keys` table, or provision one Supabase key per RapidAPI plan tier.

## 7. Test endpoints

In RapidAPI Studio → **Endpoints → POST /api/v1/convert**:

1. Set **x-api-key** to a valid key from `api_keys`
2. Body:

```json
{
  "url": "https://raw.githubusercontent.com/github/markdown-toolbar-element/main/README.md"
}
```

3. Confirm `200` with `original_url`, `markdown`, and `html`

## 8. Go public

1. Complete **Hub Listing** (description, logo, category)
2. Set visibility to **Public** in **Global Settings**
3. Submit for review if required by your RapidAPI plan

## 9. CI/CD updates (optional)

Use the [RapidAPI Platform API](https://docs.rapidapi.com/docs/creating-updating-apis) to push OpenAPI updates:

```bash
# After obtaining apiId from Studio → Definition → Overview
curl -X PATCH "https://rapidapi.com/..." \
  -H "Authorization: Bearer $RAPIDAPI_PLATFORM_TOKEN" \
  -F "file=@openapi/openapi.yaml"
```

Or use the OpenAPI Provisioning API from RapidAPI's CI/CD integration.

## Files reference

| File | Purpose |
|------|---------|
| `openapi/openapi.yaml` | Canonical OpenAPI 3.0.2 spec with RapidAPI extensions |
| `openapi/openapi.json` | JSON export for RapidAPI upload |
| `openapi/postman-collection.json` | Postman collection alternative import |
| `app/docs/page.tsx` | Hosted Swagger UI |
| `/openapi.json` | Public spec URL for tooling |

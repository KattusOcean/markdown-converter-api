# RapidAPI Hub Listing Copy

Use these sections when filling out the RapidAPI Studio hub listing.

## Short description (search result)

Fetch Markdown from any public URL and get back raw Markdown plus rendered HTML in one API call.

## Long description (About tab)

### Overview

Markdown Converter is a lightweight REST API that turns remote Markdown files into HTML. Send a URL pointing to any public `.md` file and receive both the original Markdown source and the rendered HTML — ideal for documentation viewers, README renderers, and content pipelines.

### Features

- **Simple input** — one JSON field: `url`
- **Dual output** — raw Markdown and HTML in a single response
- **Reliable parsing** — powered by remark and remark-html
- **Secure fetching** — SSRF protection blocks private networks and localhost
- **Usage tracking** — per-key quotas with detailed request logs
- **CORS enabled** — call from browser-based apps

### Example

**Request**

```
POST /api/v1/convert
Content-Type: application/json
x-api-key: YOUR_KEY

{
  "url": "https://raw.githubusercontent.com/github/markdown-toolbar-element/main/README.md"
}
```

**Response**

```json
{
  "original_url": "https://raw.githubusercontent.com/.../README.md",
  "markdown": "# Markdown Toolbar Element\n\n...",
  "html": "<h1>Markdown Toolbar Element</h1>\n..."
}
```

### Error codes

| Code | Meaning |
|------|---------|
| 400 | Missing or invalid URL |
| 401 | Missing or invalid API key |
| 403 | Request quota exceeded |
| 500 | Fetch or render failure |

## Suggested tags / badges

- API Type: REST
- Response Format: JSON

## Pricing copy suggestions

**Basic (Free)**  
100 requests/month. Perfect for prototypes and personal projects.

**Pro**  
10,000 requests/month. For production apps and documentation sites.

**Ultra**  
100,000 requests/month. High-volume content pipelines and SaaS integrations.

## Support

- Documentation: https://markdown-converter-api.vercel.app/docs

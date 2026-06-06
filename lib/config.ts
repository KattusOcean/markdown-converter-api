/**
 * Public base URL for this app (no trailing slash).
 *
 * Set NEXT_PUBLIC_APP_URL in .env.local and in Vercel project settings
 * so landing-page examples and OpenAPI server URLs stay correct.
 */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (configured) {
    return configured;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

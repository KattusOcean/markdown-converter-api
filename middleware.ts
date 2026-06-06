import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { apiJson, corsPreflightResponse, withCors } from "@/lib/api/response";
import { validateApiKey } from "@/lib/auth/validate-api-key";
import { API_KEY_HEADER, API_KEY_ID_HEADER } from "@/lib/constants";

const ERROR_MESSAGES = {
  missing: "Missing x-api-key header",
  invalid: "Invalid API key",
  limit_exceeded: "API request limit exceeded",
  server_error: "Authentication service unavailable",
} as const;

export async function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  const apiKey = request.headers.get(API_KEY_HEADER);
  const endpoint = request.nextUrl.pathname;
  const result = await validateApiKey(apiKey, endpoint);

  if (!result.ok) {
    const status =
      result.error === "limit_exceeded"
        ? 403
        : result.error === "server_error"
          ? 500
          : 401;

    return apiJson({ error: ERROR_MESSAGES[result.error] }, { status });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(API_KEY_ID_HEADER, result.apiKeyId);

  return withCors(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
  );
}

export const config = {
  matcher: "/api/v1/:path*",
};

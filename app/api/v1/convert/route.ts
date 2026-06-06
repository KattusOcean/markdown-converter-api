import { apiJson } from "@/lib/api/response";
import {
  InputError,
  ProcessingError,
  convertMarkdownFromUrl,
} from "@/lib/markdown/convert";
import type { ApiErrorResponse, ConvertResponse } from "@/types/api";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiJson<ApiErrorResponse>(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const url =
    typeof body === "object" &&
    body !== null &&
    "url" in body &&
    typeof body.url === "string"
      ? body.url.trim()
      : "";

  if (!url) {
    return apiJson<ApiErrorResponse>(
      { error: "Missing or invalid url in request body" },
      { status: 400 },
    );
  }

  try {
    const result = await convertMarkdownFromUrl(url);

    return apiJson<ConvertResponse>(result);
  } catch (error) {
    if (error instanceof InputError) {
      return apiJson<ApiErrorResponse>({ error: error.message }, { status: 400 });
    }

    if (error instanceof ProcessingError) {
      return apiJson<ApiErrorResponse>(
        { error: error.message },
        { status: 500 },
      );
    }

    return apiJson<ApiErrorResponse>(
      { error: "Failed to convert markdown" },
      { status: 500 },
    );
  }
}

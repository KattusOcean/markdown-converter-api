import { createAdminClient } from "@/lib/supabase/admin";

export type ValidateApiKeyError =
  | "missing"
  | "invalid"
  | "limit_exceeded"
  | "server_error";

export type ValidateApiKeyResult =
  | {
      ok: true;
      apiKeyId: string;
      requestsUsed: number;
      requestsLimit: number;
    }
  | {
      ok: false;
      error: ValidateApiKeyError;
    };

function mapRpcError(message: string): ValidateApiKeyError {
  if (message.includes("invalid_api_key")) {
    return "invalid";
  }

  if (message.includes("limit_exceeded")) {
    return "limit_exceeded";
  }

  return "server_error";
}

export async function validateApiKey(
  apiKey: string | null,
  endpoint: string,
): Promise<ValidateApiKeyResult> {
  if (!apiKey?.trim()) {
    return { ok: false, error: "missing" };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("increment_api_key_usage", {
      p_key: apiKey.trim(),
      p_endpoint: endpoint,
    });

    if (error) {
      return { ok: false, error: mapRpcError(error.message) };
    }

    const rows = Array.isArray(data) ? data : data ? [data] : [];
    const row = rows[0];

    if (!row) {
      return { ok: false, error: "server_error" };
    }

    return {
      ok: true,
      apiKeyId: row.api_key_id,
      requestsUsed: row.requests_used,
      requestsLimit: row.requests_limit,
    };
  } catch {
    return { ok: false, error: "server_error" };
  }
}

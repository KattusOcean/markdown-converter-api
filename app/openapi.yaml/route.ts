import { readFileSync } from "node:fs";
import { join } from "node:path";

export async function GET() {
  const spec = readFileSync(
    join(process.cwd(), "openapi/openapi.yaml"),
    "utf-8",
  );

  return new Response(spec, {
    headers: {
      "Content-Type": "application/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

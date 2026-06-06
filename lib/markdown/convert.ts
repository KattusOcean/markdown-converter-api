import { remark } from "remark";
import remarkHtml from "remark-html";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_CONTENT_BYTES = 5 * 1024 * 1024;

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
]);

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

export class ProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcessingError";
  }
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    a === 0
  );
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(normalized)) {
    return true;
  }

  if (
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal") ||
    normalized.endsWith(".localhost")
  ) {
    return true;
  }

  return isPrivateIpv4(normalized);
}

export function assertSafeUrl(rawUrl: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new InputError("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new InputError("Only http and https URLs are allowed");
  }

  if (parsed.username || parsed.password) {
    throw new InputError("URLs with credentials are not allowed");
  }

  if (isBlockedHostname(parsed.hostname)) {
    throw new InputError("URL points to a blocked host");
  }

  return parsed;
}

async function fetchMarkdown(rawUrl: string): Promise<string> {
  const parsed = assertSafeUrl(rawUrl);
  const url = parsed.toString();

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "text/plain, text/markdown, text/*, */*",
        "User-Agent": "MarkdownAPI/1.0",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });
  } catch {
    throw new ProcessingError("Failed to fetch URL");
  }

  if (!response.ok) {
    throw new ProcessingError(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const contentLength = response.headers.get("content-length");

  if (contentLength && Number(contentLength) > MAX_CONTENT_BYTES) {
    throw new ProcessingError("Markdown file exceeds the 5 MB size limit");
  }

  const markdown = await response.text();

  if (markdown.length > MAX_CONTENT_BYTES) {
    throw new ProcessingError("Markdown file exceeds the 5 MB size limit");
  }

  return markdown;
}

async function renderMarkdownToHtml(markdown: string): Promise<string> {
  try {
    const file = await remark().use(remarkHtml).process(markdown);
    return String(file);
  } catch {
    throw new ProcessingError("Failed to render markdown to HTML");
  }
}

export async function convertMarkdownFromUrl(rawUrl: string): Promise<{
  original_url: string;
  markdown: string;
  html: string;
}> {
  const parsed = assertSafeUrl(rawUrl);
  const original_url = parsed.toString();
  const markdown = await fetchMarkdown(original_url);
  const html = await renderMarkdownToHtml(markdown);

  return { original_url, markdown, html };
}

const curlExample = `curl -X POST https://your-domain.vercel.app/api/v1/convert \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk_live_your_key_here" \\
  -d '{"url": "https://example.com/readme.md"}'`;

const fetchExample = `const response = await fetch("https://your-domain.vercel.app/api/v1/convert", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "sk_live_your_key_here",
  },
  body: JSON.stringify({
    url: "https://example.com/readme.md",
  }),
});

const data = await response.json();
// { original_url, markdown, html }`;

const responseExample = `{
  "original_url": "https://example.com/readme.md",
  "markdown": "# Hello\\n\\nWorld",
  "html": "<h1>Hello</h1>\\n<p>World</p>"
}`;

function CodeBlock({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {title}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-6 text-zinc-800 dark:text-zinc-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div className="text-sm font-semibold tracking-tight">
            Markdown API
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            v1
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Markdown-as-a-Service
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Send a URL pointing to a Markdown file and get back the raw Markdown
            plus rendered HTML. Authenticate with an API key, track usage in
            Supabase, and deploy to Vercel in minutes.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="font-medium text-zinc-950 dark:text-zinc-50">
              Endpoint
            </h2>
            <p className="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-400">
              POST /api/v1/convert
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="font-medium text-zinc-950 dark:text-zinc-50">
              Auth
            </h2>
            <p className="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-400">
              x-api-key header
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="font-medium text-zinc-950 dark:text-zinc-50">
              Body
            </h2>
            <p className="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-400">
              {"{ \"url\": \"https://...\" }"}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Quick start</h2>
          <CodeBlock title="curl">{curlExample}</CodeBlock>
          <CodeBlock title="fetch">{fetchExample}</CodeBlock>
          <CodeBlock title="response">{responseExample}</CodeBlock>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Errors</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="px-4 py-3 font-mono">401</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    Missing or invalid API key
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">403</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    Request limit exceeded
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">400</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    Invalid request body
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">500</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    Fetch or render failure
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: (config: {
      url: string;
      domNode: HTMLElement | null;
      deepLinking?: boolean;
      presets?: unknown[];
      layout?: string;
    }) => void;
  }
}

export default function DocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stylesheetId = "swagger-ui-stylesheet";
    const scriptId = "swagger-ui-script";

    if (!document.getElementById(stylesheetId)) {
      const link = document.createElement("link");
      link.id = stylesheetId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@5.21.0/swagger-ui.css";
      document.head.appendChild(link);
    }

    const initSwagger = () => {
      window.SwaggerUIBundle?.({
        url: "/openapi.json",
        domNode: containerRef.current,
        deepLinking: true,
        presets: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).SwaggerUIBundle.presets.apis,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).SwaggerUIStandalonePreset,
        ],
        layout: "StandaloneLayout",
      });
    };

    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      initSwagger();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      "https://unpkg.com/swagger-ui-dist@5.21.0/swagger-ui-bundle.js";
    script.onload = () => {
      const presetScript = document.createElement("script");
      presetScript.src =
        "https://unpkg.com/swagger-ui-dist@5.21.0/swagger-ui-standalone-preset.js";
      presetScript.onload = initSwagger;
      document.body.appendChild(presetScript);
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-950">
              Markdown Converter API
            </h1>
            <p className="text-sm text-zinc-500">
              OpenAPI 3.0 — import this spec into RapidAPI Studio
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <a
              href="/openapi.yaml"
              className="text-zinc-600 underline hover:text-zinc-950"
            >
              openapi.yaml
            </a>
            <a
              href="/openapi.json"
              className="text-zinc-600 underline hover:text-zinc-950"
            >
              openapi.json
            </a>
            <a href="/" className="text-zinc-600 underline hover:text-zinc-950">
              Home
            </a>
          </div>
        </div>
      </header>
      <div ref={containerRef} />
    </div>
  );
}

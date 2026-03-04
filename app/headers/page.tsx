"use client";

import { useState } from "react";

interface RedirectStep {
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface HeadersResult {
  domain?: string;
  hops?: RedirectStep[];
  error?: string;
}

const STATUS_COLORS: Record<number, string> = {
  200: "#2a6e00",
  201: "#2a6e00",
  204: "#2a6e00",
  301: "#d4820a",
  302: "#d4820a",
  303: "#d4820a",
  307: "#d4820a",
  308: "#d4820a",
  400: "#8b1a00",
  401: "#8b1a00",
  403: "#8b1a00",
  404: "#8b1a00",
  500: "#8b1a00",
  502: "#8b1a00",
  503: "#8b1a00",
};

function statusColor(code: number): string {
  return STATUS_COLORS[code] ?? "#7a4a00";
}

export default function HeadersPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<HeadersResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runLookup() {
    if (!domain.trim()) return;
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/headers?domain=${encodeURIComponent(domain.trim())}`
      );
      const json = await res.json();
      setResult(json);
    } catch {
      setResult({ error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-pixel-gold text-sm mb-1">≡ HTTPS HEADERS</div>
        <div className="h-1 bg-pixel-border w-32 mb-4" />
        <p className="text-pixel-border text-[1.0rem] font-mono leading-loose">
          Inspect HTTP response headers from a web server. Follows redirects
          and shows each hop.
        </p>
      </div>

      <div className="pixel-panel mb-6">
        <label className="block text-pixel-accent text-[0.6rem] mb-3">
          DOMAIN OR URL
        </label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            className="pixel-input flex-1"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && runLookup()}
            disabled={loading}
          />
          <button
            className="pixel-btn"
            onClick={runLookup}
            disabled={loading || !domain.trim()}
          >
            {loading ? "FETCHING..." : "▶ FETCH"}
          </button>
        </div>
      </div>

      {result?.error && (
        <pre className="pixel-results text-[#8b1a00]">{result.error}</pre>
      )}

      {result?.hops && (
        <div className="space-y-4">
          {result.hops.map((hop, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                {result.hops && result.hops.length > 1 && (
                  <span className="text-pixel-border text-[0.55rem]">
                    HOP {idx + 1}
                  </span>
                )}
                <span
                  className="text-[0.65rem] font-bold"
                  style={{ color: statusColor(hop.status) }}
                >
                  HTTP {hop.status} {hop.statusText}
                </span>
                <span className="text-pixel-border text-[0.5rem] break-all">
                  {hop.url}
                </span>
              </div>
              <div className="pixel-results max-h-80 overflow-y-auto">
                {Object.entries(hop.headers).map(([k, v]) => (
                  <div key={k} className="py-0.5 flex gap-2 flex-wrap">
                    <span className="text-pixel-accent shrink-0">{k}:</span>
                    <span className="text-pixel-cream break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

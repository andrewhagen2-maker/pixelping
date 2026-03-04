"use client";

import { useState } from "react";

interface DnsRecord {
  type: string;
  records: unknown[];
  error?: string;
}

interface DnsResult {
  domain?: string;
  results?: DnsRecord[];
  error?: string;
}

function formatRecord(record: unknown): string {
  if (typeof record === "string") return record;
  if (typeof record === "object" && record !== null) {
    return JSON.stringify(record, null, 2);
  }
  return String(record);
}

export default function DnsPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<DnsResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runLookup() {
    if (!domain.trim()) return;
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/dns?domain=${encodeURIComponent(domain.trim())}`);
      const json = await res.json();
      setResult(json);
    } catch {
      setResult({ error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const hasAnyRecords = result?.results?.some(
    (r) => r.records.length > 0 && !r.error
  );

  return (
    <div>
      <div className="mb-6">
        <div className="text-pixel-gold text-sm mb-1">⊞ DNS LOOKUP</div>
        <div className="h-1 bg-pixel-border w-32 mb-4" />
        <p className="text-pixel-border text-[1.0rem] font-mono leading-loose">
          Retrieve all DNS record types for a domain: A, AAAA, MX, TXT, NS,
          CNAME, SOA, SRV, PTR.
        </p>
      </div>

      <div className="pixel-panel mb-6">
        <label className="block text-pixel-accent text-[0.6rem] mb-3">
          DOMAIN NAME
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
            {loading ? "QUERYING..." : "▶ LOOKUP"}
          </button>
        </div>
      </div>

      {result?.error && (
        <pre className="pixel-results text-[#8b1a00]">{result.error}</pre>
      )}

      {result?.results && (
        <div className="space-y-3">
          {!hasAnyRecords && (
            <div className="pixel-results text-pixel-border">
              No DNS records found for {result.domain}
            </div>
          )}
          {result.results
            .filter((r) => r.records.length > 0 && !r.error)
            .map((r) => (
              <div key={r.type}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-pixel-gold text-[0.65rem] bg-pixel-panel border border-pixel-gold px-2 py-0.5">
                    {r.type}
                  </span>
                  <span className="text-pixel-border text-[0.55rem]">
                    {r.records.length} record{r.records.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="pixel-results">
                  {r.records.map((rec, i) => (
                    <div key={i} className="py-0.5">
                      <span className="text-pixel-border mr-2">›</span>
                      {formatRecord(rec)}
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

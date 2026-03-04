"use client";

import { useState } from "react";

export default function WhoisPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<{ data?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function runLookup() {
    if (!domain.trim()) return;
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/whois?domain=${encodeURIComponent(domain.trim())}`);
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
        <div className="text-pixel-gold text-sm mb-1">◉ WHOIS LOOKUP</div>
        <div className="h-1 bg-pixel-border w-32 mb-4" />
        <p className="text-pixel-border text-[1.0rem] font-mono leading-loose">
          Query WHOIS servers for domain or IP registration info. Useful for
          identifying ISPs and hosting providers for DMCA notices.
        </p>
      </div>

      <div className="pixel-panel mb-6">
        <label className="block text-pixel-accent text-[0.6rem] mb-3">
          DOMAIN OR IP ADDRESS
        </label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            className="pixel-input flex-1"
            placeholder="example.com or 104.26.11.49"
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

      {result && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-pixel-accent text-[0.6rem]">WHOIS DATA</span>
            {result.error ? (
              <span className="text-pixel-red text-[0.55rem]">● ERROR</span>
            ) : (
              <span className="text-pixel-border text-[0.55rem]">● OK</span>
            )}
          </div>
          {result.error ? (
            <pre className="pixel-results text-[#8b1a00]">{result.error}</pre>
          ) : (
            <pre className="pixel-results max-h-[65vh] overflow-y-auto">
              {result.data}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

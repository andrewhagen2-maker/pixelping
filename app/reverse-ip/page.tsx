"use client";

import { useState } from "react";

interface ReverseIpResult {
  ip?: string;
  domains?: string[];
  count?: number;
  error?: string;
}

export default function ReverseIpPage() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<ReverseIpResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runLookup() {
    if (!ip.trim()) return;
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/reverse-ip?ip=${encodeURIComponent(ip.trim())}`);
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
        <div className="text-pixel-gold text-sm mb-1">◀◀ REVERSE IP LOOKUP</div>
        <div className="h-1 bg-pixel-border w-32 mb-4" />
        <p className="text-pixel-border text-[1.0rem] font-mono leading-loose">
          Find all domains hosted on a given IP address. Powered by
          HackerTarget (100 free queries/day).
        </p>
      </div>

      <div className="pixel-panel mb-6">
        <label className="block text-pixel-accent text-[0.6rem] mb-3">
          IP ADDRESS
        </label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            className="pixel-input flex-1"
            placeholder="93.184.216.34"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && runLookup()}
            disabled={loading}
          />
          <button
            className="pixel-btn"
            onClick={runLookup}
            disabled={loading || !ip.trim()}
          >
            {loading ? "SEARCHING..." : "▶ LOOKUP"}
          </button>
        </div>
      </div>

      {result && (
        <div>
          {result.error ? (
            <>
              <div className="text-pixel-accent text-[0.6rem] mb-2">ERROR</div>
              <pre className="pixel-results text-[#8b1a00]">{result.error}</pre>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-pixel-accent text-[0.6rem]">
                  DOMAINS ON {result.ip}
                </span>
                <span className="text-pixel-gold text-[0.55rem] border border-pixel-gold px-1">
                  {result.count} FOUND
                </span>
              </div>
              <div className="pixel-results max-h-[65vh] overflow-y-auto">
                {result.domains?.map((d, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-pixel-border mr-2 text-[0.7rem]">
                      {String(i + 1).padStart(3, "0")}.
                    </span>
                    <span className="text-pixel-gold">{d}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

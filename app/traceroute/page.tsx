"use client";

import { useState, useRef } from "react";

export default function TraceRoutePage() {
  const [host, setHost] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function runTrace() {
    if (!host.trim()) return;

    setOutput("");
    setDone(false);
    setLoading(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `/api/traceroute?host=${encodeURIComponent(host.trim())}`,
        { signal: abortRef.current.signal }
      );

      if (!res.ok || !res.body) {
        const err = await res.text();
        setOutput(`Error: ${err}`);
        setLoading(false);
        setDone(true);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setOutput((prev) => prev + `\nConnection error: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setDone(true);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setLoading(false);
    setOutput((prev) => prev + "\n\n[Aborted by user]");
    setDone(true);
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-pixel-gold text-sm mb-1">▶ TRACEROUTE</div>
        <div className="h-1 bg-pixel-border w-32 mb-4" />
        <p className="text-pixel-border text-[1.0rem] font-mono leading-loose">
          Trace the network route from this server to a remote host.
          Results stream in real-time as each hop responds.
        </p>
      </div>

      <div className="pixel-panel mb-6">
        <label className="block text-pixel-accent text-[0.6rem] mb-3">
          TARGET HOST OR IP
        </label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            className="pixel-input flex-1"
            placeholder="example.com or 8.8.8.8"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && runTrace()}
            disabled={loading}
          />
          {loading ? (
            <button className="pixel-btn" onClick={handleStop}>
              ■ STOP
            </button>
          ) : (
            <button
              className="pixel-btn"
              onClick={runTrace}
              disabled={!host.trim()}
            >
              ▶ TRACE
            </button>
          )}
        </div>
      </div>

      {(output || loading) && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-pixel-accent text-[0.6rem]">OUTPUT</span>
            {loading && (
              <span className="text-pixel-gold text-[0.55rem] blink">
                ● TRACING...
              </span>
            )}
            {done && !loading && (
              <span className="text-pixel-border text-[0.55rem]">● DONE</span>
            )}
          </div>
          <pre className="pixel-results min-h-32 max-h-[60vh] overflow-y-auto">
            {output || " "}
          </pre>
        </div>
      )}
    </div>
  );
}

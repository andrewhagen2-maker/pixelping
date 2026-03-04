"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Status = "idle" | "running" | "done" | "error";

interface DnsRecord { type: string; records: unknown[]; error: string | null }
interface DnsResult { domain: string; results: DnsRecord[] }
interface WhoisResult { domain: string; server: string; data: string }
interface GeoResult {
  country: string; countryCode: string; regionName: string; city: string;
  isp: string; org: string; as: string; query: string;
}
interface AbuseContact { email: string | null; name: string | null; phone: string | null }

interface Section<T> {
  status: Status;
  data: T | null;
  error?: string;
  expanded: boolean;
}

interface TracerouteState {
  status: Status;
  lines: string[];
  finalIp: string | null;
  expanded: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const IP_RE = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/;
const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9.\-]*\.[a-zA-Z]{2,}$/;

function isTimeout(line: string) {
  return /\*\s*\*\s*\*|timed out|no response/i.test(line);
}

function parseAbuseContact(whoisText: string): AbuseContact {
  const emailMatch =
    whoisText.match(/OrgAbuseEmail:\s*([^\s\r\n]+)/i) ??
    whoisText.match(/abuse-mailbox:\s*([^\s\r\n]+)/i) ??
    whoisText.match(/Registrar Abuse Contact Email:\s*([^\s\r\n]+)/i);
  const nameMatch =
    whoisText.match(/OrgAbuseName:\s*([^\r\n]+)/i) ??
    whoisText.match(/abuse-c:\s*([^\r\n]+)/i);
  const phoneMatch =
    whoisText.match(/OrgAbusePhone:\s*([^\r\n]+)/i) ??
    whoisText.match(/phone:\s*([^\r\n]+)/i);
  return {
    email: emailMatch?.[1]?.trim() ?? null,
    name: nameMatch?.[1]?.trim() ?? null,
    phone: phoneMatch?.[1]?.trim() ?? null,
  };
}

function getDnsSummary(result: DnsResult): string {
  const aRec = result.results.find((r) => r.type === "A");
  if (!aRec || !aRec.records.length) return "No A records found";
  return "A → " + (aRec.records as string[]).join(", ");
}

function parseWhoisSummary(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const patterns: [string, RegExp][] = [
    ["Registrar", /Registrar:\s*([^\r\n]+)/i],
    ["Created", /Creation Date:\s*([^\r\n]+)/i],
    ["Expires", /Registry Expiry Date:\s*([^\r\n]+)/i],
    ["Updated", /Updated Date:\s*([^\r\n]+)/i],
    ["NetName", /NetName:\s*([^\r\n]+)/i],
    ["Org", /OrgName:\s*([^\r\n]+)/i],
  ];
  for (const [label, re] of patterns) {
    const m = text.match(re);
    if (m) fields[label] = m[1].trim().slice(0, 60);
  }
  return fields;
}

// ── Status Badge (UI chrome — stays small) ─────────────────────────────────────

function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const configs: Record<Status, { text: string; blink?: boolean }> = {
    idle:    { text: "text-pixel-border" },
    running: { text: "text-pixel-gold", blink: true },
    done:    { text: "text-pixel-border" },
    error:   { text: "text-[#8b1a00]" },
  };
  const c = configs[status];
  const displayLabel = label ?? status.toUpperCase();
  return (
    <span className={`text-[0.55rem] ${c.text} ${c.blink ? "blink" : ""}`}>
      ● {displayLabel}
    </span>
  );
}

// ── Section Header (UI chrome — stays small) ───────────────────────────────────

function SectionHeader({
  num, title, status, statusLabel, expanded, onToggle, hasData,
}: {
  num: string; title: string; status: Status; statusLabel?: string;
  expanded: boolean; onToggle: () => void; hasData: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-b-2 border-pixel-border select-none ${hasData ? "cursor-pointer hover:bg-pixel-panel" : ""}`}
      onClick={hasData ? onToggle : undefined}
    >
      <div className="flex items-center gap-3">
        <span className="text-pixel-border text-[0.55rem]">{num}</span>
        <span className="text-pixel-gold text-[0.6rem]">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={status} label={statusLabel} />
        {hasData && (
          <span className="text-pixel-border text-[0.5rem]">{expanded ? "▲" : "▼"}</span>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function InvestigatePage() {
  const [domain, setDomain] = useState("");
  const [inputError, setInputError] = useState("");
  const [running, setRunning] = useState(false);

  const [dns, setDns] = useState<Section<DnsResult>>({ status: "idle", data: null, expanded: false });
  const [domainWhois, setDomainWhois] = useState<Section<WhoisResult>>({ status: "idle", data: null, expanded: false });
  const [traceroute, setTraceroute] = useState<TracerouteState>({ status: "idle", lines: [], finalIp: null, expanded: true });
  const [geoip, setGeoip] = useState<Section<GeoResult>>({ status: "idle", data: null, expanded: false });
  const [ipWhois, setIpWhois] = useState<Section<WhoisResult>>({ status: "idle", data: null, expanded: false });
  const [abuseContact, setAbuseContact] = useState<AbuseContact>({ email: null, name: null, phone: null });

  const abortRef = useRef<AbortController | null>(null);
  const finalIpRef = useRef<string | null>(null);

  // Phase 2: once traceroute finalIp is set, fire geoip + ipWhois in parallel
  useEffect(() => {
    if (!traceroute.finalIp) return;
    const ip = traceroute.finalIp;
    finalIpRef.current = ip;

    setGeoip((s) => ({ ...s, status: "running" }));
    fetch(`/api/geoip?ip=${encodeURIComponent(ip)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setGeoip({ status: "error", data: null, error: data.error, expanded: false });
        else setGeoip({ status: "done", data, error: undefined, expanded: false });
      })
      .catch((e) => setGeoip({ status: "error", data: null, error: e.message, expanded: false }));

    setIpWhois((s) => ({ ...s, status: "running" }));
    fetch(`/api/whois?domain=${encodeURIComponent(ip)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setIpWhois({ status: "error", data: null, error: data.error, expanded: false });
        else setIpWhois({ status: "done", data, error: undefined, expanded: false });
      })
      .catch((e) => setIpWhois({ status: "error", data: null, error: e.message, expanded: false }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceroute.finalIp]);

  // Phase 3: once ipWhois data arrives, parse abuse contact
  useEffect(() => {
    if (ipWhois.data?.data) {
      setAbuseContact(parseAbuseContact(ipWhois.data.data));
    }
  }, [ipWhois.data]);

  const runInvestigate = useCallback(async () => {
    const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!d) return;

    if (!DOMAIN_RE.test(d)) {
      setInputError("Please enter a domain name (e.g. example.com). For raw IPs use the WHOIS tool.");
      return;
    }
    setInputError("");

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setRunning(true);
    finalIpRef.current = null;

    setDns({ status: "running", data: null, expanded: true });
    setDomainWhois({ status: "running", data: null, expanded: true });
    setTraceroute({ status: "running", lines: [], finalIp: null, expanded: true });
    setGeoip({ status: "idle", data: null, expanded: false });
    setIpWhois({ status: "idle", data: null, expanded: false });
    setAbuseContact({ email: null, name: null, phone: null });

    // Phase 1: DNS + Domain WHOIS in parallel
    Promise.all([
      fetch(`/api/dns?domain=${encodeURIComponent(d)}`).then((r) => r.json()),
      fetch(`/api/whois?domain=${encodeURIComponent(d)}`).then((r) => r.json()),
    ]).then(([dnsData, whoisData]) => {
      setDns({ status: dnsData.error ? "error" : "done", data: dnsData.error ? null : dnsData, error: dnsData.error, expanded: false });
      setDomainWhois({ status: whoisData.error ? "error" : "done", data: whoisData.error ? null : whoisData, error: whoisData.error, expanded: false });
    }).catch(() => {
      setDns((s) => s.status === "running" ? { ...s, status: "error", error: "Request failed" } : s);
      setDomainWhois((s) => s.status === "running" ? { ...s, status: "error", error: "Request failed" } : s);
    });

    // Phase 1: Traceroute stream
    let lastIp: string | null = null;
    try {
      const res = await fetch(`/api/traceroute?host=${encodeURIComponent(d)}`, {
        signal: abortRef.current.signal,
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        setTraceroute((prev) => ({ ...prev, lines: [...prev.lines, ...lines.filter((l) => l.trim())] }));
        for (const line of lines) {
          if (!isTimeout(line)) {
            const m = line.match(IP_RE);
            if (m) lastIp = m[1];
          }
        }
      }

      setTraceroute((prev) => ({ ...prev, status: "done", finalIp: lastIp, expanded: true }));
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setTraceroute((prev) => ({ ...prev, status: "error", error: (e as Error).message }));
      }
    } finally {
      setRunning(false);
    }
  }, [domain]);

  const hasAnyResult =
    dns.status !== "idle" || domainWhois.status !== "idle" || traceroute.status !== "idle";

  const toggle = (setter: React.Dispatch<React.SetStateAction<Section<unknown>>>) =>
    (setter as React.Dispatch<React.SetStateAction<Section<DnsResult | WhoisResult | GeoResult>>>)((s) => ({ ...s, expanded: !s.expanded }));

  // Shared class for all result data text
  const dataText = "text-[0.9rem] font-mono";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-pixel-gold text-sm mb-1">⚡ INVESTIGATE</div>
        <div className="h-1 bg-pixel-border w-32 mb-4" />
        <p className="text-pixel-border text-[1.0rem] font-mono leading-loose">
          Full network dossier in one shot — DNS, WHOIS, traceroute to destination
          IP, geolocation, and abuse contact for DMCA notices.
        </p>
      </div>

      {/* Input */}
      <div className="pixel-panel mb-6">
        <label className="block text-pixel-accent text-[0.6rem] mb-3">TARGET DOMAIN</label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            className="pixel-input flex-1"
            placeholder="example.com"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setInputError(""); }}
            onKeyDown={(e) => e.key === "Enter" && !running && runInvestigate()}
            disabled={running}
          />
          <button
            className="pixel-btn"
            onClick={runInvestigate}
            disabled={running || !domain.trim()}
          >
            {running ? "RUNNING..." : "▶ RUN DOSSIER"}
          </button>
        </div>
        {inputError && (
          <p className={`text-[#8b1a00] ${dataText} mt-2`}>{inputError}</p>
        )}
      </div>

      {/* Results Sections */}
      {hasAnyResult && (
        <div className="space-y-4">

          {/* ① DNS RECORDS */}
          <div className="border-4 border-pixel-border">
            <SectionHeader
              num="①" title="DNS RECORDS" status={dns.status}
              statusLabel={dns.status === "running" ? "QUERYING..." : dns.status === "done" ? "DONE" : dns.status.toUpperCase()}
              expanded={dns.expanded} onToggle={() => toggle(setDns as never)}
              hasData={!!dns.data || !!dns.error}
            />
            {dns.status === "done" && dns.data && (
              <div className="px-4 py-2 border-b border-pixel-border bg-pixel-darkbrown">
                <span className={`text-pixel-gold ${dataText}`}>{getDnsSummary(dns.data)}</span>
              </div>
            )}
            {dns.error && (
              <div className="px-4 py-2">
                <span className={`text-[#8b1a00] ${dataText}`}>{dns.error}</span>
              </div>
            )}
            {dns.expanded && dns.data && (
              <div className="p-4 space-y-3">
                {dns.data.results
                  .filter((r) => r.records.length > 0)
                  .map((r) => (
                    <div key={r.type} className="flex items-baseline gap-3 flex-wrap">
                      <span className={`text-pixel-gold ${dataText} bg-pixel-panel border border-pixel-gold px-2 py-0.5 shrink-0`}>
                        {r.type}
                      </span>
                      <span className={`text-pixel-cream ${dataText}`}>
                        {r.records.map((rec) =>
                          typeof rec === "string" ? rec :
                          typeof rec === "object" ? JSON.stringify(rec) : String(rec)
                        ).join(", ")}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* ② DOMAIN WHOIS */}
          <div className="border-4 border-pixel-border">
            <SectionHeader
              num="②" title="DOMAIN WHOIS" status={domainWhois.status}
              statusLabel={domainWhois.status === "running" ? "QUERYING..." : domainWhois.status === "done" ? "DONE" : domainWhois.status.toUpperCase()}
              expanded={domainWhois.expanded} onToggle={() => toggle(setDomainWhois as never)}
              hasData={!!domainWhois.data || !!domainWhois.error}
            />
            {domainWhois.status === "done" && domainWhois.data && !domainWhois.expanded && (
              <div className="px-4 py-3 border-b border-pixel-border bg-pixel-darkbrown flex flex-wrap gap-x-6 gap-y-1">
                {Object.entries(parseWhoisSummary(domainWhois.data.data)).map(([k, v]) => (
                  <span key={k} className={`${dataText}`}>
                    <span className="text-pixel-accent">{k}: </span>
                    <span className="text-pixel-cream">{v}</span>
                  </span>
                ))}
              </div>
            )}
            {domainWhois.error && (
              <div className="px-4 py-2">
                <span className={`text-[#8b1a00] ${dataText}`}>{domainWhois.error}</span>
              </div>
            )}
            {domainWhois.expanded && domainWhois.data && (
              <pre className={`pixel-results ${dataText} max-h-64 overflow-y-auto m-4 mt-2`}>
                {domainWhois.data.data}
              </pre>
            )}
          </div>

          {/* ③ TRACEROUTE */}
          <div className="border-4 border-pixel-border">
            <SectionHeader
              num="③" title="TRACEROUTE" status={traceroute.status}
              statusLabel={
                traceroute.status === "running"
                  ? `STREAMING... (${traceroute.lines.length} hops)`
                  : traceroute.status === "done" ? "DONE" : traceroute.status.toUpperCase()
              }
              expanded={traceroute.expanded}
              onToggle={() => setTraceroute((s) => ({ ...s, expanded: !s.expanded }))}
              hasData={traceroute.lines.length > 0}
            />
            {traceroute.finalIp && (
              <div className="px-4 py-2 border-b border-pixel-border bg-pixel-darkbrown flex items-center gap-3 flex-wrap">
                <span className={`text-pixel-border ${dataText}`}>DESTINATION IP</span>
                <span className={`text-pixel-gold ${dataText}`}>{traceroute.finalIp}</span>
                <span className="text-pixel-accent text-[0.55rem]">→ triggering IP analysis</span>
              </div>
            )}
            {traceroute.expanded && traceroute.lines.length > 0 && (
              <pre className={`pixel-results ${dataText} max-h-64 overflow-y-auto m-4 mt-2`}>
                {traceroute.lines.join("\n")}
              </pre>
            )}
          </div>

          {/* ④ IP GEOLOCATION */}
          {geoip.status !== "idle" && (
            <div className="border-4 border-pixel-border">
              <SectionHeader
                num="④" title="IP GEOLOCATION" status={geoip.status}
                statusLabel={geoip.status === "running" ? "QUERYING..." : geoip.status === "done" ? "DONE" : geoip.status.toUpperCase()}
                expanded={false} onToggle={() => {}} hasData={false}
              />
              {geoip.data && (
                <div className="px-4 py-3 flex flex-wrap gap-x-8 gap-y-2">
                  {[
                    ["COUNTRY", `${geoip.data.country} (${geoip.data.countryCode})`],
                    ["REGION", geoip.data.regionName],
                    ["CITY", geoip.data.city],
                    ["ISP", geoip.data.isp],
                    ["ORG", geoip.data.org],
                    ["ASN", geoip.data.as],
                  ].map(([label, value]) => (
                    <div key={label} className={dataText}>
                      <span className="text-pixel-accent">{label}: </span>
                      <span className="text-pixel-cream">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              {geoip.error && (
                <div className="px-4 py-2">
                  <span className={`text-[#8b1a00] ${dataText}`}>{geoip.error}</span>
                </div>
              )}
            </div>
          )}

          {/* ⑤ IP WHOIS */}
          {ipWhois.status !== "idle" && (
            <div className="border-4 border-pixel-border">
              <SectionHeader
                num="⑤" title="IP WHOIS" status={ipWhois.status}
                statusLabel={ipWhois.status === "running" ? "QUERYING..." : ipWhois.status === "done" ? "DONE" : ipWhois.status.toUpperCase()}
                expanded={ipWhois.expanded}
                onToggle={() => toggle(setIpWhois as never)}
                hasData={!!ipWhois.data || !!ipWhois.error}
              />
              {ipWhois.status === "done" && ipWhois.data && !ipWhois.expanded && (
                <div className="px-4 py-3 border-b border-pixel-border bg-pixel-darkbrown flex flex-wrap gap-x-6 gap-y-1">
                  {Object.entries(parseWhoisSummary(ipWhois.data.data)).map(([k, v]) => (
                    <span key={k} className={dataText}>
                      <span className="text-pixel-accent">{k}: </span>
                      <span className="text-pixel-cream">{v}</span>
                    </span>
                  ))}
                </div>
              )}
              {ipWhois.error && (
                <div className="px-4 py-2">
                  <span className={`text-[#8b1a00] ${dataText}`}>{ipWhois.error}</span>
                </div>
              )}
              {ipWhois.expanded && ipWhois.data && (
                <pre className={`pixel-results ${dataText} max-h-64 overflow-y-auto m-4 mt-2`}>
                  {ipWhois.data.data}
                </pre>
              )}
            </div>
          )}

          {/* ⑥ ABUSE CONTACT */}
          {ipWhois.status === "done" && (
            <div className="border-4 border-pixel-gold bg-pixel-panel">
              <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-pixel-gold">
                <span className="text-pixel-border text-[0.55rem]">⑥</span>
                <span className="text-pixel-gold text-[0.6rem]">ABUSE CONTACT</span>
                <span className="text-pixel-gold text-[0.55rem] ml-auto">
                  {abuseContact.email ? "● FOUND" : "● NOT FOUND"}
                </span>
              </div>
              <div className="px-4 py-4">
                {abuseContact.email ? (
                  <div className="space-y-2">
                    <div className={`text-pixel-gold ${dataText}`}>
                      ✉ {abuseContact.email}
                    </div>
                    {abuseContact.name && (
                      <div className={`text-pixel-cream ${dataText}`}>{abuseContact.name}</div>
                    )}
                    {abuseContact.phone && (
                      <div className={`text-pixel-border ${dataText}`}>{abuseContact.phone}</div>
                    )}
                    <div className={`text-pixel-border ${dataText} mt-3`}>
                      Use this email to file DMCA / abuse complaints with the hosting provider.
                    </div>
                  </div>
                ) : (
                  <div className={`text-pixel-border ${dataText}`}>
                    No abuse contact found in WHOIS data. Check the raw IP WHOIS output above.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

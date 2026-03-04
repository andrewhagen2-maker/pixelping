import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "net";

export const runtime = "nodejs";

// Map TLDs to their authoritative WHOIS servers
const WHOIS_SERVERS: Record<string, string> = {
  com: "whois.verisign-grs.com",
  net: "whois.verisign-grs.com",
  org: "whois.pir.org",
  io: "whois.nic.io",
  co: "whois.nic.co",
  uk: "whois.nic.uk",
  us: "whois.nic.us",
  ca: "whois.cira.ca",
  au: "whois.auda.org.au",
  de: "whois.denic.de",
  fr: "whois.nic.fr",
  nl: "whois.domain-registry.nl",
  se: "whois.iis.se",
  no: "whois.norid.no",
  fi: "whois.fi",
  ru: "whois.tcinet.ru",
  jp: "whois.jprs.jp",
  cn: "whois.cnnic.cn",
  info: "whois.afilias.net",
  biz: "whois.biz",
  app: "whois.nic.google",
  dev: "whois.nic.google",
  ai: "whois.nic.ai",
  ly: "whois.nic.ly",
  me: "whois.nic.me",
  tv: "whois.nic.tv",
  cc: "ccwhois.verisign-grs.com",
};

function getTld(domain: string): string {
  const parts = domain.split(".");
  return parts[parts.length - 1].toLowerCase();
}

/** Returns true if the string looks like a valid IPv4 address */
function isIPv4(s: string): boolean {
  const parts = s.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && parseInt(p, 10) <= 255);
}

function whoisQuery(host: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const conn = createConnection({ host, port: 43, timeout: 10000 });

    conn.on("connect", () => {
      conn.write(`${query}\r\n`);
    });

    conn.on("data", (chunk: Buffer) => chunks.push(chunk));

    conn.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    conn.on("timeout", () => {
      conn.destroy();
      reject(new Error(`Connection to ${host} timed out`));
    });

    conn.on("error", (err) => reject(err));
  });
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("domain")?.trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ error: "Missing ?domain= parameter" }, { status: 400 });
  }

  // Allow letters, digits, dots, hyphens, colons (IPv6 future-proofing)
  if (!/^[a-zA-Z0-9.\-:]+$/.test(query)) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  // ── IP address lookup ──────────────────────────────────────────────────────
  if (isIPv4(query)) {
    const arinServer = "whois.arin.net";
    try {
      let data = await whoisQuery(arinServer, query);

      // ARIN may refer to another RIR (RIPE, APNIC, LACNIC, AFRINIC)
      const referralMatch = data.match(/ReferralServer:\s*whois:\/\/([^\s\r\n]+)/i);

      if (referralMatch) {
        const referralServer = referralMatch[1].trim();
        if (referralServer && referralServer !== arinServer) {
          const referralData = await whoisQuery(referralServer, query);
          data =
            `=== ${referralServer.toUpperCase()} ===\n${referralData}\n\n` +
            `=== ARIN (${arinServer}) ===\n${data}`;
          return NextResponse.json({ domain: query, server: referralServer, data });
        }
      }

      return NextResponse.json({ domain: query, server: arinServer, data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "IP WHOIS lookup failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── Domain lookup ──────────────────────────────────────────────────────────
  const tld = getTld(query);
  const server = WHOIS_SERVERS[tld] ?? `whois.nic.${tld}`;

  try {
    // First query the TLD registry — they'll often refer us to the registrar
    let data = await whoisQuery(server, query);

    // Some registries return a referral — follow it
    const referralMatch =
      data.match(/Registrar WHOIS Server:\s*(.+)/i) ??
      data.match(/whois:\s*(.+)/i);

    if (referralMatch) {
      const referralServer = referralMatch[1].trim().replace(/^https?:\/\//, "");
      if (referralServer && referralServer !== server && referralServer.includes(".")) {
        const referralData = await whoisQuery(referralServer, query);
        data =
          `=== Registrar WHOIS (${referralServer}) ===\n${referralData}\n\n` +
          `=== Registry WHOIS (${server}) ===\n${data}`;
      }
    }

    return NextResponse.json({ domain: query, server, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "WHOIS lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

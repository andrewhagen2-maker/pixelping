import { NextRequest, NextResponse } from "next/server";
import { promises as dns, setServers } from "dns";

export const runtime = "nodejs";

// Use public DNS servers to avoid WSL/Windows resolver issues
setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

type DnsResult = {
  type: string;
  records: unknown[] | string;
  error?: string;
};

async function queryRecord(
  type: string,
  fn: () => Promise<unknown>
): Promise<DnsResult> {
  try {
    const records = await fn();
    return { type, records: records as unknown[] };
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENODATA" || code === "ENOTFOUND" || code === "ECONNREFUSED") {
      return { type, records: [], error: "No records" };
    }
    return { type, records: [], error: (err as Error).message };
  }
}

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain")?.trim();

  if (!domain) {
    return NextResponse.json({ error: "Missing ?domain= parameter" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9.\-_]+$/.test(domain)) {
    return NextResponse.json({ error: "Invalid domain name." }, { status: 400 });
  }

  const results = await Promise.all([
    queryRecord("A", () => dns.resolve4(domain)),
    queryRecord("AAAA", () => dns.resolve6(domain)),
    queryRecord("MX", () => dns.resolveMx(domain)),
    queryRecord("TXT", () => dns.resolveTxt(domain)),
    queryRecord("NS", () => dns.resolveNs(domain)),
    queryRecord("CNAME", () => dns.resolveCname(domain)),
    queryRecord("SOA", () => dns.resolveSoa(domain)),
    queryRecord("SRV", () => dns.resolveSrv(domain)),
    queryRecord("PTR", () => dns.resolvePtr(domain)),
  ]);

  return NextResponse.json({ domain, results });
}

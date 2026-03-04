import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface RedirectStep {
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

async function fetchHeaders(url: string, hops: RedirectStep[] = []): Promise<RedirectStep[]> {
  if (hops.length >= 10) return hops; // max redirect follow depth

  let res: Response;
  try {
    res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "ViewDNS-Tools/1.0 (network diagnostic)",
      },
    });
  } catch {
    return hops;
  }

  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });

  hops.push({
    url,
    status: res.status,
    statusText: res.statusText,
    headers,
  });

  // Follow redirects manually
  if ([301, 302, 303, 307, 308].includes(res.status) && headers["location"]) {
    const nextUrl = headers["location"].startsWith("http")
      ? headers["location"]
      : new URL(headers["location"], url).href;
    return fetchHeaders(nextUrl, hops);
  }

  return hops;
}

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain")?.trim();

  if (!domain) {
    return NextResponse.json({ error: "Missing ?domain= parameter" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9.\-_:]+$/.test(domain)) {
    return NextResponse.json({ error: "Invalid domain." }, { status: 400 });
  }

  // Try HTTPS first, fall back to HTTP
  const startUrl = domain.startsWith("http") ? domain : `https://${domain}`;

  try {
    const hops = await fetchHeaders(startUrl);

    if (hops.length === 0) {
      // Try HTTP fallback
      const httpUrl = `http://${domain}`;
      const httpHops = await fetchHeaders(httpUrl);
      if (httpHops.length === 0) {
        return NextResponse.json({ error: "Could not connect to host." }, { status: 502 });
      }
      return NextResponse.json({ domain, hops: httpHops });
    }

    return NextResponse.json({ domain, hops });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

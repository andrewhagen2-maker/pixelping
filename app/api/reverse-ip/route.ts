import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip")?.trim();

  if (!ip) {
    return NextResponse.json({ error: "Missing ?ip= parameter" }, { status: 400 });
  }

  // Accept IPv4, IPv6, or a hostname
  if (!/^[a-zA-Z0-9.\-:_]+$/.test(ip)) {
    return NextResponse.json({ error: "Invalid IP or host." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.hackertarget.com/reverseiplookup/?q=${encodeURIComponent(ip)}`,
      { signal: AbortSignal.timeout(15000) }
    );

    const text = await res.text();

    // HackerTarget returns "error check your search parameter" on bad input
    if (text.toLowerCase().startsWith("error")) {
      return NextResponse.json({ error: text.trim() }, { status: 400 });
    }

    // Rate limit message
    if (text.includes("API count exceeded")) {
      return NextResponse.json(
        { error: "HackerTarget API rate limit reached. Try again later." },
        { status: 429 }
      );
    }

    const domains = text
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);

    return NextResponse.json({ ip, domains, count: domains.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

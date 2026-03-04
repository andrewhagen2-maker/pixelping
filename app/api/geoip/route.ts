import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isIPv4(s: string): boolean {
  const parts = s.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && parseInt(p, 10) <= 255);
}

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip")?.trim();

  if (!ip) {
    return NextResponse.json({ error: "Missing ?ip= parameter" }, { status: 400 });
  }

  if (!isIPv4(ip)) {
    return NextResponse.json({ error: "Invalid IPv4 address." }, { status: 400 });
  }

  try {
    // ip-api.com free tier is HTTP only — must be fetched server-side
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,isp,org,as,query`
    );
    const data = await res.json();

    if (data.status === "fail") {
      return NextResponse.json({ error: data.message ?? "Lookup failed" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Geolocation lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

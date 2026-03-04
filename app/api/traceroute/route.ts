import { spawn } from "child_process";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim();

  if (!host) {
    return new Response("Missing ?host= parameter", { status: 400 });
  }

  // Basic validation — no shell injection
  if (!/^[a-zA-Z0-9.\-_]+$/.test(host)) {
    return new Response("Invalid host. Use a hostname or IP address.", {
      status: 400,
    });
  }

  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "tracert" : "traceroute";
  // On Windows: tracert -d (no DNS resolution, faster)
  // On Linux: traceroute -n (no DNS resolution)
  const args = isWindows ? ["-d", host] : ["-n", host];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const child = spawn(cmd, args, { shell: false });

      child.stdout.on("data", (data: Buffer) => {
        controller.enqueue(encoder.encode(data.toString()));
      });

      child.stderr.on("data", (data: Buffer) => {
        controller.enqueue(encoder.encode(`[stderr] ${data.toString()}`));
      });

      child.on("close", (code) => {
        controller.enqueue(
          encoder.encode(`\n\n--- Traceroute complete (exit code: ${code}) ---`)
        );
        controller.close();
      });

      child.on("error", (err) => {
        controller.enqueue(encoder.encode(`\nError: ${err.message}`));
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Accel-Buffering": "no",
      "Cache-Control": "no-cache",
    },
  });
}

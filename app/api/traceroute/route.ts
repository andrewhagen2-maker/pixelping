import { spawn } from "child_process";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Transfer-Encoding": "chunked",
  "X-Accel-Buffering": "no",
  "Cache-Control": "no-cache",
} as const;

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

  const encoder = new TextEncoder();
  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "tracert" : "traceroute";
  const args = isWindows ? ["-d", host] : ["-n", host];

  return new Promise<Response>((resolve) => {
    // streamController is assigned synchronously inside ReadableStream constructor
    let streamController!: ReadableStreamDefaultController<Uint8Array>;
    let resolved = false;

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
    });

    const resolveWithStream = () => {
      if (!resolved) {
        resolved = true;
        resolve(new Response(stream, { headers: HEADERS }));
      }
    };

    const child = spawn(cmd, args, { shell: false });

    child.stdout.on("data", (data: Buffer) => {
      resolveWithStream();
      streamController.enqueue(encoder.encode(data.toString()));
    });

    child.stderr.on("data", (data: Buffer) => {
      resolveWithStream();
      streamController.enqueue(encoder.encode(`[stderr] ${data.toString()}`));
    });

    child.on("close", (code: number) => {
      resolveWithStream();
      streamController.enqueue(
        encoder.encode(`\n\n--- Traceroute complete (exit code: ${code}) ---`)
      );
      streamController.close();
    });

    child.on("error", async (err: NodeJS.ErrnoException) => {
      if (err.code === "ENOENT") {
        // System traceroute binary not available (e.g. Vercel serverless).
        // Fall back to HackerTarget's free traceroute API.
        try {
          const apiRes = await fetch(
            `https://api.hackertarget.com/traceroute/?q=${encodeURIComponent(host)}`
          );
          const text = await apiRes.text();

          const fallbackStream = new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(
                encoder.encode(
                  "[ System traceroute unavailable — using HackerTarget API ]\n\n"
                )
              );
              controller.enqueue(encoder.encode(text));
              controller.enqueue(
                encoder.encode("\n\n--- Traceroute complete ---")
              );
              controller.close();
            },
          });

          resolve(new Response(fallbackStream, { headers: HEADERS }));
        } catch {
          resolve(
            new Response(
              "Traceroute unavailable: system binary not found and API fallback failed.",
              { status: 503 }
            )
          );
        }
      } else {
        // Some other spawn error — surface it in the stream
        resolveWithStream();
        streamController.enqueue(encoder.encode(`\nError: ${err.message}`));
        streamController.close();
      }
    });
  });
}

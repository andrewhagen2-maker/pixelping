# PixelPing 👾

**[pixelp.ing](https://pixelp.ing)** — A retro-styled DNS & network diagnostics toolkit built for developers, sysadmins, and the internet-curious.

---

## What It Does

PixelPing is a collection of free, no-login network diagnostic tools wrapped in a pixel-art SNES aesthetic. Think ViewDNS.info meets a 16-bit arcade cabinet.

### Tools

| Tool | Description |
|------|-------------|
| **DNS Lookup** | Query A, AAAA, MX, TXT, NS, CNAME, and SOA records via public resolvers |
| **WHOIS** | Full WHOIS lookup with referral chain following (custom TCP implementation) |
| **Traceroute** | Live-streaming hop-by-hop traceroute with real-time output |
| **Reverse IP** | Discover all domains hosted on a given IP address |
| **HTTP Headers** | Inspect response headers with full redirect chain following |
| **Geo IP** | Geolocate any IP address — country, city, ASN, coordinates |
| **Investigate** | Aggregated multi-tool view: run DNS + WHOIS + Geo IP on a domain in one shot |

---

## Tech Stack

### Framework
- **[Next.js 14](https://nextjs.org/)** (App Router) — server components, streaming responses, API routes
- **TypeScript** — fully typed throughout
- **React 18** — client-side interactivity

### Styling
- **Tailwind CSS v3** — utility-first styling
- **Custom design system** — pixel-art utilities built on top of Tailwind (`pixel-panel`, `pixel-btn`, `pixel-input`, etc.)
- **Google Fonts** — [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) for headings
- **Courier New** — monospace body text and terminal output

### Backend / APIs
- **`node:dns/promises`** — DNS resolution with explicit public nameserver overrides (`8.8.8.8`, `1.1.1.1`)
- **`node:net`** — Custom TCP WHOIS client with referral chain following (no npm dependency)
- **`node:child_process`** — Streaming `tracert`/`traceroute` via `ReadableStream`
- **[HackerTarget API](https://hackertarget.com/)** — Reverse IP lookups (free tier, 100 req/day)
- **Native `fetch`** — HTTP header inspection with manual redirect following

### Deployment
- **[Vercel](https://vercel.com)** — Serverless deployment, auto-deploys on push to `main`
- **[GitHub](https://github.com/andrewhagen2-maker/pixelping)** — Source of truth

---

## Branding

### Name & Domain
**PixelPing** — a nod to the classic `ping` command that every sysadmin knows, fused with the pixel-art visual identity. The domain **`pixelp.ing`** is a creative split on the `.ing` TLD, making the domain itself spell out "pixel ping."

### Visual Identity
The design is intentionally retro — inspired by SNES-era RPG interfaces and early internet aesthetics.

| Token | Value |
|-------|-------|
| Background | `#1a0e00` (deep dark brown) |
| Panel | `#2d1a00` |
| Border | `#7a4a00` |
| Gold accent | `#f5a623` |
| Dark accent | `#d4820a` |
| Cream text | `#f5e6c8` |

- No rounded corners
- No drop shadows
- Flat, blocky UI elements
- Monospace output panels styled like terminal windows
- Pixel-border utility via `box-shadow` stacking

---

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

> **Note:** DNS resolution requires network access to `8.8.8.8` and `1.1.1.1`. In restricted environments (some WSL setups), explicit nameserver config handles this automatically.

---

## Known Limitations

- **Traceroute on Vercel** — uses child process execution; may be restricted in serverless environments depending on platform policy
- **Reverse IP** — powered by HackerTarget's free tier (100 requests/day); heavy usage may hit rate limits
- **WHOIS** — some TLD registrars have rate limiting or non-standard response formats

---

## License

MIT

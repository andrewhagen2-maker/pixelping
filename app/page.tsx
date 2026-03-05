import Link from "next/link";

const tools = [
  {
    href: "/whois",
    icon: "◉",
    title: "WHOIS LOOKUP",
    desc: "Query WHOIS servers for domain or IP info — find the ISP behind any address.",
    tag: "DOMAIN",
  },
  {
    href: "/reverse-ip",
    icon: "◀◀",
    title: "REVERSE IP",
    desc: "Find all domains hosted on a given IP address.",
    tag: "IP",
  },
  {
    href: "/dns",
    icon: "⊞",
    title: "DNS LOOKUP",
    desc: "Retrieve all DNS records for a domain (A, MX, TXT, NS...)",
    tag: "DNS",
  },
  {
    href: "/headers",
    icon: "≡",
    title: "HTTPS HEADERS",
    desc: "Inspect HTTP response headers returned by a web server.",
    tag: "HTTP",
  },
];

// 16-bit pixel art robot mascot — pure SVG rects, no external assets.
// Each logical "pixel" = 4×4 SVG units. Warm palette matching the site.
function PixelRobot() {
  const C = "#2d1a00"; // chassis (dark panel)
  const G = "#f5a623"; // gold (eyes, antenna, chest LED)
  const A = "#d4820a"; // accent (neck, feet, chest fill)
  const B = "#7a4a00"; // border / edge strips

  return (
    <svg
      width={48}
      height={72}
      viewBox="0 0 48 72"
      className="robot-float shrink-0"
      style={{ imageRendering: "pixelated" }}
      aria-label="PixelPing robot mascot"
    >
      {/* ── Antenna ── */}
      <rect x={20} y={0} width={8} height={8} fill={G} />
      <rect x={22} y={8} width={4} height={4} fill={G} />

      {/* ── Head ── */}
      <rect x={4} y={12} width={40} height={24} fill={C} />
      {/* top + bottom edge strips */}
      <rect x={4} y={12} width={40} height={4} fill={B} />
      <rect x={4} y={32} width={40} height={4} fill={B} />

      {/* Left eye */}
      <rect x={10} y={18} width={8} height={8} fill={G} />
      <rect x={12} y={20} width={4} height={4} fill={C} />
      {/* Right eye */}
      <rect x={30} y={18} width={8} height={8} fill={G} />
      <rect x={32} y={20} width={4} height={4} fill={C} />

      {/* Pixel smile: corners dip down, center bar higher */}
      <rect x={12} y={30} width={4} height={2} fill={G} />
      <rect x={16} y={28} width={16} height={2} fill={G} />
      <rect x={32} y={30} width={4} height={2} fill={G} />

      {/* ── Neck ── */}
      <rect x={16} y={36} width={16} height={4} fill={A} />

      {/* ── Body ── */}
      <rect x={2} y={40} width={44} height={20} fill={C} />
      <rect x={2} y={40} width={44} height={4} fill={B} />
      <rect x={2} y={56} width={44} height={4} fill={B} />

      {/* Chest panel border + fill */}
      <rect x={10} y={44} width={28} height={12} fill={B} />
      <rect x={12} y={46} width={24} height={8} fill={A} />
      {/* Chest LED */}
      <rect x={22} y={48} width={4} height={4} fill={G} />

      {/* ── Arms ── */}
      <rect x={0} y={44} width={4} height={10} fill={C} />
      <rect x={0} y={52} width={4} height={2} fill={B} />
      <rect x={44} y={44} width={4} height={10} fill={C} />
      <rect x={44} y={52} width={4} height={2} fill={B} />

      {/* ── Legs ── */}
      <rect x={10} y={60} width={10} height={8} fill={C} />
      <rect x={28} y={60} width={10} height={8} fill={C} />

      {/* ── Feet ── */}
      <rect x={8} y={68} width={14} height={4} fill={A} />
      <rect x={26} y={68} width={14} height={4} fill={A} />
    </svg>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="pixel-panel mb-8">
        <div className="text-pixel-gold text-xl mb-3">PIXELPING</div>
        <div className="text-pixel-accent text-[0.65rem] leading-loose mb-4">
          SELECT A TOOL TO BEGIN
        </div>
        <div className="h-1 bg-pixel-border w-full mb-4" />
        <div className="text-pixel-cream text-[1.1rem] leading-loose font-mono">
          Network diagnostics toolkit. All queries run server-side.
          <br />
          No logs. No tracking. Just results.
        </div>
      </div>

      {/* Featured: Investigate */}
      <Link href="/investigate" className="block mb-4 p-6 border-4 border-pixel-gold bg-pixel-panel hover:bg-[#3d2400] group no-underline">
        <div className="flex items-start gap-4">
          <div className="text-pixel-gold text-xl shrink-0 w-8 text-center mt-1">⚡</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="card-title text-pixel-gold text-[0.7rem]">INVESTIGATE</span>
              <span className="text-[0.5rem] text-pixel-gold border border-pixel-gold px-1">DMCA</span>
            </div>
            <p className="text-pixel-border text-[1.1rem] leading-loose font-mono">
              Full network dossier — DNS, WHOIS, destination IP &amp; abuse contact in one shot.
            </p>
          </div>
        </div>
      </Link>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="tool-card group">
            <div className="flex items-start gap-4">
              <div className="text-pixel-gold text-xl shrink-0 w-8 text-center mt-1">
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="card-title text-pixel-cream text-[0.7rem]">
                    {tool.title}
                  </span>
                  <span className="text-[0.5rem] text-pixel-border border border-pixel-border px-1">
                    {tool.tag}
                  </span>
                </div>
                <p className="text-pixel-border text-[1.1rem] leading-loose font-mono">
                  {tool.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Blinking prompt with pixel robot mascot */}
      <div className="mt-8 flex items-end gap-5">
        <PixelRobot />
        <div className="text-pixel-accent text-[0.6rem]">
          <span>▶ READY</span>
          <span className="blink ml-1">_</span>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="text-pixel-gold text-sm mb-1">📋 TERMS OF SERVICE</div>
        <div className="h-1 bg-pixel-border w-32 mb-4" />
        <p className="text-pixel-border text-[1.0rem] font-mono leading-loose">
          Last updated: March 2026
        </p>
      </div>

      <div className="space-y-6">

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">ACCEPTANCE</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            By using PixelPing you agree to these Terms of Service. If you do not
            agree, please stop using the site. We reserve the right to update these
            terms at any time — continued use constitutes acceptance.
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">PERMITTED USE</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose mb-3">
            PixelPing provides network diagnostic tools for legitimate, lawful purposes
            including:
          </p>
          <ul className="text-pixel-cream text-[1.0rem] font-mono leading-loose space-y-2 list-none">
            <li>▸ Researching hosting providers for domains you own or represent</li>
            <li>▸ Filing DMCA or abuse complaints with hosting providers</li>
            <li>▸ General network diagnostics and DNS research</li>
            <li>▸ Educational and security research purposes</li>
          </ul>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">PROHIBITED USE</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose mb-3">
            You must not use PixelPing to:
          </p>
          <ul className="text-pixel-cream text-[1.0rem] font-mono leading-loose space-y-2 list-none">
            <li>▸ Harass, stalk, or target individuals</li>
            <li>▸ Facilitate attacks on networks, servers, or infrastructure</li>
            <li>▸ Conduct automated scraping or bulk lookups without prior consent</li>
            <li>▸ Violate any applicable local, national, or international law</li>
            <li>▸ Circumvent or abuse rate limits imposed by this service or its providers</li>
          </ul>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">DISCLAIMER OF WARRANTIES</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            PixelPing is provided <span className="text-pixel-gold">&quot;as is&quot;</span> without
            warranty of any kind, express or implied. Results from DNS, WHOIS, geolocation,
            and other tools are for informational purposes only and may not be accurate,
            complete, or up to date. We do not guarantee availability or uptime.
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">LIMITATION OF LIABILITY</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            To the maximum extent permitted by law, PixelPing and its operators shall
            not be liable for any direct, indirect, incidental, or consequential damages
            arising from use of — or inability to use — this service or reliance on
            any information it provides.
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">THIRD-PARTY SERVICES</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            Some tools rely on third-party APIs (ip-api.com, HackerTarget, public WHOIS
            servers, Vercel infrastructure). We are not responsible for the availability,
            accuracy, or privacy practices of those services. Their terms and policies
            govern their own data handling.
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">INTELLECTUAL PROPERTY</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            The PixelPing name, design, and code are the property of their respective
            owners. WHOIS data, DNS records, and other query results belong to their
            respective registrars, registries, and record holders.
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">GOVERNING LAW</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            These terms are governed by applicable law. Any disputes shall be resolved
            in the appropriate jurisdiction.
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">PRIVACY</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            Use of this site is also governed by our{" "}
            <a href="/privacy" className="text-pixel-gold underline">Privacy Policy</a>
            , which is incorporated into these terms by reference.
          </p>
        </div>

      </div>
    </div>
  );
}

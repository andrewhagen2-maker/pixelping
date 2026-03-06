export default function PrivacyPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="text-pixel-gold text-sm mb-1">🔒 PRIVACY POLICY</div>
        <div className="h-1 bg-pixel-border w-32 mb-4" />
        <p className="text-pixel-border text-[1.0rem] font-mono leading-loose">
          Last updated: March 2026
        </p>
      </div>

      <div className="space-y-6">

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">OVERVIEW</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            PixelPing is a network diagnostics toolkit. We are committed to protecting your
            privacy. This policy explains what data is collected, how it is used, and
            what third-party services are involved when you use this site.
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">DATA WE DO NOT COLLECT</div>
          <ul className="text-pixel-cream text-[1.0rem] font-mono leading-loose space-y-2 list-none">
            <li>▸ No accounts or registration required</li>
            <li>▸ No cookies are set by PixelPing</li>
            <li>▸ No personal information is collected or stored</li>
            <li>▸ Queries you run (domains, IPs) are not logged or retained by us</li>
          </ul>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">ANALYTICS — VERCEL WEB ANALYTICS</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose mb-3">
            This site uses Vercel Web Analytics to understand traffic patterns. Vercel
            Analytics is designed to be privacy-friendly:
          </p>
          <ul className="text-pixel-cream text-[1.0rem] font-mono leading-loose space-y-2 list-none">
            <li>▸ No cookies are used</li>
            <li>▸ No personal data or IP addresses are stored</li>
            <li>▸ Data collected is aggregated: page views, referrer, country, device type</li>
            <li>▸ Compliant with GDPR, CCPA, and PECR</li>
          </ul>
          <p className="text-pixel-border text-[0.9rem] font-mono leading-loose mt-3">
            For full details see the{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pixel-gold underline"
            >
              Vercel Analytics Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">THIRD-PARTY LOOKUP SERVICES</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose mb-4">
            When you run certain tools, your query (a domain or IP address) is forwarded
            to third-party services to fulfil the request. No personal information is
            transmitted — only the domain or IP you choose to look up.
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-pixel-border pl-4">
              <div className="text-pixel-gold text-[0.6rem] mb-1">IP GEOLOCATION — ip-api.com</div>
              <p className="text-pixel-border text-[0.9rem] font-mono leading-loose">
                Used by the Investigate tool to geolocate a destination IP address.
                The target IP is sent to ip-api.com. See their{" "}
                <a href="https://ip-api.com/docs/legal" target="_blank" rel="noopener noreferrer" className="text-pixel-gold underline">
                  legal page
                </a>
                .
              </p>
            </div>

            <div className="border-l-4 border-pixel-border pl-4">
              <div className="text-pixel-gold text-[0.6rem] mb-1">REVERSE IP — HackerTarget</div>
              <p className="text-pixel-border text-[0.9rem] font-mono leading-loose">
                Used by the Reverse IP tool to find domains hosted on a given IP.
                The queried IP is sent to HackerTarget. See their{" "}
                <a href="https://hackertarget.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-pixel-gold underline">
                  privacy policy
                </a>
                .
              </p>
            </div>

            <div className="border-l-4 border-pixel-border pl-4">
              <div className="text-pixel-gold text-[0.6rem] mb-1">WHOIS &amp; DNS</div>
              <p className="text-pixel-border text-[0.9rem] font-mono leading-loose">
                WHOIS queries are made directly to public WHOIS servers via TCP.
                DNS lookups use Google (8.8.8.8) and Cloudflare (1.1.1.1) public resolvers.
                Standard query logging policies of those services may apply.
              </p>
            </div>
          </div>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">HOSTING</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            PixelPing is hosted on Vercel. Vercel may process standard server-side
            request metadata (e.g. IP addresses in access logs) as part of normal
            infrastructure operation. See the{" "}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-pixel-gold underline">
              Vercel Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">CHANGES TO THIS POLICY</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            We may update this policy from time to time. Continued use of the site
            after changes are posted constitutes acceptance of the revised policy.
          </p>
        </div>

        <div className="pixel-panel">
          <div className="text-pixel-gold text-[0.65rem] mb-3">CONTACT</div>
          <p className="text-pixel-cream text-[1.0rem] font-mono leading-loose">
            Questions about this privacy policy? Visit our{" "}
            <a href="/terms" className="text-pixel-gold underline">Terms of Service</a>{" "}
            page or reach out via the GitHub repository.
          </p>
        </div>

      </div>
    </div>
  );
}

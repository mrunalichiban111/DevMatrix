"use client";

const Footer = () => {

  return (
    <footer
      id="footer"
      className="relative w-full bg-black border-t border-dark-200/50 pt-20 pb-0"
    >
      <div className="container mx-auto px-5 2xl:px-0">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
          {/* Brand Section */}
          <div className="flex flex-col gap-4 lg:w-1/3">
            <div className="flex items-center gap-2">
              <img
                src="/assets/logo.svg"
                alt="Red Stakes"
                className="h-6 w-auto invert"
              />
              <span className="text-white font-semibold text-sm tracking-widest uppercase">
                Trendifi
              </span>
            </div>
            <p className="text-dark-100 text-xs font-light leading-relaxed max-w-xs uppercase">
              BET ON WHAT WILL GO VIRAL. TRADE ATTENTION LIKE MARKETS, PREDICT
              TRENDS BEFORE THE INTERNET DOES.
            </p>
          </div>

          {/* Links Section */}
          <div
            className="flex flex-col lg:flex-row gap-12 lg:gap-20"
          >
            {/* Product */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white font-semibold text-xs uppercase tracking-widest">
                Product
              </h3>
              <ul className="space-y-2">
                {["Trends", "Markets", "Portfolio", "Leaderboard"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="footer-link text-dark-100 text-xs font-light hover:text-[#39FF14] transition-colors duration-300 ease-in-out"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white font-semibold text-xs uppercase tracking-widest">
                Resources
              </h3>
              <ul className="space-y-2">
                {["Docs", "API", "Blog", "Community"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="footer-link text-dark-100 text-xs font-light hover:text-[#39FF14] transition-colors duration-300 ease-in-out"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white font-semibold text-xs uppercase tracking-widest">
                Company
              </h3>
              <ul className="space-y-2">
                {["About", "Careers", "Contact", "Terms"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="footer-link text-dark-100 text-xs font-light hover:text-[#39FF14] transition-colors duration-300 ease-in-out"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider with animation */}
        <div className="footer-divider h-[1px] bg-dark-200/50 mb-8" />

        {/* Bottom Section */}
        <div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-6"
        >
          {/* Copyright */}
          <p className="text-dark-100 text-xs font-light uppercase">
            © 2026 TRENDIFI. ALL RIGHTS RESERVED. BUILT FOR THE FUTURE OF
            VIRALITY.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4">
            {[
              {
                name: "Twitter",
                icon: "𝕏",
                href: "#",
              },
              {
                name: "Discord",
                icon: "◆",
                href: "#",
              },
              {
                name: "GitHub",
                icon: "⚙",
                href: "#",
              },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                className="social-icon group relative size-9 flex-center rounded-full border border-dark-200/50 hover:border-[#39FF14]/50 transition-all duration-300 ease-in-out hover:bg-[#39FF14]/10"
              >
                <span className="text-xs text-dark-100 group-hover:text-[#39FF14] transition-colors duration-300">
                  {social.icon}
                </span>
                {/* Tooltip */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 bg-dark-200/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                  {social.name}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Scroll to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute right-5 lg:right-10 top-20 size-10 flex-center rounded-full border border-dark-200/50 text-dark-100 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-all duration-300 ease-in-out group"
          aria-label="Scroll to top"
        >
          <svg
            className="w-4 h-4 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7-7m0 0l-7 7m7-7v12"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default Footer;

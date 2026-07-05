'use client'

// X (Twitter) Logo - New Design
function XLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// Discord Logo
function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

// Official Galxe Logomark (Comet design)
function GalxeLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="147 73.518 128.172 82"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m235.853 83.215-80.245 46.282 74.553-54.963a5.198 5.198 0 1 1 5.689 8.684l.003-.003z" />
      <path d="M247.319 123.27a3.901 3.901 0 0 0-5.327-1.424l-53.125 30.638 56.579-23.674a3.894 3.894 0 0 0 1.87-5.54h.003z" />
      <path d="M274.122 82.198c-2.247-3.888-7.306-5.09-11.064-2.63L147 155.518l123.87-62.433c4.012-2.023 5.5-7 3.252-10.887z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm safe-area-bottom">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Credits */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)] order-2 sm:order-1">
            <span>Built by</span>
            <span className="font-semibold text-[var(--text-primary)]">
              ForgeLabs
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 sm:gap-4 order-1 sm:order-2">
            {/* X (Twitter) */}
            <a
              href="https://x.com/Xylonet_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all duration-200 group min-h-[40px]"
              title="Follow us on X"
            >
              <XLogo className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
              <span className="text-xs sm:text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Follow
              </span>
            </a>

            {/* Discord */}
            <a
              href="https://discord.gg/mcDkHNrFyA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[#5865F2] hover:bg-[#5865F2]/10 transition-all duration-200 group min-h-[40px]"
              title="Join our Discord"
            >
              <DiscordLogo className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[#5865F2] transition-colors" />
              <span className="text-xs sm:text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Discord
              </span>
            </a>

            {/* Galxe */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] opacity-60 cursor-not-allowed min-h-[40px]"
              title="Galxe - Coming Soon"
            >
              <GalxeLogo className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs sm:text-sm text-[var(--text-muted)]">
                Galxe
              </span>
              <span className="text-[10px] sm:text-xs text-[var(--text-muted)] bg-[var(--surface)] px-1 sm:px-1.5 py-0.5 rounded">
                Soon
              </span>
            </div>
          </div>

          {/* Legal Links & Copyright */}
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-[var(--text-muted)] order-3">
            <a href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
            <span>•</span>
            <span>© {new Date().getFullYear()} XyloNet</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

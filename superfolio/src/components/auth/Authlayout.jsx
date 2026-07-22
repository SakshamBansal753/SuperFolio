import StatusTicker from "./StatusTicker";

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  return (
    <div className="flex min-h-screen w-full bg-background font-body text-foreground">
      {/* Signature panel — hidden below lg, this is the one bold move */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden border-r border-foreground/10 bg-background px-12 py-12 text-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(226,166,59,0.10),transparent_45%)]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
              JobPilot AI
            </span>
          </div>

          <h1 className="mt-10 max-w-sm font-display text-4xl leading-[1.1] text-foreground">
            Every application, <span className="italic text-amber">tracked</span> the
            moment it moves.
          </h1>

          <p className="mt-4 max-w-xs text-sm text-mist">
            JobPilot reads your inbox and updates your board automatically — no more
            copy-pasting into a spreadsheet.
          </p>
        </div>

        <div className="relative z-10 mt-16">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist/70">
            Live board activity
          </p>
          <StatusTicker />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 flex-col justify-center bg-background px-6 py-12 sm:px-12 lg:w-[56%] lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
              JobPilot AI
            </span>
          </div>

          {eyebrow && (
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-mist">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-3xl text-foreground">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-foreground/60">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
import StatusTicker from "./StatusTicker";

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-body text-slate-900">
      {/* Signature panel — hidden below lg */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden border-r border-slate-200 bg-slate-100/70 px-12 py-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,119,6,0.06),transparent_50%)]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
              JobPilot
            </span>
          </div>

          <h1 className="mt-10 max-w-sm font-display text-4xl leading-[1.15] text-slate-900">
            Every application, <span className="italic text-amber-600">tracked</span> the
            moment it moves.
          </h1>

          <p className="mt-4 max-w-xs text-sm text-slate-600">
            JobPilot reads your recruiter emails and updates your board automatically — no more
            copy-pasting into spreadsheets.
          </p>
        </div>

        <div className="relative z-10 mt-16">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Live board activity
          </p>
          <StatusTicker />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:w-[56%] lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
              JobPilot
            </span>
          </div>

          {eyebrow && (
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-3xl font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

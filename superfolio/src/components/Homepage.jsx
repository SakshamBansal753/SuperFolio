import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { clerkAppearance } from "./auth/clerkAppearance";

const APPLIED = [
  { company: "Vantage Robotics", role: "Frontend Engineer" },
  { company: "Nordlight Health", role: "Product Designer" },
];

const INTERVIEW = {
  company: "Solace Data",
  role: "Senior Engineer",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <style>{`
        @keyframes jp-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes jp-draw {
          from { stroke-dashoffset: 22; opacity: 0; }
          40% { opacity: 1; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>

      <header className="sticky top-0 z-10 border-b border-foreground/10 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-12">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
              JobPilot AI
            </span>
          </div>

          <SignedOut>
            <div className="flex items-center gap-6">
              <Link
                to="/sign-in"
                className="font-body text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="rounded-md bg-amber px-4 py-2 font-body text-sm font-medium text-background transition-colors hover:bg-amber/90"
              >
                Get started
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={clerkAppearance} afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20 sm:px-12 sm:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Copy column */}
          <div className="flex flex-col items-start">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
              One workspace, every application
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl leading-[1.1] text-foreground sm:text-5xl">
              Stop tracking your job search in a spreadsheet.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/70">
              JobPilot reads your inbox and moves the right card the moment a
              recruiter replies. No manual updates, no lost track of where
              things stand.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <SignedOut>
                <Link
                  to="/sign-up"
                  className="rounded-md bg-amber px-6 py-3 text-center font-body text-sm font-medium text-background transition-colors hover:bg-amber/90"
                >
                  Create your board
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="rounded-md bg-amber px-6 py-3 text-center font-body text-sm font-medium text-background transition-colors hover:bg-amber/90"
                >
                  Go to your board
                </Link>
              </SignedIn>
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-mist">
                No credit card required
              </span>
            </div>
          </div>

          {/* Signature element: live board preview */}
          <div
            className="motion-safe:[animation:jp-fade-up_0.6s_ease-out_both] rounded-xl border border-foreground/10 bg-foreground/[0.02] p-5"
            aria-hidden="true"
          >
            <div className="mb-4 flex items-center gap-2 rounded-md border border-foreground/10 bg-background px-3 py-2 motion-safe:[animation:jp-fade-up_0.5s_ease-out_0.15s_both]">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                New reply
              </span>
              <span className="truncate text-xs text-foreground/70">
                Re: {INTERVIEW.role} — loop scheduled for next week
              </span>
            </div>

            <svg
              viewBox="0 0 20 24"
              className="mx-auto mb-2 h-6 w-5 text-mist motion-safe:[animation:jp-draw_0.5s_ease-out_0.4s_both]"
              fill="none"
            >
              <path
                d="M10 1 L10 20 M4 14 L10 21 L16 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="22"
              />
            </svg>

            <div className="grid grid-cols-3 gap-3">
              <BoardColumn label="Applied">
                {APPLIED.map((card) => (
                  <Card key={card.company} {...card} />
                ))}
              </BoardColumn>

              <BoardColumn label="Interview" accent>
                <div className="motion-safe:[animation:jp-fade-up_0.5s_ease-out_0.6s_both]">
                  <Card {...INTERVIEW} highlighted />
                  <span className="mt-1.5 inline-block rounded-full bg-amber/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber motion-safe:[animation:jp-fade-up_0.4s_ease-out_0.9s_both]">
                    Moved automatically
                  </span>
                </div>
              </BoardColumn>

              <BoardColumn label="Offer">
                <div className="rounded-md border border-dashed border-foreground/15 px-2 py-3 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/30">
                  Waiting
                </div>
              </BoardColumn>
            </div>
          </div>
        </div>

        {/* How it works */}
        <section className="mt-32 border-t border-foreground/10 pt-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
            How it works
          </p>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            <Step
              n="01"
              title="Connect your inbox"
              body="Link the account you use for job applications. JobPilot only reads messages related to your search."
            />
            <Step
              n="02"
              title="We read the reply"
              body="Every recruiter message gets matched to the right company and role, no matter how it's worded."
            />
            <Step
              n="03"
              title="Your board updates itself"
              body="The card moves to Interview, Offer, or Rejected the moment the reply lands. You just show up."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/10 px-6 py-8 text-center sm:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-mist">
          JobPilot AI
        </p>
      </footer>
    </div>
  );
}

function BoardColumn({ label, accent, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className={`font-mono text-[9px] uppercase tracking-[0.12em] ${
          accent ? "text-amber" : "text-mist"
        }`}
      >
        {label}
      </span>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Card({ company, role, highlighted }) {
  return (
    <div
      className={`rounded-md border px-2 py-2 ${
        highlighted
          ? "border-amber/40 bg-amber/[0.06] ring-1 ring-amber/30"
          : "border-foreground/10 bg-background"
      }`}
    >
      <p className="truncate text-[11px] font-medium text-foreground/80">
        {company}
      </p>
      <p className="truncate text-[10px] text-foreground/50">{role}</p>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div>
      <span className="font-mono text-xs text-amber">{n}</span>
      <h3 className="mt-2 font-display text-lg text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/60">{body}</p>
    </div>
  );
}
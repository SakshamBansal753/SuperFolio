import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { clerkAppearance } from "./auth/clerkAppearance";

const APPLIED = [
  { company: "Vantage Robotics", role: "Frontend Engineer" },
  { company: "Nordlight Health", role: "Product Designer" },
];

const INTERVIEW = {
  company: "Solace Data",
  role: "Senior Backend Engineer",
};

const FEATURES = [
  {
    type: "lightning",
    title: "Groq AI Reasoning",
    description:
      "Instant LPU inference accurately classifies emails into Applied, Screening, Interview, Offer, or Rejection with zero prompt latency.",
  },
  {
    type: "mail",
    title: "One-Click Gmail Jump",
    description:
      "Every card includes a direct link that jumps straight to that exact recruiter email thread in your Gmail inbox.",
  },
  {
    type: "board",
    title: "Full-Screen Kanban",
    description:
      "A distraction-free, 100% viewport workspace designed for quick overview, quick stage moves, and easy card inspection.",
  },
  {
    type: "filter",
    title: "Noise and Promo Filtering",
    description:
      "Marketing spam and learning newsletters (Naukri MINIs, LeetCode alerts, Udemy) are automatically labeled Promotional and excluded from your board.",
  },
  {
    type: "shield",
    title: "Zero-Trust Multi-Tenancy",
    description:
      "Secured by Clerk JWTs verified against official JWKS keys on every API request. Each user's data is strictly isolated.",
  },
  {
    type: "server",
    title: "Resilient Caching",
    description:
      "Dual-tier Redis caching with seamless in-memory fallback guarantees snappy load times even under spotty network connections.",
  },
];

const COMPARISON = [
  {
    feature: "Status Updating",
    spreadsheet: "Manual copy-pasting dates and company names",
    jobpilot: "Automatic: AI moves cards the moment recruiters reply",
  },
  {
    feature: "Finding Email Threads",
    spreadsheet: "Searching through hundreds of inbox emails",
    jobpilot: "1-Click redirect opens the exact thread in Gmail",
  },
  {
    feature: "Application Details",
    spreadsheet: "Lost links and forgotten recruiter notes",
    jobpilot: "Stored email previews and complete scrollable body",
  },
  {
    feature: "Pipeline Overview",
    spreadsheet: "Static table rows with no visual clarity",
    jobpilot: "Full-screen Kanban columns for each interview stage",
  },
];

const FAQS = [
  {
    q: "Does JobPilot read all my personal emails?",
    a: "No. JobPilot uses a strict Gmail query filter that only retrieves messages containing recruiter and job-search keywords (e.g. 'interview', 'application', 'offer', 'thank you for applying'). Personal messages, newsletters, and receipts are never touched.",
  },
  {
    q: "How does the 'Open in Gmail' link work?",
    a: "When an email is ingested from Gmail, its unique message ID is recorded. Clicking the Gmail link on any card opens Gmail directly to that exact recruiter conversation thread in a new tab.",
  },
  {
    q: "Can I manually add and move cards?",
    a: "Yes. You can create cards manually via '+ Add card', delete them anytime, or change their stage instantly using the dropdown on the card or inside the card details modal.",
  },
  {
    q: "How does the AI classification work?",
    a: "We pass the email subject and body to Groq's high-speed reasoning model (openai/gpt-oss-20b). The AI extracts the company name, job role, and categorizes the stage (Applied, Screening, Interview, Offer, Rejected, or Promotional).",
  },
];

function FeatureIcon({ type }) {
  if (type === "lightning") {
    return (
      <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (type === "mail") {
    return (
      <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type === "board") {
    return (
      <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    );
  }
  if (type === "filter") {
    return (
      <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    );
  }
  if (type === "shield") {
    return (
      <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900">
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

      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-12">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
              JobPilot
            </span>
          </div>

          <SignedOut>
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                to="/sign-in"
                className="font-body text-xs sm:text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="rounded-lg bg-amber-600 px-3.5 py-1.5 sm:px-4 sm:py-2 font-body text-xs sm:text-sm font-medium text-white transition-colors hover:bg-amber-700 shadow-xs"
              >
                Get started
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="rounded-lg bg-amber-600 px-3.5 py-1.5 font-body text-xs sm:text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                Go to Dashboard
              </Link>
              <UserButton appearance={clerkAppearance} afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-12 sm:py-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          {/* Copy column */}
          <div className="flex flex-col items-start">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              SMART APPLICATION WORKSPACE
            </span>
            <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.035em] leading-[1.12] text-slate-950 sm:text-5xl lg:text-[56px]">
              Everything you need to bring your <span className="font-serif italic font-normal text-slate-900">ideas</span> to life.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 font-normal">
              Stop tracking your job search in a spreadsheet. JobPilot reads your recruiter emails,
              classifies stages with Groq AI, and automatically updates your board the moment companies reply.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <SignedOut>
                <Link
                  to="/sign-up"
                  className="rounded-lg bg-amber-600 px-6 py-3 text-center font-body text-sm font-medium text-white transition-colors hover:bg-amber-700 shadow-sm"
                >
                  Create your board
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="rounded-lg bg-amber-600 px-6 py-3 text-center font-body text-sm font-medium text-white transition-colors hover:bg-amber-700 shadow-sm"
                >
                  Open your board
                </Link>
              </SignedIn>
              <span className="font-mono text-xs uppercase tracking-[0.1em] text-slate-400">
                Free &bull; No credit card
              </span>
            </div>
          </div>

          {/* Interactive Board Preview Card */}
          <div
            className="motion-safe:[animation:jp-fade-up_0.6s_ease-out_both] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            aria-hidden="true"
          >
            <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 motion-safe:[animation:jp-fade-up_0.5s_ease-out_0.15s_both]">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Recruiter Reply
                </span>
                <span className="truncate text-xs font-medium text-slate-700">
                  Re: {INTERVIEW.role} &bull; technical screen scheduled
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Just now</span>
            </div>

            <svg
              viewBox="0 0 20 24"
              className="mx-auto mb-2 h-6 w-5 text-slate-400 motion-safe:[animation:jp-draw_0.5s_ease-out_0.4s_both]"
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
                  <span className="mt-1.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-amber-800 motion-safe:[animation:jp-fade-up_0.4s_ease-out_0.9s_both]">
                    Moved by AI
                  </span>
                </div>
              </BoardColumn>

              <BoardColumn label="Offer">
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2 py-3 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-slate-400">
                  Waiting
                </div>
              </BoardColumn>
            </div>
          </div>
        </div>

        {/* How it works */}
        <section className="mt-28 border-t border-slate-200 pt-16">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              SIMPLE WORKFLOW
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-950">
              How JobPilot works in three <span className="font-serif italic font-normal text-slate-800">simple</span> steps.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Step
              n="01"
              title="Connect your inbox"
              body="Link your Google account through Clerk OAuth. JobPilot scans exclusively for recruiter and job-related email patterns."
            />
            <Step
              n="02"
              title="Groq AI classifies stage"
              body="Incoming replies are instantly parsed: company name, job role, and status (Applied, Screening, Interview, Offer, Rejected)."
            />
            <Step
              n="03"
              title="Full-screen board & Gmail jump"
              body="Cards automatically progress on your Kanban board with full message previews and direct 1-click links to reply in Gmail."
            />
          </div>
        </section>

        {/* Core Features Grid (No Emojis, Clean SVGs) */}
        <section className="mt-28 border-t border-slate-200 pt-16">
          <div className="max-w-xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              CORE FEATURES
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-950">
              Everything built for a <span className="font-serif italic font-normal text-slate-800">stress-free</span> job hunt.
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              No bloated AI gimmicks, no complex setup. Just a fast, quiet workspace that works with your email.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/80 border border-slate-200/60">
                  <FeatureIcon type={feat.type} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {feat.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="mt-28 border-t border-slate-200 pt-16">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              WHY SWITCH
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-950">
              Manual spreadsheets vs. <span className="font-serif italic font-normal text-slate-800">JobPilot</span>.
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              <div>Aspect</div>
              <div className="text-rose-600">Spreadsheet</div>
              <div className="text-amber-800">JobPilot AI</div>
            </div>
            <div className="divide-y divide-slate-100">
              {COMPARISON.map((row) => (
                <div key={row.feature} className="grid grid-cols-3 px-6 py-4 text-xs">
                  <div className="font-semibold text-slate-800">{row.feature}</div>
                  <div className="text-slate-500">{row.spreadsheet}</div>
                  <div className="font-medium text-slate-900">{row.jobpilot}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer Spotlight Section */}
        <section className="mt-28 border-t border-slate-200 pt-16">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              CREATOR SPOTLIGHT
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-950">
              Built by <span className="font-serif italic font-normal text-slate-800">Saksham Bansal</span>.
            </h2>
          </div>

          <div className="mt-10 mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src="https://avatars.githubusercontent.com/u/196468482?v=4"
                alt="Saksham Bansal"
                className="h-24 w-24 rounded-2xl border-2 border-slate-200 object-cover shadow-sm"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                      Saksham Bansal
                    </h3>
                    <p className="font-mono text-xs text-amber-700">@SakshamBansal753</p>
                  </div>
                  <a
                    href="https://github.com/SakshamBansal753"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    GitHub Profile
                  </a>
                </div>

                <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
                  Passionate about clean code, beautiful UI, and building cool developer tools. Turning curiosity into code with 46+ open-source repositories and 1000+ algorithmic solutions solved.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600 border border-slate-200">
                    Gwalior, India
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 font-mono text-[11px] text-amber-800 border border-amber-200">
                    46+ Repositories
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 font-mono text-[11px] text-blue-800 border border-blue-200">
                    1000+ LeetCode Solved
                  </span>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Featured Works by Saksham
                  </p>
                  <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 text-xs">
                    <a
                      href="https://github.com/SakshamBansal753/gitai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:border-amber-300 hover:bg-amber-50/40 transition-colors"
                    >
                      <div className="font-semibold text-slate-800 group-hover:text-amber-800">
                        gitai &rarr;
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Natural language Git & GitHub assistant powered by FastMCP and Groq.
                      </p>
                    </a>
                    <a
                      href="https://github.com/SakshamBansal753/switch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:border-amber-300 hover:bg-amber-50/40 transition-colors"
                    >
                      <div className="font-semibold text-slate-800 group-hover:text-amber-800">
                        switch &rarr;
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Open-source AI teammates & multi-agent orchestration with MCP across Slack, Discord & Linear.
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-28 border-t border-slate-200 pt-16">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-950">
              Clear answers to <span className="font-serif italic font-normal text-slate-800">common</span> questions.
            </h2>
          </div>

          <div className="mt-12 mx-auto max-w-3xl space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-slate-200 bg-white shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-slate-900"
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 font-mono text-base text-slate-400">
                      {isOpen ? "-" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-6 pb-4 pt-2 text-xs leading-relaxed text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-28 rounded-3xl border border-slate-200 bg-white p-8 sm:p-14 text-center shadow-xs">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
            GET ORGANIZED TODAY
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-950">
            Never lose track of a job <span className="font-serif italic font-normal text-slate-800">opportunity</span> again.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-slate-600 leading-relaxed font-normal">
            Connect your inbox in seconds. Your board configures itself automatically with zero manual entry.
          </p>
          <div className="mt-8 flex justify-center">
            <SignedOut>
              <Link
                to="/sign-up"
                className="rounded-xl bg-amber-600 px-8 py-3.5 font-body text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition-colors"
              >
                Create your board now &rarr;
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="rounded-xl bg-amber-600 px-8 py-3.5 font-body text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition-colors"
              >
                Go to your dashboard &rarr;
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10 sm:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
              JobPilot
            </span>
            <p className="mt-1 text-xs text-slate-500">
              The intelligent, full-screen job application workspace.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-400">
            &copy; {new Date().getFullYear()} JobPilot AI &bull; Created by Saksham Bansal
          </p>
        </div>
      </footer>
    </div>
  );
}

function BoardColumn({ label, accent, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
          accent ? "text-amber-700" : "text-slate-400"
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
      className={`rounded-lg border p-2.5 transition-shadow ${
        highlighted
          ? "border-amber-300 bg-amber-50/60 shadow-xs"
          : "border-slate-200 bg-white shadow-xs"
      }`}
    >
      <p className="truncate text-xs font-medium text-slate-900">{company}</p>
      <p className="truncate text-[11px] text-slate-500">{role}</p>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <span className="font-mono text-xs font-semibold text-amber-600">{n}</span>
      <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

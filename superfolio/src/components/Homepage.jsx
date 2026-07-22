import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
            JobPilot AI
          </span>
        </div>

        <SignedOut>
          <div className="flex items-center gap-4">
            <Link to="/sign-in" className="font-body text-sm text-foreground/70 hover:text-amber">
              Sign in
            </Link>
            <Link
              to="/sign-up"
              className="rounded-md bg-amber px-4 py-2 font-body text-sm text-background hover:bg-amber/90"
            >
              Get started
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-start px-6 py-24 sm:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
          One workspace, every application
        </p>
        <h1 className="mt-4 max-w-xl font-display text-5xl leading-[1.1] text-foreground">
          Stop tracking your job search in a spreadsheet.
        </h1>
        <p className="mt-5 max-w-lg text-base text-foreground/70">
          JobPilot turns your inbox into a live Kanban board — every recruiter
          reply moves the right card, automatically.
        </p>

        <SignedOut>
          <Link
            to="/sign-up"
            className="mt-8 rounded-md bg-amber px-6 py-3 font-body text-sm text-background hover:bg-amber/90"
          >
            Create your board
          </Link>
        </SignedOut>

        <SignedIn>
          <Link
            to="/dashboard"
            className="mt-8 rounded-md bg-amber px-6 py-3 font-body text-sm text-background hover:bg-amber/90"
          >
            Go to your board
          </Link>
        </SignedIn>
      </main>
    </div>
  );
}
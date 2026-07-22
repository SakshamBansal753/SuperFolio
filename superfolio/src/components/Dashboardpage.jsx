import { UserButton, useUser } from "@clerk/clerk-react";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
            JobPilot AI
          </span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <main className="px-6 py-16 sm:px-12">
        <h1 className="font-display text-3xl text-foreground">
          Welcome{user?.username ? `, ${user.username}` : ""}.
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Your board goes here — this page is a placeholder until the Kanban
          view is built.
        </p>
      </main>
    </div>
  );
}
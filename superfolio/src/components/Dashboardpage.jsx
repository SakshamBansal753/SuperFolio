import { useEffect, useState } from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { clerkAppearance } from "./auth/clerkAppearance";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchColumns() {
      try {
        const token = await getToken();

        const res = await fetch("http://localhost:8000/columns", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();
        setColumns(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchColumns();
  }, [getToken]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
            JobPilot AI
          </span>
        </div>

        <UserButton appearance={clerkAppearance} afterSignOutUrl="/" />
      </header>

      {/* Takes the remaining viewport height */}
      <main className="h-[calc(100vh-73px)] overflow-hidden px-6 py-8 sm:px-12">
        {loading && <p className="text-mist">Loading your board…</p>}

        {error && <p className="text-red-400">Error: {error}</p>}

        {!loading && !error && (
          <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex h-full w-72 flex-shrink-0 flex-col rounded-lg bg-surface p-3"
              >
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: column.color ?? "#9AA3AF",
                    }}
                  />

                  <h2 className="font-mono text-xs uppercase tracking-wide text-foreground/80">
                    {column.name}
                  </h2>
                </div>

                {/* Cards Area */}
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-md border border-dashed border-foreground/10 p-3">
                  <p className="text-xs text-mist">No cards yet</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
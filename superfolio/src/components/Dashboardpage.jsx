import { useEffect, useState } from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";

const API_BASE = "http://localhost:8000";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [columns, setColumns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New-card form state
  const [showForm, setShowForm] = useState(false);
  const [formColumnId, setFormColumnId] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Emails panel state
  const [emails, setEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [classifying, setClassifying] = useState(null); // email id currently classifying
  const [classifications, setClassifications] = useState({}); // { [emailId]: label }

  async function authedFetch(path, options = {}) {
    const token = await getToken();
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  }

  async function fetchBoard() {
    try {
      const [columnsRes, applicationsRes] = await Promise.all([
        authedFetch("/columns"),
        authedFetch("/application"),
      ]);

      if (!columnsRes.ok || !applicationsRes.ok) {
        throw new Error(
          `Request failed: columns ${columnsRes.status}, applications ${applicationsRes.status}`
        );
      }

      const columnsData = await columnsRes.json();
      setColumns(columnsData);
      setApplications(await applicationsRes.json());

      if (columnsData.length > 0) {
        setFormColumnId((prev) => prev || columnsData[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmails() {
    setEmailsLoading(true);
    try {
      const res = await authedFetch("/emails");
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setEmails(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setEmailsLoading(false);
    }
  }

  useEffect(() => {
    fetchBoard();
    fetchEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateCard(e) {
    e.preventDefault();
    if (!formCompany || !formRole || !formColumnId) return;

    setSubmitting(true);
    try {
      const res = await authedFetch("/application", {
        method: "POST",
        body: JSON.stringify({
          column_id: formColumnId,
          company: formCompany,
          role: formRole,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
      }

      setFormCompany("");
      setFormRole("");
      setShowForm(false);
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await authedFetch("/emails/sync", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
      }
      await fetchEmails(); // reload the full list, including anything new
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleClassify(emailId) {
    setClassifying(emailId);
    try {
      const res = await authedFetch(`/emails/${emailId}/classify`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setClassifications((prev) => ({ ...prev, [emailId]: data.classification }));
    } catch (err) {
      setError(err.message);
    } finally {
      setClassifying(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
            JobPilot AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-md bg-amber px-3 py-1.5 font-body text-sm text-background hover:bg-amber/90"
          >
            {showForm ? "Cancel" : "+ Add card"}
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {showForm && (
        <form
          onSubmit={handleCreateCard}
          className="flex flex-wrap items-end gap-3 border-b border-foreground/10 bg-surface px-6 py-4 sm:px-12"
        >
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-mist">
              Column
            </label>
            <select
              value={formColumnId}
              onChange={(e) => setFormColumnId(e.target.value)}
              className="rounded-md border border-foreground/15 bg-background px-3 py-1.5 text-sm text-foreground"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-mist">
              Company
            </label>
            <input
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
              placeholder="Stripe"
              className="rounded-md border border-foreground/15 bg-background px-3 py-1.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-mist">
              Role
            </label>
            <input
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              placeholder="Backend Engineer"
              className="rounded-md border border-foreground/15 bg-background px-3 py-1.5 text-sm text-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-amber px-4 py-1.5 font-body text-sm text-background hover:bg-amber/90 disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      <main className="px-6 py-8 sm:px-12">
        {loading && <p className="text-mist">Loading your board…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        {!loading && !error && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => {
              const cardsInColumn = applications
                .filter((app) => app.column_id === column.id)
                .sort((a, b) => a.position - b.position);

              return (
                <div key={column.id} className="w-72 flex-shrink-0 rounded-lg bg-surface p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: column.color ?? "#9AA3AF" }}
                      />
                      <h2 className="font-mono text-xs uppercase tracking-wide text-foreground/80">
                        {column.name}
                      </h2>
                    </div>
                    <span className="font-mono text-[11px] text-mist">
                      {cardsInColumn.length}
                    </span>
                  </div>

                  <div className="flex min-h-[120px] flex-col gap-2">
                    {cardsInColumn.length === 0 && (
                      <div className="rounded-md border border-dashed border-foreground/10 p-3">
                        <p className="text-xs text-mist">No cards yet</p>
                      </div>
                    )}
                    {cardsInColumn.map((app) => (
                      <div
                        key={app.id}
                        className="rounded-md border border-foreground/10 bg-background p-3"
                      >
                        <p className="text-sm font-medium text-foreground">{app.role}</p>
                        <p className="text-xs text-mist">{app.company}</p>
                        {app.notes && (
                          <p className="mt-2 line-clamp-2 text-xs text-foreground/60">
                            {app.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Emails / classification test panel */}
        <section className="mt-10 border-t border-foreground/10 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Emails</h2>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-md border border-foreground/15 px-3 py-1.5 font-body text-sm text-foreground hover:bg-foreground/[0.03] disabled:opacity-50"
            >
              {syncing ? "Syncing…" : "Sync Gmail"}
            </button>
          </div>

          {emailsLoading && <p className="text-mist">Loading emails…</p>}
          {!emailsLoading && emails.length === 0 && (
            <p className="text-sm text-mist">
              No emails stored yet — click "Sync Gmail" to fetch some.
            </p>
          )}

          <div className="flex flex-col gap-2">
            {emails.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between rounded-md border border-foreground/10 bg-surface p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{email.subject}</p>
                  <p className="truncate text-xs text-mist">{email.sender}</p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                  {classifications[email.id] && (
                    <span className="rounded-full border border-amber/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber">
                      {classifications[email.id]}
                    </span>
                  )}
                  <button
                    onClick={() => handleClassify(email.id)}
                    disabled={classifying === email.id}
                    className="rounded-md border border-foreground/15 px-3 py-1 font-mono text-xs uppercase tracking-wide text-foreground hover:bg-foreground/[0.03] disabled:opacity-50"
                  >
                    {classifying === email.id ? "…" : "Classify"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
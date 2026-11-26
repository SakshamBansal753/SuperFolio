import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { clerkAppearance } from "./auth/clerkAppearance";

// Automatically use matching host (127.0.0.1 or localhost)
const INITIAL_API_BASE =
  typeof window !== "undefined" && window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "http://localhost:8000";

let currentApiBase = INITIAL_API_BASE;

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

  // Action states
  const [syncing, setSyncing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Card details modal state
  const [selectedCard, setSelectedCard] = useState(null);

  function openInGmail(gmailMessageId, fallbackQuery) {
    const isRealGmailId =
      gmailMessageId &&
      !gmailMessageId.startsWith("seed-") &&
      /^[0-9a-fA-F]+$/.test(gmailMessageId);

    let url;
    if (isRealGmailId) {
      url = `https://mail.google.com/mail/u/0/#all/${gmailMessageId}`;
    } else {
      const q = fallbackQuery || "job application";
      url = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(q)}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function authedFetch(path, options = {}) {
    const token = await getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    };

    try {
      return await fetch(`${currentApiBase}${path}`, { ...options, headers });
    } catch (primaryErr) {
      // Seamlessly fallback between localhost and 127.0.0.1 (IPv4 / IPv6 mismatch)
      const altBase = currentApiBase.includes("localhost")
        ? currentApiBase.replace("localhost", "127.0.0.1")
        : currentApiBase.replace("127.0.0.1", "localhost");
      try {
        const altRes = await fetch(`${altBase}${path}`, { ...options, headers });
        currentApiBase = altBase; // persist working endpoint
        return altRes;
      } catch {
        throw primaryErr;
      }
    }
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
      const appsData = await applicationsRes.json();

      setColumns(columnsData);
      setApplications(appsData);

      if (columnsData.length > 0) {
        setFormColumnId((prev) => prev || columnsData[0].id);
      }
      setError(null);
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError(
          "Backend server is not running on port 8000. In PowerShell, run: cd backend; .\\backend\\Scripts\\activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBoard();
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

  async function handleDeleteCard(applicationId) {
    try {
      const res = await authedFetch(`/application/${applicationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete card");
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMoveCard(applicationId, newColumnId) {
    try {
      const res = await authedFetch(`/application/${applicationId}`, {
        method: "PATCH",
        body: JSON.stringify({ column_id: newColumnId }),
      });
      if (!res.ok) throw new Error("Failed to move card");
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSync() {
    setError(null);
    setSyncing(true);
    try {
      const res = await authedFetch("/emails/sync", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
      }
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleSeedSampleEmails() {
    setError(null);
    setSeeding(true);
    try {
      const res = await authedFetch("/emails/seed", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed: ${res.status}`);
      }
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 font-body text-slate-900">
      {/* Top Header Navbar */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <Link
            to="/"
            className="group flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
            title="Go to Homepage"
          >
            <span className="text-slate-400 group-hover:text-slate-600 transition-colors">←</span>
            <span>Home</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <Link
            to="/"
            className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-slate-900 hover:text-amber-700 transition-colors"
          >
            JobPilot
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeedSampleEmails}
            disabled={seeding}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-body text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50 shadow-2xs"
          >
            {seeding ? "Loading…" : "+ Load Demo"}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-body text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                fill="#EA4335"
              />
            </svg>
            {syncing ? "Syncing…" : "Sync Gmail"}
          </button>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg bg-amber-600 px-3.5 py-1.5 font-body text-xs font-medium text-white transition-colors hover:bg-amber-700 shadow-xs"
          >
            {showForm ? "Cancel" : "+ Add card"}
          </button>
          <div className="ml-1 pl-1 border-l border-slate-200">
            <UserButton appearance={clerkAppearance} afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* New Application Form Drawer */}
      {showForm && (
        <form
          onSubmit={handleCreateCard}
          className="flex flex-shrink-0 flex-wrap items-end gap-3 border-b border-slate-200 bg-white px-6 py-3 shadow-xs"
        >
          <div>
            <label className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Column
            </label>
            <select
              value={formColumnId}
              onChange={(e) => setFormColumnId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-xs focus:border-amber-600 focus:outline-none"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Company
            </label>
            <input
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
              placeholder="e.g. Stripe"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-xs focus:border-amber-600 focus:outline-none placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Role
            </label>
            <input
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              placeholder="e.g. Backend Engineer"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-xs focus:border-amber-600 focus:outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-amber-600 px-4 py-1.5 font-body text-xs font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 shadow-xs"
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      {/* Full-Screen Kanban Board Area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        {loading && <p className="text-sm text-slate-500">Loading your board…</p>}

        {error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <span>{error}</span>
            <button
              onClick={() => fetchBoard()}
              className="rounded bg-red-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-red-800 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && (
          <div className="flex h-full items-stretch gap-4.5 pb-2">
            {columns.map((column) => {
              const cardsInColumn = applications
                .filter((app) => app.column_id === column.id)
                .sort((a, b) => a.position - b.position);

              return (
                <div
                  key={column.id}
                  className="flex h-full w-84 flex-shrink-0 flex-col rounded-2xl border border-slate-200/90 bg-slate-100/80 p-3.5 shadow-2xs"
                >
                  {/* Column Header */}
                  <div className="mb-3 flex flex-shrink-0 items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: column.color ?? "#94A3B8" }}
                      />
                      <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-700">
                        {column.name}
                      </h2>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-medium text-slate-500 shadow-2xs">
                      {cardsInColumn.length}
                    </span>
                  </div>

                  {/* Scrollable Cards List filling the full column height */}
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {cardsInColumn.length === 0 && (
                      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/50 p-4 text-center">
                        <p className="text-xs text-slate-400">No applications in this stage</p>
                      </div>
                    )}

                    {cardsInColumn.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedCard(app)}
                        className="group relative cursor-pointer rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-amber-300 hover:shadow-sm"
                      >
                        {/* Card Header: Role, Company & Delete */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-amber-800 transition-colors">
                              {app.role}
                            </p>
                            <p className="mt-0.5 font-medium text-[11px] text-slate-600">
                              {app.company}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCard(app.id);
                            }}
                            title="Delete application"
                            className="text-slate-300 hover:text-red-500 transition-colors p-1 text-sm font-bold leading-none rounded hover:bg-red-50"
                          >
                            ×
                          </button>
                        </div>

                        {/* Email Details ("what is inside that") */}
                        {(app.email_subject || app.email_body || app.notes) && (
                          <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-[11px]">
                            {app.email_subject && (
                              <p className="font-semibold text-slate-800 line-clamp-1">
                                ✉️ {app.email_subject}
                              </p>
                            )}
                            {app.email_sender && (
                              <p className="mt-0.5 text-[10px] text-slate-500 truncate">
                                From: {app.email_sender}
                              </p>
                            )}
                            {app.email_body ? (
                              <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-600">
                                {app.email_body}
                              </p>
                            ) : app.notes ? (
                              <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                                {app.notes}
                              </p>
                            ) : null}
                          </div>
                        )}

                        {/* Card Footer: Options, Date & Gmail Redirect */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            {/* Column Quick Mover */}
                            <select
                              value={app.column_id}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleMoveCard(app.id, e.target.value);
                              }}
                              className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 hover:border-amber-400 focus:outline-none"
                              title="Move stage"
                            >
                              {columns.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Open in Gmail Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openInGmail(
                                app.gmail_message_id,
                                app.email_subject || app.company
                              );
                            }}
                            title="Open email in Gmail"
                            className="inline-flex items-center gap-1 font-mono font-medium text-amber-700 hover:text-amber-900 hover:underline"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path
                                d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                                fill="#EA4335"
                              />
                            </svg>
                            Gmail ↗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Card Details Modal ("what is inside that") */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-700">
                    {columns.find((c) => c.id === selectedCard.column_id)?.name || "Application"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400">
                    {selectedCard.applied_date
                      ? new Date(selectedCard.applied_date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Added recently"}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-2xl font-semibold text-slate-900">
                  {selectedCard.role}
                </h3>
                <p className="text-sm font-medium text-slate-600">{selectedCard.company}</p>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Email Details Section */}
            <div className="mt-5 space-y-4">
              {selectedCard.email_subject || selectedCard.email_body ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Linked Recruiter Email
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-900 truncate">
                        {selectedCard.email_subject}
                      </p>
                      {selectedCard.email_sender && (
                        <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                          From: {selectedCard.email_sender}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openInGmail(
                          selectedCard.gmail_message_id,
                          selectedCard.email_subject || selectedCard.company
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-body text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-amber-800"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                          fill="#EA4335"
                        />
                      </svg>
                      Open in Gmail ↗
                    </button>
                  </div>

                  <div className="mt-3">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Email Message Content
                    </p>
                    <div className="mt-1.5 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white p-3 font-body text-xs leading-relaxed text-slate-700 border border-slate-200/80">
                      {selectedCard.email_body || selectedCard.notes}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <p className="text-xs text-slate-500">
                    No direct recruiter email attached to this card.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      openInGmail(null, selectedCard.company)
                    }
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-body text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    Search {selectedCard.company} in Gmail ↗
                  </button>
                </div>
              )}

              {selectedCard.notes && !selectedCard.email_body && (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Notes
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{selectedCard.notes}</p>
                </div>
              )}

              {/* Move Stage in Modal */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-xs font-medium text-slate-700">Move Stage:</span>
                <select
                  value={selectedCard.column_id}
                  onChange={(e) => {
                    handleMoveCard(selectedCard.id, e.target.value);
                    setSelectedCard((prev) => ({
                      ...prev,
                      column_id: e.target.value,
                    }));
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 shadow-xs focus:outline-none"
                >
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteCard(selectedCard.id);
                    setSelectedCard(null);
                  }}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-body text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                >
                  Delete Application
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 font-body text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

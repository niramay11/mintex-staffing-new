"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import type { StatisticsData, StatItem, Industry, MarketPoint } from "../api/statistics/route";

type MediaItem = { id: string; src: string; alt: string; url: string };
type InsightsData = { images: MediaItem[]; reels: MediaItem[] };

const STORAGE_KEY = "mintex_admin_pw";
const TABS = ["jobs", "clients", "media", "hero", "social", "impact", "history", "messages"] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, string> = {
  jobs: "Jobs", clients: "Clients", media: "Insights Media", hero: "Hero Section", social: "Social Links",
  impact: "Our Impact Stats", history: "History Images", messages: "Messages",
};

export default function AdminInsightsPage() {
  const [password, setPassword]         = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError]       = useState("");
  const [activeTab, setActiveTab]       = useState<Tab>("jobs");
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setSavedPassword(saved); setAuthenticated(true); }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/insights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "__verify__", password }),
    });
    if (res.status === 401) { setAuthError("Wrong password"); return; }
    setAuthError("");
    localStorage.setItem(STORAGE_KEY, password);
    setSavedPassword(password);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthenticated(false);
    setPassword("");
    setSavedPassword("");
  };

  const activePassword = password || savedPassword;

  if (loading) return <div className="min-h-screen bg-gray-950" />;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <input type="password" placeholder="Enter admin password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none mb-4" />
          {authError && <p className="text-red-400 text-sm mb-4">{authError}</p>}
          <button type="submit" className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-6 md:px-10 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">Logout</button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-gray-900 text-orange-400 border border-b-0 border-gray-700"
                    : "text-gray-400 hover:text-white"
                }`}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        {activeTab === "jobs"     && <JobsTab password={activePassword} />}
        {activeTab === "clients"  && <ClientsTab password={activePassword} />}
        {activeTab === "media"    && <MediaTab password={activePassword} />}
        {activeTab === "hero"     && <HeroTab password={activePassword} />}
        {activeTab === "social"   && <SocialTab password={activePassword} />}
        {activeTab === "impact"   && <ImpactTab password={activePassword} />}
        {activeTab === "history"  && <HistoryImagesTab password={activePassword} />}
        {activeTab === "messages" && <MessagesTab password={activePassword} />}
      </div>
    </div>
  );
}

// ─── Jobs Tab ─────────────────────────────────────────────────────────────────
type CeipalJob = Record<string, unknown>;
const PAGE_SIZE = 25;

const STATUS_TABS = [
  { key: "all",            label: "All Jobs" },
  { key: "Active",         label: "Active" },
  { key: "Closed",         label: "Closed" },
  { key: "Draft",          label: "Draft" },
  { key: "Filled",         label: "Filled" },
  { key: "Hold by Client", label: "Hold by Client" },
  { key: "On Hold",        label: "On Hold" },
];

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "active")           return "bg-green-900/50 text-green-400";
  if (s === "on hold")          return "bg-yellow-900/50 text-yellow-400";
  if (s === "hold by client")   return "bg-orange-900/50 text-orange-400";
  if (s === "filled")           return "bg-blue-900/50 text-blue-400";
  if (s === "draft")            return "bg-purple-900/50 text-purple-400";
  if (s.includes("closed"))     return "bg-red-900/40 text-red-400";
  return "bg-gray-800 text-gray-400";
}

function JobsTab({ password: _ }: { password: string }) {
  const [jobs, setJobs]           = useState<CeipalJob[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<CeipalJob | null>(null);
  const [cachedAt, setCachedAt]   = useState<number | null>(null);

  const loadJobs = (force = false) => {
    if (force) setRefreshing(true); else setLoading(true);
    fetch(`/api/jobs${force ? "?refresh=1" : ""}`)
      .then(r => r.json())
      .then(d => {
        setJobs(Array.isArray(d.results) ? d.results : []);
        setCachedAt(d.cached_at ?? Date.now());
        setLoading(false); setRefreshing(false);
      })
      .catch(() => { setError("Failed to load jobs from CEIPAL."); setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { loadJobs(); }, []);

  // CEIPAL hides "Active" jobs not modified in last 6 months (stale old jobs)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const isRecentlyModified = (j: CeipalJob) => {
    const m = String(j.Modified ?? j.modified ?? "");
    return !m || new Date(m) >= sixMonthsAgo;
  };

  // Count per status for tab badges
  const counts: Record<string, number> = { all: jobs.length };
  for (const t of STATUS_TABS) {
    if (t.key === "all") continue;
    const byStatus = jobs.filter(j => String(j.job_status ?? "").trim() === t.key);
    // Active: apply 6-month filter to match CEIPAL UI
    counts[t.key] = t.key === "Active"
      ? byStatus.filter(isRecentlyModified).length
      : byStatus.length;
  }

  const afterStatus = statusTab === "all"
    ? jobs
    : statusTab === "Active"
      ? jobs.filter(j => String(j.job_status ?? "").trim() === "Active" && isRecentlyModified(j))
      : jobs.filter(j => String(j.job_status ?? "").trim() === statusTab);

  const afterSearch = !search ? afterStatus : afterStatus.filter(j =>
    String(j.job_title ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(j.job_code  ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(j.client    ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(afterSearch.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = afterSearch.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filter/search changes
  const setFilter = (tab: string) => { setStatusTab(tab); setPage(1); };
  const setSearchVal = (v: string) => { setSearch(v); setPage(1); };

  if (loading) return (
    <div className="flex flex-col items-center gap-4 py-20 text-gray-400">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p>Loading all jobs from CEIPAL…</p>
      <p className="text-xs text-gray-600">Fetching ~30 pages, this takes ~10 seconds on first load</p>
    </div>
  );
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Jobs from CEIPAL</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-400">{jobs.length} total · showing {afterSearch.length}</p>
            {cachedAt && (
              <span className="text-xs text-gray-600">
                Last synced: {new Date(cachedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                <span className="ml-1 text-gray-700">(auto-refreshes every 5 min)</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadJobs(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors disabled:opacity-50"
          >
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
            {refreshing ? "Syncing…" : "Sync Now"}
          </button>
          <input value={search} onChange={e => setSearchVal(e.target.value)}
            placeholder="Search title, code, client…"
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm w-64 focus:border-orange-500 focus:outline-none" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap mb-4">
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              statusTab === t.key
                ? "bg-orange-600 text-white"
                : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
            }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusTab === t.key ? "bg-orange-700 text-orange-200" : "bg-gray-800 text-gray-500"}`}>
              {counts[t.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 text-gray-400 text-left">
              <th className="px-4 py-3 font-medium">Job Code</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-center">Pos.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No jobs found</td></tr>
            ) : paginated.map((job, i) => (
              <tr
                key={String(job.job_code ?? i)}
                onClick={() => setSelected(job)}
                className="hover:bg-gray-800/60 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-orange-400 font-mono text-xs whitespace-nowrap">{String(job.job_code ?? "—")}</td>
                <td className="px-4 py-3 text-white font-medium max-w-xs"><div className="truncate">{String(job.job_title ?? "—")}</div></td>
                <td className="px-4 py-3 text-gray-300 max-w-[160px]"><div className="truncate">{String(job.client ?? "—")}</div></td>
                <td className="px-4 py-3 text-gray-400">{[job.city, job.states].filter(Boolean).join(", ") || "—"}</td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{String(job.job_type ?? "—")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor(String(job.job_status ?? ""))}`}>
                    {String(job.job_status ?? "—")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-center">{String(job.number_of_positions ?? "—")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal rendered outside table to avoid z-index issues */}
      {selected && <JobDetailModal job={selected} onClose={() => setSelected(null)} />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <p className="text-sm text-gray-400">
            Page {safePage} of {totalPages} · {afterSearch.length} jobs
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage === 1}
              className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs disabled:opacity-30 transition-colors">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs disabled:opacity-30 transition-colors">‹ Prev</button>

            {/* Page number buttons — show up to 7 around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
              .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(n); return acc;
              }, [])
              .map((n, i) =>
                n === "…"
                  ? <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-xs">…</span>
                  : <button key={n} onClick={() => setPage(n as number)}
                      className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        safePage === n ? "bg-orange-600 text-white font-semibold" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      }`}>{n}</button>
              )
            }

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs disabled:opacity-30 transition-colors">Next ›</button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
              className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs disabled:opacity-30 transition-colors">»</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline helpers ─────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  'Pipeline', 'Submission', 'Client Submission',
  'Interview', 'Confirmation', 'Placement', 'Not Joined',
] as const;
type PipelineStage = typeof PIPELINE_STAGES[number];

function mapStatusToStageIdx(status: string): number {
  const s = (status ?? '').toLowerCase();
  if (s.includes('not joined'))                                          return 6;
  if (s.includes('placement') || s.includes('placed'))                  return 5;
  if (s.includes('confirmation') || s.includes('confirmed'))            return 4;
  if (s.includes('interview'))                                          return 3;
  if (s.includes('client submission') || s.includes('client submitted')
    || s.includes('waiting for evaluation'))                            return 2;
  if (s.includes('submission') || s.includes('submitted')
    || s.includes('approved') || s.includes('internal'))                return 1;
  return 0;
}

type JobDetail  = Record<string, unknown>;
type Submission = {
  id: string; submission_id: number; submission_status: string;
  pipeline_status: string; source: string; submitted_on: string;
  modified: string; tax_term: string; employment_type: string;
  pay_rate: string | null; resume?: string; applicant_id: number;
  job_seeker_id: string; submitted_by?: string; Documents?: unknown[];
};

// ─── Shared sub-components ───────────────────────────────────────────────────
function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-white font-medium mt-0.5 truncate">{value || '—'}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-3 min-w-0">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-200 break-words">{value || '—'}</p>
    </div>
  );
}

function ModalSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-gray-400 justify-center">
      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

// ─── Snapshot tab ─────────────────────────────────────────────────────────────
function SnapshotTab({ job, detail, loading, error }: {
  job: CeipalJob; detail: JobDetail | null; loading: boolean; error: string;
}) {
  const desc = String(detail?.requisition_description ?? job.job_description ?? '');
  const skills = String(detail?.skills ?? job.primary_skills ?? '');
  const payRates = Array.isArray(detail?.pay_rates) ? (detail.pay_rates as Record<string, unknown>[]) : [];

  return (
    <div className="space-y-6">
      {/* Job Description */}
      {desc ? (
        <div>
          <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Job Description</h4>
          <div className="bg-gray-800/50 rounded-xl p-4 text-sm text-gray-300 leading-relaxed max-h-52 overflow-y-auto prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: desc }} />
        </div>
      ) : loading ? null : (
        <div className="bg-gray-800/30 rounded-xl p-4 text-sm text-gray-500 italic">No job description available.</div>
      )}

      {/* Pay Rates */}
      {payRates.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Pay Rates</h4>
          <div className="flex flex-wrap gap-2">
            {payRates.map((pr, i) => (
              <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <span className="text-orange-400 font-bold text-sm">{String(pr.pay_rate ?? '—')}</span>
                <span className="text-gray-400 text-xs">{String(pr.pay_rate_currency ?? '')} / {String(pr.pay_rate_pay_frequency_type ?? '')}</span>
                {!!pr.pay_rate_employment_type && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 text-[10px]">{String(pr.pay_rate_employment_type)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview grid */}
      <div>
        <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Overview</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoCard label="Job Type"    value={String(job.job_type ?? detail?.employment_type ?? '')} />
          <InfoCard label="Duration"    value={String(job.duration ?? detail?.duration ?? '')} />
          <InfoCard label="Experience"  value={String(job.experience ?? detail?.experience ?? '')} />
          <InfoCard label="Work Auth"   value={String(job.work_authorization ?? detail?.work_authorization ?? '')} />
          <InfoCard label="Tax Terms"   value={String(job.tax_terms ?? detail?.tax_terms ?? '')} />
          <InfoCard label="Remote"      value={String(job.remote_job ?? detail?.remote_opportunities ?? '')} />
          <InfoCard label="Start Date"  value={String(job.job_start_date ?? detail?.job_start_date ?? '')} />
          <InfoCard label="End Date"    value={String(job.job_end_date ?? detail?.job_end_date ?? '')} />
          <InfoCard label="Closing Date" value={String(detail?.closing_date ?? '')} />
          <InfoCard label="Client"      value={String(job.client ?? '')} />
          <InfoCard label="End Client"  value={String(job.end_client ?? '')} />
          <InfoCard label="Priority"    value={String(job.priority ?? '')} />
        </div>
      </div>

      {/* Skills */}
      {skills && (
        <div>
          <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skills.split(/,\s*/).filter(Boolean).map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-orange-950/60 text-orange-300 text-xs border border-orange-800/40">{s.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {loading && <ModalSpinner label="Loading full details…" />}
      {error   && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

// ─── Details tab ──────────────────────────────────────────────────────────────
function DetailsTab({ detail, loading, error }: { detail: JobDetail | null; loading: boolean; error: string }) {
  if (loading) return <ModalSpinner label="Loading job details…" />;
  if (error)   return <p className="text-red-400">{error}</p>;
  if (!detail) return <p className="text-gray-500 text-sm">No additional details available.</p>;

  return (
    <div className="space-y-6">
      {/* Contact Person */}
      {!!detail.contact_person && (
        <div>
          <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact Person</h4>
          <div className="bg-gray-800/50 rounded-xl p-4 text-sm text-gray-300"
            dangerouslySetInnerHTML={{ __html: String(detail.contact_person) }} />
        </div>
      )}

      {/* Public JD */}
      {!!detail.public_job_desc && (
        <div>
          <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Public Job Description</h4>
          <div className="bg-gray-800/50 rounded-xl p-4 text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: String(detail.public_job_desc) }} />
        </div>
      )}

      {/* Detail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoCard label="Department"   value={String(detail.department   ?? '')} />
        <InfoCard label="Business Unit" value={String(detail.business_unit_id ?? '')} />
        <InfoCard label="Industry"     value={String(detail.industry     ?? '')} />
        <InfoCard label="Currency"     value={String(detail.currency     ?? '')} />
        <InfoCard label="Created"      value={String(detail.created      ?? '')} />
        <InfoCard label="Modified"     value={String(detail.modified     ?? '')} />
        <InfoCard label="Min Exp."     value={String(detail.min_experience ?? '')} />
        <InfoCard label="Postal Code"  value={String(detail.postal_code  ?? '')} />
        <InfoCard label="Posted"       value={String(detail.posted       ?? '')} />
        <InfoCard label="Public Title" value={String(detail.public_job_title ?? '')} />
        <InfoCard label="Remote Opps." value={String(detail.remote_opportunities ?? '')} />
        <InfoCard label="Positions"    value={String(detail.number_of_positions ?? '')} />
      </div>

    </div>
  );
}

// ─── Pipeline bar (used inside submission detail modal) ───────────────────────
function PipelineBar({ stageIdx }: { stageIdx: number }) {
  return (
    <div className="flex items-center gap-0 mt-3">
      {PIPELINE_STAGES.map((stage, i) => {
        const isComplete = i < stageIdx;
        const isActive   = i === stageIdx;
        const isNeg      = stageIdx === 6 && i === 6;
        // Line connects THIS dot to the NEXT — only color if next dot is complete
        const lineColored = i < stageIdx; // stop line AT active, not past it
        return (
          <div key={stage} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full ${i === 0 ? 'rounded-l-full' : i === PIPELINE_STAGES.length - 1 ? 'rounded-r-full' : ''} transition-colors ${
              isNeg        ? 'bg-red-500' :
              lineColored  ? 'bg-orange-500' :
              'bg-gray-700'
            }`} />
            <span className={`text-[9px] truncate w-full text-center hidden sm:block leading-none ${
              isActive ? 'text-orange-400' : isComplete ? 'text-orange-600' : 'text-gray-700'
            }`}>{stage.split(' ')[0]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Applicant + user enriched submission ────────────────────────────────────
type ApplicantInfo = {
  name: string; phone: string; city: string; state: string;
  work_authorization: string; email: string; resume_token?: string;
};

// ─── CEIPAL-style pipeline dots row ──────────────────────────────────────────
function PipelineDots({ stageIdx, submittedOn }: { stageIdx: number; submittedOn: string }) {
  const fmt = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };
  return (
    <div className="flex items-center w-full mt-3 mb-1 relative">
      {PIPELINE_STAGES.map((stage, i) => {
        const isComplete = i < stageIdx;   // fully passed stage
        const isActive   = i === stageIdx; // current stage
        const isNeg      = stageIdx === 6 && i === 6;
        // Line goes RIGHT from this dot to next — only color if NEXT dot is complete (i+1 <= stageIdx, i.e. i < stageIdx)
        const lineColored = i < stageIdx;  // stops AT active dot, never past it

        const dotCls =
          isNeg      ? 'bg-red-500 border-red-500' :
          isActive   ? 'bg-orange-500 border-orange-500 ring-2 ring-orange-400/40' :
          isComplete ? 'bg-orange-500 border-orange-500' :
          'bg-gray-700 border-gray-600';

        return (
          <div key={stage} className="flex-1 flex flex-col items-center relative min-w-0">
            {/* Connecting line — starts at center of this dot, extends right */}
            {i < PIPELINE_STAGES.length - 1 && (
              <div className={`absolute top-[7px] left-1/2 w-full h-0.5 z-0 transition-colors ${
                lineColored ? 'bg-orange-500' : 'bg-gray-700'
              }`} />
            )}
            {/* Dot — show ✓ checkmark for completed stages */}
            <div className={`relative z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${dotCls}`}>
              {isComplete && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {/* Stage label */}
            <p className={`text-[9px] mt-1 text-center truncate w-full px-0.5 leading-tight ${
              isActive ? 'text-orange-400 font-semibold' : isComplete ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {stage.split(' ')[0]}
            </p>
            {/* Date under active stage */}
            {isActive && submittedOn && (
              <p className="text-[8px] text-orange-400 text-center truncate w-full px-0.5">{fmt(submittedOn)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Submissions tab ──────────────────────────────────────────────────────────
function SubmissionsTab({ submissions, loading, error, onSelectSub }: {
  submissions: Submission[]; loading: boolean; error: string;
  onSelectSub: (s: Submission, applicant: ApplicantInfo | null) => void;
}) {
  const [stageFilter, setStageFilter]     = useState<string>('all');
  const [applicants, setApplicants]       = useState<Record<string, ApplicantInfo>>({});
  const [usersMap, setUsersMap]           = useState<Record<string, string>>({});
  const [enrichLoading, setEnrichLoading] = useState(false);

  // Fetch users map + applicant details whenever submissions change
  useEffect(() => {
    if (submissions.length === 0) return;
    setEnrichLoading(true);

    const doEnrich = async () => {
      // Fetch users map (for submitted_by name)
      try {
        const r = await fetch('/api/admin/users-map');
        if (r.ok) setUsersMap(await r.json());
      } catch { /* ignore */ }

      // Fetch applicant details for each unique job_seeker_id
      const ids = [...new Set(submissions.map(s => s.job_seeker_id).filter(Boolean))];
      const results = await Promise.allSettled(
        ids.map(id =>
          fetch(`/api/admin/applicant-details?id=${encodeURIComponent(id)}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => ({ id, data: d }))
        )
      );

      const map: Record<string, ApplicantInfo> = {};
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value?.data) {
          // CEIPAL sometimes returns array, sometimes object
          const raw = r.value.data;
          const d   = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>;
          if (!d) continue;

          // CEIPAL field names confirmed from API response
          const firstName = String(d.firstname ?? d.first_name ?? '').trim();
          const lastName  = String(d.lastname  ?? d.last_name  ?? '').trim();
          const fullName  = String(
            d.consultant_name ?? d.full_name ?? d.applicant_name ??
            (firstName || lastName ? `${firstName} ${lastName}`.trim() : '')
          ).trim();

          // Get best resume URL from documents array
          const docs = Array.isArray(d.documents) ? d.documents as Record<string, unknown>[] : [];
          const resumeDoc = docs.find(doc => doc.resume_visibility === 1) ?? docs[0];
          const resumeToken = String(resumeDoc?.resume_token ?? '');

          map[r.value.id] = {
            name:  fullName,
            phone: String(d.mobile_number ?? d.contact_number ?? d.phone ?? d.home_phone_number ?? ''),
            city:  String(d.city ?? d.current_city ?? ''),
            state: String(d.state ?? d.current_state ?? ''),
            work_authorization: String(d.work_authorization ?? d.visa_type ?? ''),
            email: String(d.email ?? d.email_id ?? d.email_address ?? ''),
            resume_token: resumeToken,
          };
        }
      }
      setApplicants(map);
      setEnrichLoading(false);
    };

    doEnrich();
  }, [submissions]);

  const stageCounts = PIPELINE_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = submissions.filter(sub => PIPELINE_STAGES[mapStatusToStageIdx(sub.submission_status || sub.pipeline_status)] === s).length;
    return acc;
  }, {});

  const filtered = stageFilter === 'all'
    ? submissions
    : submissions.filter(sub => PIPELINE_STAGES[mapStatusToStageIdx(sub.submission_status || sub.pipeline_status)] === stageFilter);

  if (loading) return <ModalSpinner label="Loading submissions…" />;
  if (error)   return <p className="text-red-400 text-sm">{error}</p>;

  return (
    <div>
      {/* Stage filter tabs — CEIPAL style */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button onClick={() => setStageFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
          All <span className="ml-1 opacity-70">{submissions.length}</span>
        </button>
        {PIPELINE_STAGES.map(stage => (
          <button key={stage} onClick={() => setStageFilter(stage)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === stage ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
            {stage} <span className="ml-1 opacity-70">{stageCounts[stage] ?? 0}</span>
          </button>
        ))}
      </div>

      {enrichLoading && submissions.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin" />
          Loading candidate details…
        </div>
      )}

      {/* Table header — CEIPAL style */}
      {filtered.length > 0 && (
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-800 mb-1">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Submitted By / On</div>
          <div className="col-span-2">Contact / Location</div>
          <div className="col-span-2">Pay Rate / Work Auth</div>
          <div className="col-span-2">Status</div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-sm">No submissions{stageFilter !== 'all' ? ` in "${stageFilter}"` : ''}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-800/60">
          {filtered.map(sub => {
            const stageIdx    = mapStatusToStageIdx(sub.submission_status || sub.pipeline_status || '');
            const statusLabel = sub.submission_status || sub.pipeline_status || 'Unknown';
            const applicant   = applicants[sub.job_seeker_id] ?? null;
            const submittedBy = usersMap[sub.submitted_by ?? ''] || '';
            const submittedOn = sub.submitted_on
              ? new Date(sub.submitted_on).toLocaleString('en-AU', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
              : '';

            const statusCls =
              stageIdx === 6 ? 'text-red-400' :
              stageIdx >= 4  ? 'text-blue-400' :
              stageIdx >= 2  ? 'text-yellow-400' :
              'text-orange-400';

            const payDisplay = [
              sub.pay_rate ? `$${sub.pay_rate}` : '',
              sub.employment_type || '',
              sub.tax_term || '',
            ].filter(Boolean).join(' / ') || '—';

            const workAuth = applicant?.work_authorization || 'N/A';
            const location = [applicant?.city, applicant?.state].filter(Boolean).join(', ') || '—';

            return (
              <div key={sub.id}
                onClick={() => onSelectSub(sub, applicant)}
                className="py-3 px-4 cursor-pointer hover:bg-gray-800/40 transition-colors group">

                {/* CEIPAL-style table row */}
                <div className="grid grid-cols-12 gap-2 items-start">
                  {/* NAME */}
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                      {applicant?.name || `Submission #${sub.submission_id}`}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{sub.source || ''}</p>
                  </div>

                  {/* SUBMITTED BY / ON */}
                  <div className="col-span-3">
                    <p className="text-xs text-gray-300">{submittedBy || '—'}</p>
                    <p className="text-[10px] text-gray-500">{submittedOn}</p>
                  </div>

                  {/* CONTACT / LOCATION */}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-300">{applicant?.phone || '—'}</p>
                    <p className="text-[10px] text-gray-500">{location}</p>
                  </div>

                  {/* PAY RATE / WORK AUTH */}
                  <div className="col-span-2">
                    <p className="text-xs text-orange-300 font-medium">{payDisplay}</p>
                    <p className="text-[10px] text-gray-500">{workAuth}</p>
                  </div>

                  {/* STATUS */}
                  <div className="col-span-2 text-right">
                    <span className={`text-xs font-semibold ${statusCls}`}>{statusLabel}</span>
                  </div>
                </div>

                {/* Pipeline dots with stage label + date */}
                <PipelineDots stageIdx={stageIdx} submittedOn={sub.submitted_on} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Submission detail side-modal ─────────────────────────────────────────────
function SubmissionDetailModal({ sub, applicant, onClose }: { sub: Submission; applicant: ApplicantInfo | null; onClose: () => void }) {
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/submission-details?id=${encodeURIComponent(sub.id)}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sub.id]);

  const stageIdx    = mapStatusToStageIdx(sub.submission_status || sub.pipeline_status || '');
  const resumeToken = applicant?.resume_token ?? String(detail?.resume ?? sub.resume ?? '');
  const docs        = (Array.isArray(detail?.Documents) ? detail!.Documents : []) as Record<string, unknown>[];
  const candName    = applicant?.name || `Submission #${sub.submission_id}`;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div>
            <h3 className="font-bold text-white text-lg">{candName}</h3>
            <p className="text-xs text-orange-400 mt-0.5">#{sub.submission_id} · {sub.source || ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Candidate info */}
          {applicant && (
            <div className="bg-gray-800/50 rounded-xl p-4 grid grid-cols-2 gap-3">
              {applicant.email  && <InfoCard label="Email"    value={applicant.email} />}
              {applicant.phone  && <InfoCard label="Phone"    value={applicant.phone} />}
              {(applicant.city || applicant.state) && <InfoCard label="Location" value={[applicant.city, applicant.state].filter(Boolean).join(', ')} />}
              {applicant.work_authorization && <InfoCard label="Work Auth" value={applicant.work_authorization} />}
            </div>
          )}

          {/* Pipeline */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">Pipeline Stage</p>
            <PipelineBar stageIdx={stageIdx} />
          </div>

          {loading ? <ModalSpinner label="Loading details…" /> : (
            <>
              {/* Status */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Status"          value={sub.submission_status || sub.pipeline_status || '—'} />
                <InfoCard label="Source"          value={sub.source || '—'} />
                <InfoCard label="Employment Type" value={sub.employment_type || String(detail?.employment_type ?? '') || '—'} />
                <InfoCard label="Tax Term"        value={sub.tax_term || String(detail?.tax_term ?? '') || '—'} />
                <InfoCard label="Pay Rate"        value={String(sub.pay_rate ?? detail?.pay_rate ?? '—')} />
                <InfoCard label="Submitted On"    value={sub.submitted_on ? new Date(sub.submitted_on).toLocaleString() : '—'} />
                <InfoCard label="Modified"        value={sub.modified ? new Date(sub.modified).toLocaleString() : '—'} />
                <InfoCard label="Applicant ID"    value={String(sub.applicant_id || '—')} />
              </div>


              {/* Documents */}
              {docs.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">Documents ({docs.length})</p>
                  <div className="space-y-2">
                    {docs.map((doc, i) => (
                      <a key={i} href={String(doc.document_path ?? '#')} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors">
                        📎 Document {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Enhanced Job Detail Modal ────────────────────────────────────────────────
function JobDetailModal({ job, onClose }: { job: CeipalJob; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'details' | 'submissions'>('snapshot');
  const [detail, setDetail]         = useState<JobDetail | null>(null);
  const [detailLoading, setDL]      = useState(false);
  const [detailError, setDE]        = useState('');
  const [submissions, setSubs]      = useState<Submission[]>([]);
  const [subsLoading, setSL]        = useState(false);
  const [subsError, setSE]          = useState('');
  const [selectedSub, setSelectedSub] = useState<{ sub: Submission; applicant: ApplicantInfo | null } | null>(null);

  const jobCode = String(job.job_code ?? '').trim();

  useEffect(() => {
    if (!jobCode) return;

    // Resolve the correct V2 ID from job_code via the server-side map cache,
    // then fetch details + submissions in parallel.
    const resolveAndFetch = async () => {
      let v2Id = '';
      try {
        const mapRes = await fetch('/api/admin/v2-job-map');
        const map: Record<string, string> = await mapRes.json();
        v2Id = map[jobCode] ?? '';
      } catch {
        setDE('Could not load job ID map'); setDL(false);
        setSE('Could not load job ID map'); setSL(false);
        return;
      }

      if (!v2Id) {
        setDE(`Job not found in V2 list (${jobCode})`); setDL(false);
        setSE(`Job not found in V2 list (${jobCode})`); setSL(false);
        return;
      }

      setDL(true);
      fetch(`/api/admin/job-details?id=${encodeURIComponent(v2Id)}`)
        .then(r => r.json())
        .then(d => { setDetail(d); setDL(false); })
        .catch(() => { setDE('Failed to load details'); setDL(false); });

      setSL(true);
      fetch(`/api/admin/job-submissions?job_id=${encodeURIComponent(v2Id)}`)
        .then(r => r.json())
        .then(d => { setSubs(Array.isArray(d) ? d : []); setSL(false); })
        .catch(() => { setSE('Failed to load submissions'); setSL(false); });
    };

    resolveAndFetch();
  }, [jobCode]);

  const status = String(job.job_status ?? '');
  const tabs = [
    { key: 'snapshot'    as const, label: 'Snapshot' },
    { key: 'details'     as const, label: 'Job Details' },
    { key: 'submissions' as const, label: `Submissions${subsLoading ? '' : ` (${submissions.length})`}` },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-5xl shadow-2xl">

          {/* ── Header ── */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-orange-400 font-mono text-xs bg-orange-950/60 px-2.5 py-1 rounded-md border border-orange-800/40">
                    {String(job.job_code ?? '')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(status)}`}>
                    {status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white truncate">{String(job.job_title ?? 'Job Detail')}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {[job.city, job.states, job.country].filter(Boolean).join(', ') || String(detail?.city ?? '')}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none shrink-0 p-1">&times;</button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-800">
              <QuickStat label="Recruiter"  value={String(job.sales_manager ?? job.client_manager ?? detail?.recruitment_manager ?? '—')} />
              <QuickStat label="Pay Rate"   value={String(job.pay_rate___salary ?? '')} />
              <QuickStat label="Positions"  value={String(job.number_of_positions ?? detail?.number_of_positions ?? '')} />
              <QuickStat label="Industry"   value={String(detail?.industry ?? job.industry ?? '')} />
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-gray-800 px-6 gap-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === t.key
                    ? 'text-orange-400 border-b-2 border-orange-400 -mb-px'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div className="p-6 min-h-[300px]">
            {activeTab === 'snapshot'    && <SnapshotTab job={job} detail={detail} loading={detailLoading} error={detailError} />}
            {activeTab === 'details'     && <DetailsTab detail={detail} loading={detailLoading} error={detailError} />}
            {activeTab === 'submissions' && <SubmissionsTab submissions={submissions} loading={subsLoading} error={subsError} onSelectSub={(s, a) => setSelectedSub({ sub: s, applicant: a })} />}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-6 flex justify-end border-t border-gray-800 pt-4">
            <button onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>

      {selectedSub && (
        <SubmissionDetailModal sub={selectedSub.sub} applicant={selectedSub.applicant} onClose={() => setSelectedSub(null)} />
      )}
    </>
  );
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────
type Client = {
  id: string; username: string; name: string; email: string; company: string;
  ceipal_id: string; ceipal_client_name: string; allowed_job_codes: string[];
  permissions: Record<string, boolean>; is_active: boolean; created_at: string;
};

type CeipalClient = {
  id: string; name: string; country: string; state: string; city: string;
  status: string; category: string; industry_exp: string;
  portal_access: { id: string; username: string; is_active: boolean } | null;
};

const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  // Jobs
  show_bill_rate: false,
  show_pay_rate: false,
  show_job_salary: false,
  show_job_description: true,
  show_required_skills: true,
  allow_job_posting: false,
  // Candidates
  show_candidate_name: true,
  show_candidate_email: false,
  show_candidate_phone: false,
  show_candidate_resume: false,
  show_candidate_ssn: false,
  show_tax_terms: true,
  show_placement_dates: true,
  show_placement_bill_rate: false,
  show_placement_pay_rate: false,
};

const PERMISSION_LABELS: Record<string, string> = {
  show_bill_rate:          "Show Bill Rate",
  show_pay_rate:           "Show Pay Rate",
  show_job_salary:         "Show Job Salary",
  show_job_description:    "Show Job Description",
  show_required_skills:    "Show Required Skills",
  allow_job_posting:       "Allow Job Posting",
  show_candidate_name:     "Show Candidate Name",
  show_candidate_email:    "Show Candidate Email",
  show_candidate_phone:    "Show Candidate Phone",
  show_candidate_resume:   "Show Candidate Resume",
  show_candidate_ssn:      "Show Candidate SSN",
  show_tax_terms:          "Show Tax Terms",
  show_placement_dates:    "Show Placement Dates",
  show_placement_bill_rate:"Show Placement Bill Rate",
  show_placement_pay_rate: "Show Placement Pay Rate",
};

function generatePassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function ClientsTab({ password }: { password: string }) {
  const [ceipalClients, setCeipalClients] = useState<CeipalClient[]>([]);
  const [portalClients, setPortalClients] = useState<Client[]>([]);
  const [loadingCeipal, setLoadingCeipal] = useState(true);
  const [formClient, setFormClient]       = useState<CeipalClient | null>(null);
  const [editClient, setEditClient]       = useState<Client | null>(null);
  const [msg, setMsg]                     = useState<{ ok: boolean; text: string } | null>(null);
  const [search, setSearch]               = useState("");
  const [viewTab, setViewTab]             = useState<"ceipal" | "portal">("ceipal");

  const showMsg = (ok: boolean, text: string) => {
    setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000);
  };

  const loadAll = () => {
    setLoadingCeipal(true);
    Promise.all([
      fetch("/api/admin/ceipal-clients", { headers: { "x-admin-password": password } }).then(r => r.json()),
      fetch("/api/admin/clients",        { headers: { "x-admin-password": password } }).then(r => r.json()),
    ]).then(([cc, pc]) => {
      setCeipalClients(Array.isArray(cc.results) ? cc.results : []);
      setPortalClients(Array.isArray(pc) ? pc : []);
      setLoadingCeipal(false);
    });
  };
  useEffect(loadAll, []);

  const deletePortalClient = async (id: string, name: string) => {
    if (!confirm(`Remove portal access for "${name}"?`)) return;
    const r = await fetch(`/api/admin/clients/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    if (r.ok) { showMsg(true, "Portal access removed"); loadAll(); }
    else showMsg(false, "Delete failed");
  };

  const toggleActive = async (c: Client) => {
    await fetch(`/api/admin/clients/${c.id}`, {
      method: "PUT",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    loadAll();
  };

  const filteredCeipal = ceipalClients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.state ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const withAccess    = ceipalClients.filter(c => c.portal_access);
  const withoutAccess = ceipalClients.filter(c => !c.portal_access);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Client Portal Access</h2>
          <p className="text-sm text-gray-400 mt-1">
            {ceipalClients.length} CEIPAL clients · {withAccess.length} have portal access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm w-56 focus:border-orange-500 focus:outline-none" />
          <button onClick={loadAll} className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">↻ Refresh</button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.ok ? "bg-green-900/40 text-green-400 border border-green-800" : "bg-red-900/40 text-red-400 border border-red-800"}`}>
          {msg.text}
        </div>
      )}

      {/* Form modal */}
      {(formClient || editClient) && (
        <ClientForm
          password={password}
          ceipalClient={formClient}
          editClient={editClient}
          onSaved={(emailSent, emailError) => {
            const isEdit = !!editClient;
            setFormClient(null); setEditClient(null); loadAll();
            if (emailSent) showMsg(true, isEdit ? "Client updated & credentials resent by email ✓" : "Portal access created & credentials sent by email ✓");
            else if (emailError) showMsg(false, `Saved but email failed: ${emailError}`);
            else showMsg(true, isEdit ? "Client updated successfully." : "Portal access created.");
          }}
          onCancel={() => { setFormClient(null); setEditClient(null); }}
        />
      )}

      {/* View tabs */}
      <div className="flex gap-1 mb-5">
        {([["ceipal", `All Clients (${filteredCeipal.length})`], ["portal", `Has Portal Access (${withAccess.length})`]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setViewTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewTab === k ? "bg-orange-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"}`}>
            {l}
          </button>
        ))}
      </div>

      {loadingCeipal ? (
        <div className="flex items-center gap-3 py-10 text-gray-400">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Loading clients from CEIPAL…
        </div>
      ) : viewTab === "ceipal" ? (
        /* ── CEIPAL clients list ── */
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Client Name</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Portal Access</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredCeipal.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No clients found</td></tr>
              ) : filteredCeipal.map(c => (
                <tr key={c.id} className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400">{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{c.category || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "Active" ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.portal_access ? (
                      <span className="flex items-center gap-1.5 text-xs text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                        @{c.portal_access.username}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">No access</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.portal_access ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            const pc = portalClients.find(p => p.ceipal_id === c.id);
                            if (pc) setEditClient(pc);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors">
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const pc = portalClients.find(p => p.ceipal_id === c.id);
                            if (pc) deletePortalClient(pc.id, c.name);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white text-xs transition-colors">
                          Revoke
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setFormClient(c)}
                        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors">
                        + Create Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Portal clients with access ── */
        <div className="space-y-3">
          {withAccess.length === 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 text-center text-gray-500">
              No clients have portal access yet. Go to "All Clients" tab and click "+ Create Access".
            </div>
          )}
          {portalClients.map(c => (
            <div key={c.id} className={`bg-gray-900 rounded-xl border p-5 ${c.is_active ? "border-gray-800" : "border-gray-700 opacity-60"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{c.company || c.name}</h3>
                    <span className="text-orange-400 font-mono text-sm">@{c.username}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {c.email && <p className="text-sm text-gray-400 mt-0.5">{c.email}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(c.allowed_job_codes ?? []).length > 0
                      ? (c.allowed_job_codes ?? []).map((code: string) => (
                          <span key={code} className="px-2 py-0.5 rounded bg-gray-800 text-orange-300 text-xs font-mono">{code}</span>
                        ))
                      : <span className="text-xs text-gray-600">All jobs visible</span>
                    }
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setEditClient(c)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors">Edit</button>
                  <button onClick={() => toggleActive(c)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors">
                    {c.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => deletePortalClient(c.id, c.company || c.name)}
                    className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white text-xs transition-colors">Revoke</button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800 flex flex-wrap gap-2">
                {Object.entries(c.permissions ?? {}).map(([k, v]: [string, unknown]) => (
                  <span key={k} className={`text-xs px-2 py-0.5 rounded ${v ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                    {PERMISSION_LABELS[k] ?? k}: {v ? "✓" : "✗"}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientForm({ password, ceipalClient, editClient, onSaved, onCancel }: {
  password: string;
  ceipalClient: CeipalClient | null;
  editClient: Client | null;
  onSaved: (emailSent: boolean, emailError?: string) => void;
  onCancel: () => void;
}) {
  const initial = editClient;
  const isEdit = !!initial;
  const [username, setUsername]       = useState(initial?.username ?? "");
  const [email, setEmail]             = useState(initial?.email ?? "");
  const [pw, setPw]                   = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [resendEmail, setResendEmail] = useState(false);
  const [jobSearch, setJobSearch]     = useState("");
  const [allJobs, setAllJobs]         = useState<CeipalJob[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(initial?.allowed_job_codes ?? []);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [perms, setPerms]             = useState<Record<string, boolean>>(initial?.permissions ?? DEFAULT_PERMISSIONS);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  // Load jobs for the picker
  useEffect(() => {
    fetch("/api/jobs").then(r => r.json()).then(d => setAllJobs(Array.isArray(d.results) ? d.results : []));
  }, []);

  const company = ceipalClient?.name ?? initial?.company ?? "";

  const handleGenerate = () => {
    const p = generatePassword();
    setPw(p); setShowPw(true);
    if (isEdit) setResendEmail(true); // auto-check resend when generating new password
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) { setError("Username is required"); return; }
    if (!isEdit && !pw) { setError("Password is required"); return; }
    if (isEdit && resendEmail && !email) { setError("Email address is required to resend credentials"); return; }
    if (isEdit && resendEmail && !pw) { setError("New password is required to resend credentials"); return; }
    setSaving(true);

    const body: Record<string, unknown> = {
      username: username.trim().toLowerCase(),
      email: email.trim() || null,
      company,
      ceipal_id: ceipalClient?.id ?? initial?.ceipal_id ?? null,
      ceipal_client_name: company,
      allowed_job_codes: selectedCodes,
      permissions: perms,
    };
    if (pw) body.password = pw;
    if (isEdit && resendEmail) body.resend_email = true;

    const url    = isEdit ? `/api/admin/clients/${initial.id}` : "/api/admin/clients";
    const method = isEdit ? "PUT" : "POST";

    const r = await fetch(url, {
      method,
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setSaving(false);
    if (!r.ok) { setError(d.error ?? "Failed"); return; }

    // For edit with no resend: just show saved, no email message
    if (isEdit && !resendEmail) { onSaved(false, undefined); return; }
    onSaved(d.email_sent === true, d.email_error ?? undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div>
            <h3 className="text-xl font-bold">{initial ? "Edit Portal Access" : "Create Portal Access"}</h3>
            <p className="text-orange-400 text-sm mt-1 font-medium">{company}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Username + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username <span className="text-orange-400">*</span> <span className="text-xs text-gray-500">(used for login)</span></label>
              <input value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, ""))} required
                placeholder="e.g. acme_corp" autoComplete="off"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email <span className="text-xs text-gray-500">(credentials sent here)</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none text-sm" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              {initial ? "New Password" : "Password"} <span className="text-orange-400">{initial ? "" : "*"}</span>
              {initial && <span className="text-xs text-gray-500 ml-1">(leave blank to keep current)</span>}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none text-sm font-mono" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs transition-colors">
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <button type="button" onClick={handleGenerate}
                className="px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold transition-colors whitespace-nowrap">
                Generate
              </button>
            </div>
            {pw && showPw && <p className="text-xs text-orange-400 mt-1 font-mono">{pw}</p>}
          </div>

          {/* Job Assignments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Assigned Jobs
                  {selectedCodes.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-600/30 text-orange-300 text-xs font-semibold">{selectedCodes.length} selected</span>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCodes.length === 0 ? "No jobs assigned — client will see jobs matching their company name" : "Client will only see these specific jobs"}
                </p>
              </div>
              <button type="button" onClick={() => setShowJobPicker(p => !p)}
                className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold transition-colors">
                {showJobPicker ? "Hide" : "Browse Jobs"}
              </button>
            </div>

            {/* Selected codes chips */}
            {selectedCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedCodes.map(code => (
                  <span key={code} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-900/40 border border-orange-700/50 text-orange-300 text-xs font-mono">
                    {code}
                    <button type="button" onClick={() => setSelectedCodes(s => s.filter(c => c !== code))}
                      className="text-orange-400 hover:text-white ml-0.5 leading-none">&times;</button>
                  </span>
                ))}
                <button type="button" onClick={() => setSelectedCodes([])}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors px-1">clear all</button>
              </div>
            )}

            {/* Job browser */}
            {showJobPicker && (
              <div className="border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-3 bg-gray-800/50 border-b border-gray-700">
                  <input value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    placeholder="Search jobs by title, code or client…"
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none text-xs" />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {allJobs
                    .filter(j => {
                      if (!jobSearch) return true;
                      const q = jobSearch.toLowerCase();
                      return String(j.job_title ?? "").toLowerCase().includes(q) ||
                        String(j.job_code ?? "").toLowerCase().includes(q) ||
                        String(j.client ?? "").toLowerCase().includes(q);
                    })
                    .slice(0, 100)
                    .map(j => {
                      const code = String(j.job_code ?? "");
                      const checked = selectedCodes.includes(code);
                      return (
                        <label key={code} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-800/50 transition-colors ${checked ? "bg-orange-900/20" : "hover:bg-gray-800/50"}`}>
                          <input type="checkbox" checked={checked}
                            onChange={() => setSelectedCodes(s => checked ? s.filter(c => c !== code) : [...s, code])}
                            className="w-3.5 h-3.5 rounded accent-orange-500 cursor-pointer flex-shrink-0" />
                          <span className="text-orange-400 font-mono text-xs w-24 flex-shrink-0">{code}</span>
                          <span className="text-gray-300 text-xs flex-1 truncate">{String(j.job_title ?? "")}</span>
                          <span className="text-gray-500 text-xs flex-shrink-0">{String(j.job_status ?? "")}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Resend email option — only shown when editing */}
          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700">
              <input type="checkbox" checked={resendEmail} onChange={e => setResendEmail(e.target.checked)}
                className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
              <div>
                <span className="text-sm font-medium text-gray-200">Resend credentials email to client</span>
                <p className="text-xs text-gray-500 mt-0.5">Requires email address + new password above</p>
              </div>
            </label>
          )}

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Portal Permissions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Jobs section */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Jobs</p>
                <div className="space-y-2.5">
                  {["show_bill_rate","show_pay_rate","show_job_salary","show_job_description","show_required_skills","allow_job_posting"].map(k => (
                    <label key={k} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={!!perms[k]} onChange={e => setPerms(p => ({ ...p, [k]: e.target.checked }))}
                        className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{PERMISSION_LABELS[k]}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Candidates section */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Candidates</p>
                <div className="space-y-2.5">
                  {["show_candidate_name","show_candidate_email","show_candidate_phone","show_candidate_resume","show_candidate_ssn","show_tax_terms","show_placement_dates","show_placement_bill_rate","show_placement_pay_rate"].map(k => (
                    <label key={k} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={!!perms[k]} onChange={e => setPerms(p => ({ ...p, [k]: e.target.checked }))}
                        className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{PERMISSION_LABELS[k]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors disabled:opacity-50 text-sm">
              {saving ? (isEdit ? "Saving…" : "Creating…") : isEdit ? (resendEmail ? "Save & Resend Email" : "Save Changes") : `Create Access${email ? " & Send Email" : ""}`}
            </button>
            <button type="button" onClick={onCancel}
              className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none text-sm" />
    </div>
  );
}

// ─── Media tab ────────────────────────────────────────────────────────────────
function MediaTab({ password }: { password: string }) {
  const [data, setData] = useState<InsightsData>({ images: [], reels: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "reel">("image");
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const res = await fetch("/api/insights");
    setData(await res.json());
  };
  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file); formData.append("type", uploadType);
    formData.append("alt", alt); formData.append("url", url); formData.append("password", password);
    await fetch("/api/insights", { method: "POST", body: formData });
    setAlt(""); setUrl("");
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this?")) return;
    await fetch("/api/insights", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, password }) });
    fetchData();
  };

  return (
    <>
      <form onSubmit={handleUpload} className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-10">
        <h2 className="text-xl font-semibold mb-4">Upload New</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select value={uploadType} onChange={e => setUploadType(e.target.value as "image" | "reel")}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none">
              <option value="image">Image</option><option value="reel">Reel (Video)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">File</label>
            <input ref={fileRef} type="file" accept={uploadType === "image" ? "image/*" : "video/mp4"} required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-orange-600 file:text-white file:cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Alt / Caption</label>
            <input type="text" value={alt} onChange={e => setAlt(e.target.value)} placeholder="e.g. Team meeting"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Redirect URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://instagram.com/p/..."
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none" />
          </div>
        </div>
        <button type="submit" disabled={uploading}
          className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      <MediaGrid title="Images" items={data.images} onDelete={handleDelete} isVideo={false} />
      <MediaGrid title="Reels" items={data.reels} onDelete={handleDelete} isVideo />
    </>
  );
}

function MediaGrid({ title, items, onDelete, isVideo }: { title: string; items: MediaItem[]; onDelete: (id: string) => void; isVideo: boolean }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4">{title} ({items.length})</h2>
      {items.length === 0 ? <p className="text-gray-500">None yet.</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
              <div className={isVideo ? "aspect-[9/16]" : "aspect-square"}>
                {isVideo
                  ? <video src={item.src} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover"
                      onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }} />
                  : <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="200px" />
                }
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-300 truncate">{item.alt || "No caption"}</p>
              </div>
              <button onClick={() => onDelete(item.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Impact tab ───────────────────────────────────────────────────────────────
function ImpactTab({ password }: { password: string }) {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved]   = useState<string | null>(null);

  useEffect(() => { fetch("/api/statistics").then(r => r.json()).then(setData); }, []);

  const save = async (section: string, updates: Partial<StatisticsData>) => {
    setSaving(section);
    const res = await fetch("/api/statistics", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...updates }) });
    const json = await res.json();
    if (json.success) { setData(json.data); setSaved(section); setTimeout(() => setSaved(null), 2000); }
    setSaving(null);
  };

  if (!data) return <p className="text-gray-400">Loading...</p>;
  return (
    <div className="space-y-10">
      <StatCardsEditor data={data} saving={saving} saved={saved} onSave={save} />
      <KeyNumbersEditor data={data} saving={saving} saved={saved} onSave={save} />
      <IndustriesEditor data={data} saving={saving} saved={saved} onSave={save} />
      <MarketDataEditor data={data} saving={saving} saved={saved} onSave={save} />
      <RetentionEditor data={data} saving={saving} saved={saved} onSave={save} />
    </div>
  );
}

function SaveBtn({ section, saving, saved }: { section: string; saving: string | null; saved: string | null }) {
  return (
    <button type="submit" disabled={!!saving}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${saved === section ? "bg-green-600 text-white" : "bg-orange-600 hover:bg-orange-500 text-white"}`}>
      {saving === section ? "Saving…" : saved === section ? "Saved ✓" : "Save Changes"}
    </button>
  );
}

function sectionBox(title: string, children: React.ReactNode): React.ReactElement {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h2 className="text-lg font-semibold text-white mb-5">{title}</h2>
      {children}
    </div>
  );
}

function StatCardsEditor({ data, saving, saved, onSave }: { data: StatisticsData; saving: string | null; saved: string | null; onSave: (s: string, u: Partial<StatisticsData>) => void }) {
  const [stats, setStats] = useState<StatItem[]>(data.stats);
  return sectionBox("Key Stats Cards", (
    <form onSubmit={e => { e.preventDefault(); onSave("stats", { stats }); }}>
      <div className="space-y-3 mb-5">
        {stats.map((s, i) => (
          <div key={s.id} className="grid grid-cols-12 gap-3 items-center">
            <span className="col-span-1 text-xs text-gray-500 text-center">#{i+1}</span>
            <div className="col-span-5"><input value={s.label} onChange={e => setStats(p => p.map((x,j) => j===i?{...x,label:e.target.value}:x))} placeholder="Label" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-4"><input type="number" value={s.value} onChange={e => setStats(p => p.map((x,j) => j===i?{...x,value:Number(e.target.value)}:x))} className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-2"><input value={s.suffix} onChange={e => setStats(p => p.map((x,j) => j===i?{...x,suffix:e.target.value}:x))} placeholder="Suffix" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
          </div>
        ))}
      </div>
      <SaveBtn section="stats" saving={saving} saved={saved} />
    </form>
  ));
}

function KeyNumbersEditor({ data, saving, saved, onSave }: { data: StatisticsData; saving: string | null; saved: string | null; onSave: (s: string, u: Partial<StatisticsData>) => void }) {
  const [years, setYears] = useState(data.yearsOfExperience);
  const [hours, setHours] = useState(data.turnaroundHours);
  return sectionBox("Key Numbers", (
    <form onSubmit={e => { e.preventDefault(); onSave("keynumbers", { yearsOfExperience: years, turnaroundHours: hours }); }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div><label className="block text-sm text-gray-400 mb-1">Years of Experience</label><input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none" /></div>
        <div><label className="block text-sm text-gray-400 mb-1">Turnaround Time (Hours)</label><input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none" /></div>
      </div>
      <SaveBtn section="keynumbers" saving={saving} saved={saved} />
    </form>
  ));
}

function IndustriesEditor({ data, saving, saved, onSave }: { data: StatisticsData; saving: string | null; saved: string | null; onSave: (s: string, u: Partial<StatisticsData>) => void }) {
  const [industries, setIndustries] = useState<Industry[]>(data.industries);
  return sectionBox("Industry Focus", (
    <form onSubmit={e => { e.preventDefault(); onSave("industries", { industries }); }}>
      <div className="space-y-3 mb-4">
        {industries.map((ind, i) => (
          <div key={ind.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5"><input value={ind.name} onChange={e => setIndustries(p => p.map((x,j)=>j===i?{...x,name:e.target.value}:x))} placeholder="Industry" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-3"><input type="number" min="0" max="100" value={ind.percent} onChange={e => setIndustries(p => p.map((x,j)=>j===i?{...x,percent:Number(e.target.value)}:x))} className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-3"><input type="color" value={ind.color} onChange={e => setIndustries(p => p.map((x,j)=>j===i?{...x,color:e.target.value}:x))} className="w-full h-9 rounded cursor-pointer bg-transparent border border-gray-700" /></div>
            <div className="col-span-1 flex justify-center"><button type="button" onClick={() => setIndustries(p => p.filter((_,j)=>j!==i))} className="w-7 h-7 rounded-full bg-red-900/50 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center text-sm transition-colors">&times;</button></div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setIndustries(p => [...p, { id: `i${Date.now()}`, name: "", percent: 0, color: "#f97316" }])} className="text-sm text-orange-400 hover:text-orange-300 mb-5 transition-colors">+ Add Industry</button>
      <div><SaveBtn section="industries" saving={saving} saved={saved} /></div>
    </form>
  ));
}

function MarketDataEditor({ data, saving, saved, onSave }: { data: StatisticsData; saving: string | null; saved: string | null; onSave: (s: string, u: Partial<StatisticsData>) => void }) {
  const [marketData, setMarketData] = useState<MarketPoint[]>(data.marketData);
  const [year, setYear] = useState(data.marketDataYear ?? new Date().getFullYear());
  return sectionBox("Job Opening Trends (Chart Data)", (
    <form onSubmit={e => { e.preventDefault(); onSave("marketdata", { marketData, marketDataYear: year }); }}>
      <div className="mb-5"><label className="block text-xs text-gray-400 mb-1">Year</label><input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-32 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
        {marketData.map((pt, i) => (
          <div key={pt.month}><label className="block text-xs text-gray-400 mb-1">{pt.month}</label><input type="number" value={pt.value} onChange={e => setMarketData(p => p.map((x,j)=>j===i?{...x,value:Number(e.target.value)}:x))} className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
        ))}
      </div>
      <SaveBtn section="marketdata" saving={saving} saved={saved} />
    </form>
  ));
}

// ─── History Images tab ───────────────────────────────────────────────────────
const HISTORY_YEARS = [
  { year: "2002", label: "When We Started" }, { year: "2010", label: "Expanding Horizons" },
  { year: "2018", label: "Going Global" },    { year: "2024", label: "The Future Is Now" },
];
type HistoryImageItem = { id: string; year: string; image_src: string };

function HistoryImagesTab({ password }: { password: string }) {
  const [items, setItems]         = useState<HistoryImageItem[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ year: string; ok: boolean; text: string } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchData = async () => {
    const res = await fetch("/api/history-images");
    if (res.ok) setItems(await res.json());
  };
  useEffect(() => { fetchData(); }, []);

  const showStatus = (year: string, ok: boolean, text: string) => {
    setStatusMsg({ year, ok, text }); setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleUpload = async (year: string) => {
    const file = fileRefs.current[year]?.files?.[0];
    if (!file) { showStatus(year, false, "Select a file first."); return; }
    setUploading(year);
    const fd = new FormData(); fd.append("file", file); fd.append("year", year); fd.append("password", password);
    const res = await fetch("/api/history-images", { method: "POST", body: fd });
    const json = await res.json();
    if (fileRefs.current[year]) fileRefs.current[year]!.value = "";
    showStatus(year, res.ok, res.ok ? "Uploaded." : json.error ?? "Failed");
    if (res.ok) fetchData();
    setUploading(null);
  };

  const handleDelete = async (year: string) => {
    if (!confirm(`Remove image for ${year}?`)) return;
    const res = await fetch("/api/history-images", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year, password }) });
    showStatus(year, res.ok, res.ok ? "Removed." : "Failed");
    if (res.ok) fetchData();
  };

  return (
    <div className="space-y-4">
      {HISTORY_YEARS.map(({ year, label }) => {
        const existing = items.find(i => i.year === year);
        const msg = statusMsg?.year === year ? statusMsg : null;
        return (
          <div key={year} className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-24 shrink-0"><p className="text-xl font-bold text-orange-400">{year}</p><p className="text-xs text-gray-500 mt-0.5">{label}</p></div>
              <div className="w-28 shrink-0 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center" style={{height:72}}>
                {existing ? <img src={existing.image_src} alt={year} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500 text-center px-2">Default</span>}
              </div>
              <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input ref={el => { fileRefs.current[year] = el; }} type="file" accept="image/*" className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-orange-700 file:text-white file:cursor-pointer file:text-sm" />
                <button onClick={() => handleUpload(year)} disabled={uploading === year} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shrink-0">{uploading === year ? "Uploading…" : existing ? "Replace" : "Upload"}</button>
                {existing && <button onClick={() => handleDelete(year)} className="px-4 py-2 rounded-lg bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white text-sm font-semibold transition-colors shrink-0">Remove</button>}
              </div>
            </div>
            {msg && <p className={`text-xs font-medium px-1 ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.ok ? "✓" : "✗"} {msg.text}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Messages tab ─────────────────────────────────────────────────────────────
type ContactMessage = { id: string; name: string; email: string; message: string; read: boolean; created_at: string };

function MessagesTab({ password }: { password: string }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const res = await fetch("/api/messages", { headers: { "x-admin-password": password } });
    if (!res.ok) { setError("Failed to load messages."); setLoading(false); return; }
    setMessages(await res.json()); setError(""); setLoading(false);
  };
  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    await fetch("/api/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, password }) });
    setMessages(p => p.filter(m => m.id !== id));
  };

  const toggleRead = async (msg: ContactMessage) => {
    await fetch("/api/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msg.id, read: !msg.read, password }) });
    setMessages(p => p.map(m => m.id === msg.id ? { ...m, read: !m.read } : m));
  };

  const unread = messages.filter(m => !m.read).length;
  if (loading) return <p className="text-gray-400">Loading messages...</p>;
  if (error)   return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Contact Messages</h2>
          <p className="text-sm text-gray-400 mt-1">{messages.length} total{unread > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-600 text-white text-xs font-semibold">{unread} unread</span>}</p>
        </div>
        <button onClick={fetchMessages} className="text-sm text-gray-400 hover:text-white transition-colors">Refresh</button>
      </div>
      {messages.length === 0 ? <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 text-center text-gray-500">No messages yet.</div> : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`bg-gray-900 rounded-xl border transition-colors ${msg.read ? "border-gray-800" : "border-orange-800"}`}>
              <div className="flex items-start gap-4 p-5">
                <div className="mt-1.5 shrink-0">{!msg.read ? <span className="block w-2 h-2 rounded-full bg-orange-400" /> : <span className="block w-2 h-2 rounded-full bg-gray-700" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-white">{msg.name}</span>
                    <a href={`mailto:${msg.email}`} className="text-orange-400 text-sm hover:underline truncate">{msg.email}</a>
                    <span className="text-xs text-gray-500 ml-auto shrink-0">{new Date(msg.created_at).toLocaleString("en-AU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className={`mt-2 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed ${expanded === msg.id ? "" : "line-clamp-2"}`}>{msg.message}</p>
                  {msg.message.length > 120 && <button onClick={() => setExpanded(expanded === msg.id ? null : msg.id)} className="text-xs text-orange-400 hover:text-orange-300 mt-1 transition-colors">{expanded === msg.id ? "Show less" : "Read more"}</button>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleRead(msg)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-gray-800 hover:bg-gray-700 text-gray-300">{msg.read ? "Mark Unread" : "Mark Read"}</button>
                  <button onClick={() => handleDelete(msg.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Retention editor ─────────────────────────────────────────────────────────
function RetentionEditor({ data, saving, saved, onSave }: { data: StatisticsData; saving: string | null; saved: string | null; onSave: (s: string, u: Partial<StatisticsData>) => void }) {
  const [clientYears, setClientYears]       = useState(data.retentionClientYears);
  const [candidateYears, setCandidateYears] = useState(data.retentionCandidateYears);
  return sectionBox("Retention Ratio (Donut Chart)", (
    <form onSubmit={e => { e.preventDefault(); onSave("retention", { retentionClientYears: clientYears, retentionCandidateYears: candidateYears }); }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div><label className="block text-sm text-gray-400 mb-1">Client Retention (Years)</label><input type="number" step="0.1" value={clientYears} onChange={e => setClientYears(Number(e.target.value))} className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none" /></div>
        <div><label className="block text-sm text-gray-400 mb-1">Candidate Retention (Years)</label><input type="number" step="0.1" value={candidateYears} onChange={e => setCandidateYears(Number(e.target.value))} className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none" /></div>
      </div>
      <SaveBtn section="retention" saving={saving} saved={saved} />
    </form>
  ));
}

// ─── Hero Section tab ──────────────────────────────────────────────────────────
type HeroStat = { id: string; value: string; label: string; icon_key: string };
type HeroJob = { id: string; job_title: string; location: string; label: string };
type HeroProfile = { id: string; name: string; role: string; sub: string; initial: string; image_url: string | null };
type HeroCardsData = { stats: HeroStat[]; jobs: HeroJob[]; profiles: HeroProfile[] };

const ICON_OPTIONS = [
  { key: "chart", label: "Chart (yellow)" },
  { key: "users", label: "Users (green)" },
  { key: "building", label: "Building (blue)" },
];

function HeroTab({ password }: { password: string }) {
  const [data, setData] = useState<HeroCardsData | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved]   = useState<string | null>(null);

  const fetchData = () => fetch("/api/hero-cards").then(r => r.json()).then(setData);
  useEffect(() => { fetchData(); }, []);

  const save = async (section: string, updates: Partial<HeroCardsData>) => {
    setSaving(section);
    const res = await fetch("/api/hero-cards", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...updates }) });
    const json = await res.json();
    if (json.success) { setData(json.data); setSaved(section); setTimeout(() => setSaved(null), 2000); }
    setSaving(null);
  };

  if (!data) return <p className="text-gray-400">Loading...</p>;
  return (
    <div className="space-y-10">
      <HeroStatsEditor data={data} saving={saving} saved={saved} onSave={save} />
      <HeroJobsEditor data={data} saving={saving} saved={saved} onSave={save} />
      <HeroProfilesEditor data={data} password={password} onProfilesChanged={fetchData} />
    </div>
  );
}

function HeroStatsEditor({ data, saving, saved, onSave }: { data: HeroCardsData; saving: string | null; saved: string | null; onSave: (s: string, u: Partial<HeroCardsData>) => void }) {
  const [stats, setStats] = useState<HeroStat[]>(data.stats);
  return sectionBox("Hero Stats Card (top-right, rotates through 3)", (
    <form onSubmit={e => { e.preventDefault(); onSave("herostats", { stats }); }}>
      <div className="space-y-3 mb-5">
        {stats.map((s, i) => (
          <div key={s.id} className="grid grid-cols-12 gap-3 items-center">
            <span className="col-span-1 text-xs text-gray-500 text-center">#{i+1}</span>
            <div className="col-span-3"><input value={s.value} onChange={e => setStats(p => p.map((x,j) => j===i?{...x,value:e.target.value}:x))} placeholder="Value (e.g. 150+)" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-4"><input value={s.label} onChange={e => setStats(p => p.map((x,j) => j===i?{...x,label:e.target.value}:x))} placeholder="Label" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-4">
              <select value={s.icon_key} onChange={e => setStats(p => p.map((x,j) => j===i?{...x,icon_key:e.target.value}:x))} className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none">
                {ICON_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
      <SaveBtn section="herostats" saving={saving} saved={saved} />
    </form>
  ));
}

function HeroJobsEditor({ data, saving, saved, onSave }: { data: HeroCardsData; saving: string | null; saved: string | null; onSave: (s: string, u: Partial<HeroCardsData>) => void }) {
  const [jobs, setJobs] = useState<HeroJob[]>(data.jobs);
  return sectionBox("Hero Job Openings Card (left, rotates through 3)", (
    <form onSubmit={e => { e.preventDefault(); onSave("herojobs", { jobs }); }}>
      <div className="space-y-3 mb-5">
        {jobs.map((j, i) => (
          <div key={j.id} className="grid grid-cols-12 gap-3 items-center">
            <span className="col-span-1 text-xs text-gray-500 text-center">#{i+1}</span>
            <div className="col-span-3"><input value={j.label} onChange={e => setJobs(p => p.map((x,k) => k===i?{...x,label:e.target.value}:x))} placeholder="Badge (e.g. We are Hiring)" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-4"><input value={j.job_title} onChange={e => setJobs(p => p.map((x,k) => k===i?{...x,job_title:e.target.value}:x))} placeholder="Job Title" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-4"><input value={j.location} onChange={e => setJobs(p => p.map((x,k) => k===i?{...x,location:e.target.value}:x))} placeholder="Location" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
          </div>
        ))}
      </div>
      <SaveBtn section="herojobs" saving={saving} saved={saved} />
    </form>
  ));
}

function HeroProfilesEditor({ data, password, onProfilesChanged }: { data: HeroCardsData; password: string; onProfilesChanged: () => void }) {
  const [profiles, setProfiles] = useState<HeroProfile[]>(data.profiles);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { setProfiles(data.profiles); }, [data.profiles]);

  const saveText = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/hero-cards", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, profiles }) });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  const handleUpload = async (id: string) => {
    const file = fileRefs.current[id]?.files?.[0];
    if (!file) return;
    setUploading(id);
    const fd = new FormData(); fd.append("file", file); fd.append("id", id); fd.append("password", password);
    const res = await fetch("/api/hero-cards", { method: "POST", body: fd });
    if (fileRefs.current[id]) fileRefs.current[id]!.value = "";
    if (res.ok) onProfilesChanged();
    setUploading(null);
  };

  return sectionBox("Hero Team Profile Card (bottom-right, rotates through 3)", (
    <form onSubmit={saveText}>
      <div className="space-y-4 mb-5">
        {profiles.map((p, i) => (
          <div key={p.id} className="grid grid-cols-12 gap-3 items-center">
            <span className="col-span-1 text-xs text-gray-500 text-center">#{i+1}</span>
            <div className="col-span-2 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500">No photo</span>}
              </div>
              <input ref={el => { fileRefs.current[p.id] = el; }} type="file" accept="image/*" onChange={() => handleUpload(p.id)} className="text-[11px] text-gray-400 w-full file:mr-1 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-orange-700 file:text-white file:cursor-pointer file:text-[11px]" />
              {uploading === p.id && <span className="text-[11px] text-orange-400">Uploading…</span>}
            </div>
            <div className="col-span-2"><input value={p.name} onChange={e => setProfiles(pr => pr.map((x,j) => j===i?{...x,name:e.target.value}:x))} placeholder="Name" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-3"><input value={p.role} onChange={e => setProfiles(pr => pr.map((x,j) => j===i?{...x,role:e.target.value}:x))} placeholder="Role" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-3"><input value={p.sub} onChange={e => setProfiles(pr => pr.map((x,j) => j===i?{...x,sub:e.target.value}:x))} placeholder="Skills (e.g. MERN | AWS)" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none" /></div>
            <div className="col-span-1"><input value={p.initial} maxLength={1} onChange={e => setProfiles(pr => pr.map((x,j) => j===i?{...x,initial:e.target.value.toUpperCase()}:x))} placeholder="R" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm text-center focus:border-orange-500 focus:outline-none" /></div>
          </div>
        ))}
      </div>
      <button type="submit" disabled={saving}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${saved ? "bg-green-600 text-white" : "bg-orange-600 hover:bg-orange-500 text-white"}`}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </form>
  ));
}

// ─── Social Links tab ──────────────────────────────────────────────────────────
// Fully dynamic: add any platform, rename it, change its URL, or remove it —
// not limited to a fixed set. Unrecognized platform names on the public site
// fall back to a generic icon (see app/utils/socialIcons.tsx).
type SocialLink = { id: string; label: string; url: string; sort_order?: number };

function SocialTab({ password }: { password: string }) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const fetchData = () => fetch("/api/social-links").then(r => r.json()).then(data => { setLinks(data); setLoaded(true); });
  useEffect(() => { fetchData(); }, []);

  const addLink = () => {
    setLinks(prev => [...prev, { id: `link_${Date.now()}`, label: "", url: "" }]);
  };

  const removeLink = (i: number) => {
    setLinks(prev => prev.filter((_, j) => j !== i));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/social-links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, links }),
    });
    const json = await res.json();
    if (json.success) { setLinks(json.data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  if (!loaded) return <p className="text-gray-400">Loading...</p>;

  return sectionBox("Social Media Links (Navbar, Footer, Insights section)", (
    <form onSubmit={save}>
      <div className="space-y-3 mb-4">
        {links.map((link, i) => (
          <div key={link.id} className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-3">
              <input
                value={link.label}
                onChange={e => setLinks(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                placeholder="Platform (e.g. Instagram)"
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="col-span-8">
              <input
                value={link.url}
                onChange={e => setLinks(prev => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <button type="button" onClick={() => removeLink(i)} className="w-7 h-7 rounded-full bg-red-900/50 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center text-sm transition-colors">&times;</button>
            </div>
          </div>
        ))}
        {links.length === 0 && <p className="text-sm text-gray-500">No social links yet — add one below.</p>}
      </div>
      <button type="button" onClick={addLink} className="text-sm text-orange-400 hover:text-orange-300 mb-5 transition-colors">+ Add Social Link</button>
      <div><SaveBtn section="social" saving={saving ? "social" : null} saved={saved ? "social" : null} /></div>
    </form>
  ));
}

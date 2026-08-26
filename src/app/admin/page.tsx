"use client";

import { useEffect, useRef, useState } from "react";
import { IMAGE_LOCATIONS, IMAGE_CATEGORY_INFO } from "@/lib/imageLocations";
import type { InsightPost, InsightCategoryRow, CaseStudy, CaseStudyType, TeamMember, Industry } from "@/content/types";
import type { CalculatorBreakdownLine } from "@/lib/calculatorShare";
import InsightBodyEditor from "@/components/admin/InsightBodyEditor";
import { resolveCtaHref } from "@/lib/insightCtaRoutes";

const STORAGE_KEY = "mintex_admin_pw";
const TABS = ["jobs", "clients", "social", "stories", "images", "messages", "resumes", "inquiries", "insights", "caseStudies", "team", "industries", "curation", "calculatorSaves"] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, string> = {
  jobs: "Jobs", clients: "Clients", social: "Social Links", stories: "Client Stories", images: "Site Images", messages: "Messages", resumes: "Resumes", inquiries: "Hiring Inquiries", insights: "Insights", caseStudies: "Case Studies", team: "Team", industries: "Industries", curation: "Interview Questions", calculatorSaves: "Saved Calculators",
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
    const res = await fetch("/api/admin/clients", {
      headers: { "x-admin-password": password },
    });
    if (res.status === 401) { setAuthError("Wrong password"); return; }
    if (!res.ok) { setAuthError("Server error — check that the Supabase keys in .env.local are set and the migrations have run."); return; }
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

  if (loading) return <div className="min-h-screen bg-cream" />;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl border border-navy/10 shadow-[0_8px_30px_rgba(0,48,96,0.08)] w-full max-w-sm">
          <h1 className="text-2xl font-bold text-navy mb-6">Admin Login</h1>
          <input type="password" placeholder="Enter admin password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-navy border border-navy/10 focus:border-steel focus:outline-none mb-4" />
          {authError && <p className="text-red-600 text-sm mb-4">{authError}</p>}
          <button type="submit" className="w-full py-3 rounded-full bg-white border border-navy hover:bg-mist text-navy font-semibold transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-navy">
      <div className="border-b border-navy/10 px-6 md:px-10 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <button onClick={handleLogout} className="text-sm text-navy/60 hover:text-red-600 transition-colors">Logout</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-navy text-white border border-b-0 border-navy/10"
                    : "text-navy/50 hover:text-navy"
                }`}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        {activeTab === "jobs"    && <JobsTab password={activePassword} />}
        {activeTab === "clients" && <ClientsTab password={activePassword} />}
        {activeTab === "social"  && <SocialTab password={activePassword} />}
        {activeTab === "stories" && <ClientStoriesTab password={activePassword} />}
        {activeTab === "images"  && <SiteImagesTab password={activePassword} />}
        {activeTab === "messages" && <MessagesTab password={activePassword} />}
        {activeTab === "resumes" && <ResumesTab password={activePassword} />}
        {activeTab === "inquiries" && <InquiriesTab password={activePassword} />}
        {activeTab === "insights" && <InsightsTab password={activePassword} />}
        {activeTab === "caseStudies" && <CaseStudiesTab password={activePassword} />}
        {activeTab === "team" && <TeamMembersTab password={activePassword} />}
        {activeTab === "industries" && <IndustriesTab password={activePassword} />}
        {activeTab === "curation" && <CurationTab password={activePassword} />}
        {activeTab === "calculatorSaves" && <CalculatorSavedResultsTab password={activePassword} />}
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
  if (s === "active")           return "bg-green-100 text-green-800";
  if (s === "on hold")          return "bg-yellow-100 text-yellow-800";
  if (s === "hold by client")   return "bg-amber-100 text-amber-800";
  if (s === "filled")           return "bg-navy/10 text-navy";
  if (s === "draft")            return "bg-purple-100 text-purple-700";
  if (s.includes("closed"))     return "bg-red-100 text-red-700";
  return "bg-white text-navy/60";
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
    <div className="flex flex-col items-center gap-4 py-20 text-navy/60">
      <div className="w-8 h-8 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      <p>Loading all jobs from CEIPAL…</p>
      <p className="text-xs text-navy/50">Fetching all jobs from CEIPAL — only needed on first load, then cached for 5 minutes</p>
    </div>
  );
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Jobs from CEIPAL</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-navy/60">{jobs.length} total · showing {afterSearch.length}</p>
            {cachedAt && (
              <span className="text-xs text-navy/50">
                Last synced: {new Date(cachedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                <span className="ml-1 text-navy/40">(auto-refreshes every 5 min)</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadJobs(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors disabled:opacity-50"
          >
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
            {refreshing ? "Syncing…" : "Sync Now"}
          </button>
          <input value={search} onChange={e => setSearchVal(e.target.value)}
            placeholder="Search title, code, client…"
            className="px-4 py-2 rounded-lg bg-white border border-navy/10 text-navy text-sm w-64 focus:border-steel focus:outline-none" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap mb-4">
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 border ${
              statusTab === t.key
                ? "bg-navy text-white border-navy"
                : "bg-white text-navy/50 hover:text-navy border-navy/20"
            }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusTab === t.key ? "bg-white/20 text-white" : "bg-cream text-navy/50"}`}>
              {counts[t.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-mist text-left text-xs font-semibold uppercase tracking-wide text-navy/50">
              <th className="px-4 py-3 font-semibold">Job Code</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Pos.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/50">No jobs found</td></tr>
            ) : paginated.map((job, i) => (
              <tr
                key={String(job.job_code ?? i)}
                onClick={() => setSelected(job)}
                className="hover:bg-cream cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-steel font-mono text-xs whitespace-nowrap">{String(job.job_code ?? "—")}</td>
                <td className="px-4 py-3 text-navy font-medium max-w-xs"><div className="truncate">{String(job.job_title ?? "—")}</div></td>
                <td className="px-4 py-3 text-navy/70 max-w-[160px]"><div className="truncate">{String(job.client ?? "—")}</div></td>
                <td className="px-4 py-3 text-navy/60">{[job.city, job.states].filter(Boolean).join(", ") || "—"}</td>
                <td className="px-4 py-3 text-navy/60 whitespace-nowrap">{String(job.job_type ?? "—")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor(String(job.job_status ?? ""))}`}>
                    {String(job.job_status ?? "—")}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy/60 text-center">{String(job.number_of_positions ?? "—")}</td>
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
          <p className="text-sm text-navy/60">
            Page {safePage} of {totalPages} · {afterSearch.length} jobs
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage === 1}
              className="px-2.5 py-1.5 rounded-full border border-navy/10 bg-white hover:bg-mist text-navy text-xs disabled:opacity-30 transition-colors">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="px-3 py-1.5 rounded-full border border-navy/10 bg-white hover:bg-mist text-navy text-xs disabled:opacity-30 transition-colors">‹ Prev</button>

            {/* Page number buttons — show up to 7 around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
              .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(n); return acc;
              }, [])
              .map((n, i) =>
                n === "…"
                  ? <span key={`ellipsis-${i}`} className="px-2 text-navy/50 text-xs">…</span>
                  : <button key={n} onClick={() => setPage(n as number)}
                      className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        safePage === n ? "bg-white border border-navy text-navy font-semibold" : "bg-white hover:bg-mist text-navy/70"
                      }`}>{n}</button>
              )
            }

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-full border border-navy/10 bg-white hover:bg-mist text-navy text-xs disabled:opacity-30 transition-colors">Next ›</button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
              className="px-2.5 py-1.5 rounded-full border border-navy/10 bg-white hover:bg-mist text-navy text-xs disabled:opacity-30 transition-colors">»</button>
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
      <p className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-navy font-medium mt-0.5 truncate">{value || '—'}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream rounded-xl p-3 min-w-0">
      <p className="text-[10px] font-semibold text-navy/50 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-navy break-words">{value || '—'}</p>
    </div>
  );
}

function ModalSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-navy/60 justify-center">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

// ─── Snapshot tab ─────────────────────────────────────────────────────────────
function SnapshotTab({ job, detail, loading, error, onRetry, retrying }: {
  job: CeipalJob; detail: JobDetail | null; loading: boolean; error: string;
  onRetry?: () => void; retrying?: boolean;
}) {
  const desc = String(detail?.requisition_description ?? job.job_description ?? '');
  const skills = String(detail?.skills ?? job.primary_skills ?? '');
  const payRates = Array.isArray(detail?.pay_rates) ? (detail.pay_rates as Record<string, unknown>[]) : [];

  return (
    <div className="space-y-6">
      {/* Job Description */}
      {desc ? (
        <div>
          <h4 className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Job Description</h4>
          <div className="bg-mist rounded-xl p-4 text-sm text-navy/70 leading-relaxed max-h-52 overflow-y-auto prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: desc }} />
        </div>
      ) : loading ? null : (
        <div className="bg-mist rounded-xl p-4 text-sm text-navy/50 italic">No job description available.</div>
      )}

      {/* Pay Rates */}
      {payRates.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Pay Rates</h4>
          <div className="flex flex-wrap gap-2">
            {payRates.map((pr, i) => (
              <div key={i} className="bg-cream border border-navy/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <span className="text-steel font-bold text-sm">{String(pr.pay_rate ?? '—')}</span>
                <span className="text-navy/60 text-xs">{String(pr.pay_rate_currency ?? '')} / {String(pr.pay_rate_pay_frequency_type ?? '')}</span>
                {!!pr.pay_rate_employment_type && (
                  <span className="px-2 py-0.5 rounded-full bg-cream text-navy/70 text-[10px]">{String(pr.pay_rate_employment_type)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview grid */}
      <div>
        <h4 className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-3">Overview</h4>
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
          <h4 className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skills.split(/,\s*/).filter(Boolean).map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-cream text-navy text-xs border border-navy/10">{s.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {loading && <ModalSpinner label="Loading full details…" />}
      {error && (
        <div>
          <p className="text-red-600 text-sm">{error}</p>
          {onRetry && (
            <button onClick={onRetry} disabled={retrying}
              className="mt-2 px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors disabled:opacity-50">
              {retrying ? 'Refreshing…' : '↻ Refresh & Retry'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Details tab ──────────────────────────────────────────────────────────────
function DetailsTab({ detail, loading, error, onRetry, retrying }: {
  detail: JobDetail | null; loading: boolean; error: string;
  onRetry?: () => void; retrying?: boolean;
}) {
  if (loading) return <ModalSpinner label="Loading job details…" />;
  if (error) return (
    <div>
      <p className="text-red-600">{error}</p>
      {onRetry && (
        <button onClick={onRetry} disabled={retrying}
          className="mt-3 px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors disabled:opacity-50">
          {retrying ? 'Refreshing…' : '↻ Refresh & Retry'}
        </button>
      )}
    </div>
  );
  if (!detail) return <p className="text-navy/50 text-sm">No additional details available.</p>;

  return (
    <div className="space-y-6">
      {/* Contact Person */}
      {!!detail.contact_person && (
        <div>
          <h4 className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Contact Person</h4>
          <div className="bg-mist rounded-xl p-4 text-sm text-navy/70"
            dangerouslySetInnerHTML={{ __html: String(detail.contact_person) }} />
        </div>
      )}

      {/* Public JD */}
      {!!detail.public_job_desc && (
        <div>
          <h4 className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Public Job Description</h4>
          <div className="bg-mist rounded-xl p-4 text-sm text-navy/70 leading-relaxed max-h-48 overflow-y-auto prose prose-sm max-w-none"
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
              lineColored  ? 'bg-steel' :
              'bg-navy/10'
            }`} />
            <span className={`text-[9px] truncate w-full text-center hidden sm:block leading-none ${
              isActive ? 'text-navy font-semibold' : isComplete ? 'text-steel' : 'text-navy/40'
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
          isActive   ? 'bg-navy border-navy ring-2 ring-navy/20' :
          isComplete ? 'bg-steel border-steel' :
          'bg-white border-navy/20';

        return (
          <div key={stage} className="flex-1 flex flex-col items-center relative min-w-0">
            {/* Connecting line — starts at center of this dot, extends right */}
            {i < PIPELINE_STAGES.length - 1 && (
              <div className={`absolute top-[7px] left-1/2 w-full h-0.5 z-0 transition-colors ${
                lineColored ? 'bg-steel' : 'bg-navy/10'
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
              isActive ? 'text-navy font-semibold' : isComplete ? 'text-steel' : 'text-navy/50'
            }`}>
              {stage.split(' ')[0]}
            </p>
            {/* Date under active stage */}
            {isActive && submittedOn && (
              <p className="text-[8px] text-steel text-center truncate w-full px-0.5">{fmt(submittedOn)}</p>
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
  if (error)   return <p className="text-red-600 text-sm">{error}</p>;

  return (
    <div>
      {/* Stage filter tabs — CEIPAL style */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button onClick={() => setStageFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-navy text-white border border-navy' : 'bg-white text-navy/50 hover:text-navy border border-navy/20'}`}>
          All <span className="ml-1 opacity-70">{submissions.length}</span>
        </button>
        {PIPELINE_STAGES.map(stage => (
          <button key={stage} onClick={() => setStageFilter(stage)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${stageFilter === stage ? 'bg-navy text-white border border-navy' : 'bg-white text-navy/50 hover:text-navy border border-navy/20'}`}>
            {stage} <span className="ml-1 opacity-70">{stageCounts[stage] ?? 0}</span>
          </button>
        ))}
      </div>

      {enrichLoading && submissions.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-navy/50 mb-3">
          <div className="w-3 h-3 border border-navy/15 border-t-steel rounded-full animate-spin" />
          Loading candidate details…
        </div>
      )}

      {/* Table header — CEIPAL style */}
      {filtered.length > 0 && (
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold text-navy/50 uppercase tracking-wide border-b border-navy/10 mb-1">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Submitted By / On</div>
          <div className="col-span-2">Contact / Location</div>
          <div className="col-span-2">Pay Rate / Work Auth</div>
          <div className="col-span-2">Status</div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-navy/50 text-sm">No submissions{stageFilter !== 'all' ? ` in "${stageFilter}"` : ''}</p>
        </div>
      ) : (
        <div className="divide-y divide-navy/10">
          {filtered.map(sub => {
            const stageIdx    = mapStatusToStageIdx(sub.submission_status || sub.pipeline_status || '');
            const statusLabel = sub.submission_status || sub.pipeline_status || 'Unknown';
            const applicant   = applicants[sub.job_seeker_id] ?? null;
            const submittedBy = usersMap[sub.submitted_by ?? ''] || '';
            const submittedOn = sub.submitted_on
              ? new Date(sub.submitted_on).toLocaleString('en-AU', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
              : '';

            const statusCls =
              stageIdx === 6 ? 'text-red-600' :
              stageIdx >= 4  ? 'text-navy' :
              stageIdx >= 2  ? 'text-amber-700' :
              'text-steel';

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
                className="py-3 px-4 cursor-pointer hover:bg-cream transition-colors group">

                {/* CEIPAL-style table row */}
                <div className="grid grid-cols-12 gap-2 items-start">
                  {/* NAME */}
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-navy group-hover:text-steel transition-colors">
                      {applicant?.name || `Submission #${sub.submission_id}`}
                    </p>
                    <p className="text-[10px] text-navy/50 mt-0.5">{sub.source || ''}</p>
                  </div>

                  {/* SUBMITTED BY / ON */}
                  <div className="col-span-3">
                    <p className="text-xs text-navy/70">{submittedBy || '—'}</p>
                    <p className="text-[10px] text-navy/50">{submittedOn}</p>
                  </div>

                  {/* CONTACT / LOCATION */}
                  <div className="col-span-2">
                    <p className="text-xs text-navy/70">{applicant?.phone || '—'}</p>
                    <p className="text-[10px] text-navy/50">{location}</p>
                  </div>

                  {/* PAY RATE / WORK AUTH */}
                  <div className="col-span-2">
                    <p className="text-xs text-steel font-medium">{payDisplay}</p>
                    <p className="text-[10px] text-navy/50">{workAuth}</p>
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
    <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-navy text-lg">{candName}</h3>
            <p className="text-xs text-navy/50 mt-0.5">#{sub.submission_id} · {sub.source || ''}</p>
          </div>
          <button onClick={onClose} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Candidate info */}
          {applicant && (
            <div className="bg-mist rounded-xl p-4 grid grid-cols-2 gap-3">
              {applicant.email  && <InfoCard label="Email"    value={applicant.email} />}
              {applicant.phone  && <InfoCard label="Phone"    value={applicant.phone} />}
              {(applicant.city || applicant.state) && <InfoCard label="Location" value={[applicant.city, applicant.state].filter(Boolean).join(', ')} />}
              {applicant.work_authorization && <InfoCard label="Work Auth" value={applicant.work_authorization} />}
            </div>
          )}

          {/* Pipeline */}
          <div>
            <p className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Pipeline Stage</p>
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
                  <p className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Documents ({docs.length})</p>
                  <div className="space-y-2">
                    {docs.map((doc, i) => (
                      <a key={i} href={String(doc.document_path ?? '#')} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-xs border border-navy/10 transition-colors">
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
  const [usersMap, setUsersMap]   = useState<Record<string, string>>({});
  const [detail, setDetail]         = useState<JobDetail | null>(null);
  const [detailLoading, setDL]      = useState(false);
  const [detailError, setDE]        = useState('');
  const [submissions, setSubs]      = useState<Submission[]>([]);
  const [subsLoading, setSL]        = useState(false);
  const [subsError, setSE]          = useState('');
  const [selectedSub, setSelectedSub] = useState<{ sub: Submission; applicant: ApplicantInfo | null } | null>(null);
  // True only while a manual "Refresh & Retry" is in flight — separate from
  // detailLoading/subsLoading so the retry button can show its own "Refreshing…"
  // state instead of reusing the tabs' full-page spinners.
  const [retrying, setRetrying] = useState(false);
  // Bumping this re-runs the resolve-and-fetch effect on demand (retry button)
  // without adding a function reference to the effect's own dependency array —
  // an earlier version called a useCallback-wrapped fetch function from inside
  // the effect and that alone (regardless of what the function did) triggered
  // this codebase's react-hooks/set-state-in-effect lint rule; keeping the
  // fetch logic defined AND called entirely inside the effect body, as the
  // original code did, avoids it.
  const [refreshNonce, setRefreshNonce] = useState(0);
  const forceNextRefreshRef = useRef(false);

  const jobCode = String(job.job_code ?? '').trim();

  // Ceipal's job list only gives us an encoded recruiter/manager ID, not a
  // display name — same lookup SubmissionsTab already does for submitted_by.
  useEffect(() => {
    fetch('/api/admin/users-map')
      .then(r => (r.ok ? r.json() : {}))
      .then(setUsersMap)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!jobCode) return;

    const forceRefresh = forceNextRefreshRef.current;
    forceNextRefreshRef.current = false;
    if (forceRefresh) setRetrying(true);

    // Resolve the correct V2 ID from job_code via the server-side map cache,
    // then fetch details + submissions in parallel. "Job not found in V2
    // list" just means this job was posted since the map's last 6-hour
    // rebuild (see ceipal-job-map.ts) — forceRefresh lets the retry button
    // force an immediate rebuild instead of waiting out the rest of that
    // window.
    const resolveAndFetch = async () => {
      let v2Id = '';
      try {
        const mapRes = await fetch(`/api/admin/v2-job-map${forceRefresh ? '?refresh=1' : ''}`);
        const map: Record<string, string> = await mapRes.json();
        v2Id = map[jobCode] ?? '';
      } catch {
        setDE('Could not load job ID map'); setDL(false);
        setSE('Could not load job ID map'); setSL(false);
        setRetrying(false);
        return;
      }

      if (!v2Id) {
        setDE(`Job not found in V2 list (${jobCode})`); setDL(false);
        setSE(`Job not found in V2 list (${jobCode})`); setSL(false);
        setRetrying(false);
        return;
      }

      setDE(''); setSE('');
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

      setRetrying(false);
    };

    resolveAndFetch();
  }, [jobCode, refreshNonce]);

  const retryResolve = () => {
    forceNextRefreshRef.current = true;
    setRefreshNonce(n => n + 1);
  };

  const status = String(job.job_status ?? '');
  const tabs = [
    { key: 'snapshot'    as const, label: 'Snapshot' },
    { key: 'details'     as const, label: 'Job Details' },
    { key: 'submissions' as const, label: `Submissions${subsLoading ? '' : ` (${submissions.length})`}` },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-5xl shadow-2xl">

          {/* ── Header ── */}
          <div className="p-6 border-b border-navy/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-navy font-mono text-xs bg-cream px-2.5 py-1 rounded-md border border-navy/10">
                    {String(job.job_code ?? '')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(status)}`}>
                    {status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-navy truncate">{String(job.job_title ?? 'Job Detail')}</h2>
                <p className="text-navy/60 text-sm mt-1">
                  {[job.city, job.states, job.country].filter(Boolean).join(', ') || String(detail?.city ?? '')}
                </p>
              </div>
              <button onClick={onClose} className="text-navy/50 hover:text-navy text-2xl leading-none shrink-0 p-1">&times;</button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-navy/10">
              <QuickStat
                label="Recruiter"
                value={(() => {
                  // assigned_recruiter (from getJobPostingDetails) is the field that actually
                  // matches an ID in usersMap — sales_manager/client_manager off the job list
                  // are encoded differently and never resolve, so they're a last-resort fallback
                  // only for the moment before `detail` has loaded.
                  const id = String(
                    detail?.assigned_recruiter ?? job.sales_manager ?? job.client_manager ?? detail?.recruitment_manager ?? ''
                  ).trim();
                  return id ? (usersMap[id] || id) : '—';
                })()}
              />
              <QuickStat label="Pay Rate"   value={String(job.pay_rate___salary ?? '')} />
              <QuickStat label="Positions"  value={String(job.number_of_positions ?? detail?.number_of_positions ?? '')} />
              <QuickStat label="Industry"   value={String(detail?.industry ?? job.industry ?? '')} />
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-navy/10 px-6 gap-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === t.key
                    ? 'text-navy font-semibold border-b-2 border-tan -mb-px'
                    : 'text-navy/50 hover:text-navy'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div className="p-6 min-h-[300px]">
            {activeTab === 'snapshot'    && <SnapshotTab job={job} detail={detail} loading={detailLoading} error={detailError} onRetry={retryResolve} retrying={retrying} />}
            {activeTab === 'details'     && <DetailsTab detail={detail} loading={detailLoading} error={detailError} onRetry={retryResolve} retrying={retrying} />}
            {activeTab === 'submissions' && <SubmissionsTab submissions={submissions} loading={subsLoading} error={subsError} onSelectSub={(s, a) => setSelectedSub({ sub: s, applicant: a })} />}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-6 flex justify-end border-t border-navy/10 pt-4">
            <button onClick={onClose}
              className="px-5 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors">
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
          <p className="text-sm text-navy/60 mt-1">
            {ceipalClients.length} CEIPAL clients · {withAccess.length} have portal access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
            className="px-4 py-2 rounded-lg bg-white border border-navy/10 text-navy text-sm w-56 focus:border-steel focus:outline-none" />
          <button onClick={loadAll} className="px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors">↻ Refresh</button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewTab === k ? "bg-navy text-white border border-navy" : "bg-white text-navy/50 hover:text-navy border border-navy/20"}`}>
            {l}
          </button>
        ))}
      </div>

      {loadingCeipal ? (
        <div className="flex items-center gap-3 py-10 text-navy/60">
          <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
          Loading clients from CEIPAL…
        </div>
      ) : viewTab === "ceipal" ? (
        /* ── CEIPAL clients list ── */
        <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-mist text-left text-xs font-semibold uppercase tracking-wide text-navy/50">
                <th className="px-4 py-3 font-semibold">Client Name</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Portal Access</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {filteredCeipal.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-navy/50">No clients found</td></tr>
              ) : filteredCeipal.map(c => (
                <tr key={c.id} className="hover:bg-cream transition-colors">
                  <td className="px-4 py-3 text-navy font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-navy/60">{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-navy/60">{c.category || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "Active" ? "bg-green-100 text-green-800" : "bg-white text-navy/60"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.portal_access ? (
                      <span className="flex items-center gap-1.5 text-xs text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                        @{c.portal_access.username}
                      </span>
                    ) : (
                      <span className="text-xs text-navy/50">No access</span>
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
                          className="px-3 py-1.5 rounded-full border border-navy/10 bg-white hover:bg-mist text-navy text-xs font-medium transition-colors">
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const pc = portalClients.find(p => p.ceipal_id === c.id);
                            if (pc) deletePortalClient(pc.id, c.name);
                          }}
                          className="px-3 py-1.5 rounded-full border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-medium transition-colors">
                          Revoke
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setFormClient(c)}
                        className="px-3 py-1.5 rounded-full bg-white border border-navy hover:bg-mist text-navy text-xs font-semibold transition-colors">
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
            <div className="bg-white rounded-xl border border-navy/10 p-10 text-center text-navy/50">
              No clients have portal access yet. Go to "All Clients" tab and click "+ Create Access".
            </div>
          )}
          {portalClients.map(c => (
            <div key={c.id} className={`bg-white rounded-xl border p-5 ${c.is_active ? "border-navy/10" : "border-navy/10 opacity-60"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-navy">{c.company || c.name}</h3>
                    <span className="text-steel font-mono text-sm">@{c.username}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? "bg-green-100 text-green-800" : "bg-white text-navy/50"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {c.email && <p className="text-sm text-navy/60 mt-0.5">{c.email}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(c.allowed_job_codes ?? []).length > 0
                      ? (c.allowed_job_codes ?? []).map((code: string) => (
                          <span key={code} className="px-2 py-0.5 rounded bg-cream text-navy/70 text-xs font-mono">{code}</span>
                        ))
                      : <span className="text-xs text-navy/50">All jobs visible</span>
                    }
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setEditClient(c)}
                    className="px-3 py-1.5 rounded-full border border-navy/10 bg-white hover:bg-mist text-navy text-xs font-medium transition-colors">Edit</button>
                  <button onClick={() => toggleActive(c)}
                    className="px-3 py-1.5 rounded-full border border-navy/10 bg-white hover:bg-mist text-navy text-xs font-medium transition-colors">
                    {c.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => deletePortalClient(c.id, c.company || c.name)}
                    className="px-3 py-1.5 rounded-full border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-medium transition-colors">Revoke</button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-navy/10 flex flex-wrap gap-2">
                {Object.entries(c.permissions ?? {}).map(([k, v]: [string, unknown]) => (
                  <span key={k} className={`text-xs px-2 py-0.5 rounded ${v ? "bg-green-100 text-green-800" : "bg-cream text-navy/50"}`}>
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
    <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-navy/10">
          <div>
            <h3 className="text-xl font-bold">{initial ? "Edit Portal Access" : "Create Portal Access"}</h3>
            <p className="text-steel text-sm mt-1 font-medium">{company}</p>
          </div>
          <button onClick={onCancel} className="text-navy/50 hover:text-navy text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Username + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy/70 mb-1.5">Username <span className="text-red-500">*</span> <span className="text-xs text-navy/50">(used for login)</span></label>
              <input value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, ""))} required
                placeholder="e.g. acme_corp" autoComplete="off"
                className="w-full px-4 py-2.5 rounded-xl bg-white text-navy border border-navy/10 focus:border-steel focus:outline-none text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy/70 mb-1.5">Email <span className="text-xs text-navy/50">(credentials sent here)</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white text-navy border border-navy/10 focus:border-steel focus:outline-none text-sm" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1.5">
              {initial ? "New Password" : "Password"} <span className="text-red-500">{initial ? "" : "*"}</span>
              {initial && <span className="text-xs text-navy/50 ml-1">(leave blank to keep current)</span>}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-navy border border-navy/10 focus:border-steel focus:outline-none text-sm font-mono" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/50 hover:text-navy/70 text-xs transition-colors">
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <button type="button" onClick={handleGenerate}
                className="px-4 py-2.5 rounded-xl bg-white border border-navy/10 hover:bg-mist text-navy text-sm font-semibold transition-colors whitespace-nowrap">
                Generate
              </button>
            </div>
            {pw && showPw && <p className="text-xs text-steel mt-1 font-mono">{pw}</p>}
          </div>

          {/* Job Assignments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium text-navy/70">
                  Assigned Jobs
                  {selectedCodes.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-cream text-navy/70 text-xs font-semibold">{selectedCodes.length} selected</span>
                  )}
                </label>
                <p className="text-xs text-navy/50 mt-0.5">
                  {selectedCodes.length === 0 ? "No jobs assigned — client will see jobs matching their company name" : "Client will only see these specific jobs"}
                </p>
              </div>
              <button type="button" onClick={() => setShowJobPicker(p => !p)}
                className="px-3 py-1.5 rounded-lg bg-white border border-navy/10 hover:bg-mist text-navy/70 text-xs font-semibold transition-colors">
                {showJobPicker ? "Hide" : "Browse Jobs"}
              </button>
            </div>

            {/* Selected codes chips */}
            {selectedCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedCodes.map(code => (
                  <span key={code} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cream border border-navy/10 text-navy/80 text-xs font-mono">
                    {code}
                    <button type="button" onClick={() => setSelectedCodes(s => s.filter(c => c !== code))}
                      className="text-navy/40 hover:text-navy ml-0.5 leading-none">&times;</button>
                  </span>
                ))}
                <button type="button" onClick={() => setSelectedCodes([])}
                  className="text-xs text-navy/50 hover:text-red-600 transition-colors px-1">clear all</button>
              </div>
            )}

            {/* Job browser */}
            {showJobPicker && (
              <div className="border border-navy/10 rounded-xl overflow-hidden">
                <div className="p-3 bg-mist border-b border-navy/10">
                  <input value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    placeholder="Search jobs by title, code or client…"
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 focus:border-steel focus:outline-none text-xs" />
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
                        <label key={code} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-navy/5 transition-colors ${checked ? "bg-tan/10" : "hover:bg-cream"}`}>
                          <input type="checkbox" checked={checked}
                            onChange={() => setSelectedCodes(s => checked ? s.filter(c => c !== code) : [...s, code])}
                            className="w-3.5 h-3.5 rounded accent-tan cursor-pointer flex-shrink-0" />
                          <span className="text-steel font-mono text-xs w-24 flex-shrink-0">{code}</span>
                          <span className="text-navy/70 text-xs flex-1 truncate">{String(j.job_title ?? "")}</span>
                          <span className="text-navy/50 text-xs flex-shrink-0">{String(j.job_status ?? "")}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Resend email option — only shown when editing */}
          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer bg-cream rounded-xl px-4 py-3 border border-navy/10">
              <input type="checkbox" checked={resendEmail} onChange={e => setResendEmail(e.target.checked)}
                className="w-4 h-4 rounded accent-tan cursor-pointer" />
              <div>
                <span className="text-sm font-medium text-navy">Resend credentials email to client</span>
                <p className="text-xs text-navy/50 mt-0.5">Requires email address + new password above</p>
              </div>
            </label>
          )}

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-semibold text-navy/70 mb-3">Portal Permissions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Jobs section */}
              <div className="bg-mist rounded-xl p-4">
                <p className="text-xs font-semibold text-navy/50 mb-3 uppercase tracking-wide">Jobs</p>
                <div className="space-y-2.5">
                  {["show_bill_rate","show_pay_rate","show_job_salary","show_job_description","show_required_skills","allow_job_posting"].map(k => (
                    <label key={k} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={!!perms[k]} onChange={e => setPerms(p => ({ ...p, [k]: e.target.checked }))}
                        className="w-4 h-4 rounded accent-tan cursor-pointer" />
                      <span className="text-sm text-navy/70 group-hover:text-navy transition-colors">{PERMISSION_LABELS[k]}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Candidates section */}
              <div className="bg-mist rounded-xl p-4">
                <p className="text-xs font-semibold text-navy/50 mb-3 uppercase tracking-wide">Candidates</p>
                <div className="space-y-2.5">
                  {["show_candidate_name","show_candidate_email","show_candidate_phone","show_candidate_resume","show_candidate_ssn","show_tax_terms","show_placement_dates","show_placement_bill_rate","show_placement_pay_rate"].map(k => (
                    <label key={k} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={!!perms[k]} onChange={e => setPerms(p => ({ ...p, [k]: e.target.checked }))}
                        className="w-4 h-4 rounded accent-tan cursor-pointer" />
                      <span className="text-sm text-navy/70 group-hover:text-navy transition-colors">{PERMISSION_LABELS[k]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-full bg-white border border-navy hover:bg-mist text-navy font-semibold transition-colors disabled:opacity-50 text-sm">
              {saving ? (isEdit ? "Saving…" : "Creating…") : isEdit ? (resendEmail ? "Save & Resend Email" : "Save Changes") : `Create Access${email ? " & Send Email" : ""}`}
            </button>
            <button type="button" onClick={onCancel}
              className="px-6 py-3 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Social Links tab ─────────────────────────────────────────────────────────
// Fully dynamic: add any platform, rename it, change its URL, or remove it.
// Unrecognized platform names fall back to a generic icon on the public site
// (see src/components/layout/socialIcons.tsx).
type SocialLink = { id: string; label: string; url: string; sort_order?: number };

function SocialTab({ password }: { password: string }) {
  const [links, setLinks]   = useState<SocialLink[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  const fetchData = () =>
    fetch("/api/social-links")
      .then((r) => r.json())
      .then((data) => { setLinks(Array.isArray(data) ? data : []); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const addLink = () => {
    setLinks((prev) => [...prev, { id: `link_${Date.now()}`, label: "", url: "" }]);
  };

  const removeLink = (i: number) => {
    setLinks((prev) => prev.filter((_, j) => j !== i));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/social-links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, links }),
    });
    const json = await res.json();
    if (json.success) {
      setLinks(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(json.error ?? "Failed to save");
    }
    setSaving(false);
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading social links…
    </div>
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-navy">Social Media Links</h2>
        <p className="text-sm text-navy/60 mt-1">Shown in the site footer. Add, rename, or remove any platform.</p>
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl border border-navy/10 p-6">
        <div className="space-y-3 mb-4">
          {links.map((link, i) => (
            <div key={link.id} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3">
                <input
                  value={link.label}
                  onChange={(e) => setLinks((prev) => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  placeholder="Platform (e.g. Instagram)"
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
                />
              </div>
              <div className="col-span-8">
                <input
                  value={link.url}
                  onChange={(e) => setLinks((prev) => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button type="button" onClick={() => removeLink(i)}
                  className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors">
                  &times;
                </button>
              </div>
            </div>
          ))}
          {links.length === 0 && <p className="text-sm text-navy/50">No social links yet — add one below.</p>}
        </div>

        <button type="button" onClick={addLink}
          className="text-sm text-steel hover:text-navy font-medium mb-5 transition-colors">
          + Add Social Link
        </button>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div>
          <button type="submit" disabled={saving}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
              saved ? "bg-green-100 text-green-800" : "bg-white border border-navy hover:bg-mist text-navy"
            }`}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Client Stories tab ───────────────────────────────────────────────────────
// Videos shown in the homepage "You need to see it to believe it" section.
// First entry becomes the large featured card, second the smaller card.
type ClientStory = {
  id: string; quote: string; author: string; role: string;
  video_url: string; thumbnail_url: string;
};

function ClientStoriesTab({ password }: { password: string }) {
  const [stories, setStories]   = useState<ClientStory[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [sectionEnabled, setSectionEnabled] = useState<boolean | null>(null);
  const [togglingSection, setTogglingSection] = useState(false);
  const [sectionToggleError, setSectionToggleError] = useState("");

  const fetchData = () =>
    fetch("/api/client-stories")
      .then((r) => r.json())
      .then((data) => {
        setStories(Array.isArray(data) ? data.map((s: Partial<ClientStory>) => ({
          id: s.id ?? "", quote: s.quote ?? "", author: s.author ?? "",
          role: s.role ?? "", video_url: s.video_url ?? "", thumbnail_url: s.thumbnail_url ?? "",
        })) : []);
        setLoaded(true);
      });

  useEffect(() => {
    fetchData();
    fetch("/api/client-stories/section")
      .then((r) => r.json())
      .then((d) => setSectionEnabled(d.enabled !== false));
  }, []);

  const toggleSection = async () => {
    const next = !sectionEnabled;
    setTogglingSection(true);
    setSectionToggleError("");
    const res = await fetch("/api/client-stories/section", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, enabled: next }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setSectionEnabled(next);
    } else {
      setSectionToggleError(
        json.error?.includes("site_section_settings")
          ? "Database table missing — run migration 013_site_section_settings.sql in Supabase first."
          : json.error ?? "Failed to update"
      );
    }
    setTogglingSection(false);
  };

  const addStory = () => {
    setStories((prev) => [...prev, {
      id: `story_${Date.now()}`, quote: "", author: "", role: "", video_url: "", thumbnail_url: "",
    }]);
  };

  const removeStory = (i: number) => {
    setStories((prev) => prev.filter((_, j) => j !== i));
  };

  const updateStory = (i: number, patch: Partial<ClientStory>) => {
    setStories((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  };

  const uploadVideo = async (i: number, file: File) => {
    setUploadError("");
    setUploadingId(stories[i].id);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    const res = await fetch("/api/client-stories/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (json.url) updateStory(i, { video_url: json.url });
    else setUploadError(json.error ?? "Upload failed");
    setUploadingId(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/client-stories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, stories }),
    });
    const json = await res.json();
    if (json.success) {
      setStories(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(json.error ?? "Failed to save");
    }
    setSaving(false);
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading client stories…
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-navy">Client Story Videos</h2>
          <p className="text-sm text-navy/60 mt-1">
            Shown in the homepage &ldquo;You need to see it to believe it&rdquo; section. The first
            entry is the large featured video, the second is the smaller card.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sectionEnabled ? "bg-green-100 text-green-800" : "bg-white text-navy/50 border border-navy/10"}`}>
            {sectionEnabled === null ? "…" : sectionEnabled ? "Visible on site" : "Hidden from site"}
          </span>
          <button type="button" onClick={toggleSection} disabled={sectionEnabled === null || togglingSection}
            className="px-3 py-1.5 rounded-full border border-navy/10 bg-white hover:bg-mist text-navy text-xs font-medium transition-colors disabled:opacity-50">
            {togglingSection ? "Updating…" : sectionEnabled ? "Hide Section" : "Show Section"}
          </button>
        </div>
      </div>
      {sectionToggleError && (
        <p className="mb-5 -mt-3 text-sm text-red-600">{sectionToggleError}</p>
      )}

      <form onSubmit={save} className="space-y-4">
        {stories.map((story, i) => (
          <div key={story.id} className="bg-white rounded-2xl border border-navy/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-navy/50">
                {i === 0 ? "Featured video" : `Video ${i + 1}`}
              </span>
              <button type="button" onClick={() => removeStory(i)}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors">
                &times;
              </button>
            </div>
            <div className="grid gap-3">
              <textarea
                value={story.quote}
                onChange={(e) => updateStory(i, { quote: e.target.value })}
                placeholder="Quote"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none resize-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={story.author}
                  onChange={(e) => updateStory(i, { author: e.target.value })}
                  placeholder="Author (e.g. VP of Engineering)"
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
                />
                <input
                  value={story.role}
                  onChange={(e) => updateStory(i, { role: e.target.value })}
                  placeholder="Company / role (e.g. Series C SaaS Company)"
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    value={story.video_url}
                    onChange={(e) => updateStory(i, { video_url: e.target.value })}
                    placeholder="Video URL (mp4, YouTube, or Vimeo link)"
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
                  />
                  <label className="mt-1.5 flex items-center gap-2 text-xs text-navy/50">
                    <span>or</span>
                    <span className="relative inline-flex items-center px-2.5 py-1 rounded-full bg-cream hover:bg-mist text-navy/70 font-medium cursor-pointer transition-colors">
                      {uploadingId === story.id ? "Uploading…" : "Upload from your computer"}
                      <input
                        type="file"
                        accept="video/*"
                        disabled={uploadingId !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadVideo(i, file);
                          e.target.value = "";
                        }}
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </span>
                  </label>
                </div>
                <input
                  value={story.thumbnail_url}
                  onChange={(e) => updateStory(i, { thumbnail_url: e.target.value })}
                  placeholder="Thumbnail URL (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
        {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
        {stories.length === 0 && (
          <p className="text-sm text-navy/50">No client story videos yet — add one below.</p>
        )}

        <div className="flex items-center justify-between">
          <button type="button" onClick={addStory}
            className="text-sm text-steel hover:text-navy font-medium transition-colors">
            + Add Video
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <button type="submit" disabled={saving}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
              saved ? "bg-green-100 text-green-800" : "bg-white border border-navy hover:bg-mist text-navy"
            }`}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Site Images Tab ──────────────────────────────────────────────────────────
type LocationRow = {
  location_key: string; page_name: string; section_name: string;
  default_src: string; file_path: string; alt_text: string | null; is_static: boolean;
};
type OrphanRow = { id: string; file_path: string };

const PAGE_ORDER = [
  "Global", "Client Portal", "Home", "About", "Get Hired", "Share Resume", "Seek Talent",
  "Seek Talent Services", "Resources", "AI Interview Generator",
];

// Known pages keep their preferred spot; any page_name not yet listed above
// (e.g. a brand-new page) is appended automatically instead of being dropped
// from the admin UI — see memory: mintex-admin-page-order-gotcha.
function orderedPages(locations: { page_name: string }[]): string[] {
  const known = PAGE_ORDER.filter((p) => locations.some((l) => l.page_name === p));
  const extra = Array.from(new Set(locations.map((l) => l.page_name)))
    .filter((p) => !PAGE_ORDER.includes(p))
    .sort();
  return [...known, ...extra];
}

// Reads a picked file's real pixel dimensions in the browser before it ever
// gets uploaded — lets the upload flow warn about a too-small image (which
// will look blurry once stretched to fill its real spot on the page)
// immediately, instead of the admin only finding out after checking the
// live site.
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const probe = new window.Image();
    const url = URL.createObjectURL(file);
    probe.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    probe.src = url;
  });
}

// Vercel's serverless functions reject request bodies above a hard platform
// limit before our own /api/site-images/upload route (and its own 8MB check)
// ever runs — a big phone/DSLR photo fails there with a non-JSON 413 the
// server route never gets a chance to produce a friendly error for. Shrinking
// oversized photos client-side, before they're ever sent, avoids hitting that
// limit at all instead of trying to work around it after the fact.
const SHRINK_THRESHOLD_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_UPLOAD_DIMENSION = 2000; // px, longest side

async function shrinkImageIfNeeded(file: File): Promise<File> {
  if (file.size <= SHRINK_THRESHOLD_BYTES) return file;
  // Resizing would rasterize a vector (SVG) or collapse an animated GIF to a
  // single frame — neither format is the "huge camera photo" case this
  // exists for, so leave them alone and let the server-side check handle it.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image"));
      el.src = dataUrl;
    });

    const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    // PNG keeps transparency; everything else compresses far smaller as JPEG.
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.85));
    if (!blob) return file;

    const ext = outputType === "image/png" ? "png" : "jpg";
    const newName = file.name.replace(/\.[^.]+$/, "") + "." + ext;
    return new File([blob], newName, { type: outputType });
  } catch {
    // Anything goes wrong client-side (unsupported format, decode failure) —
    // fall back to the original file rather than blocking the upload; the
    // server's own 8MB check still guards against an oversized result.
    return file;
  }
}

function SiteImagesTab({ password }: { password: string }) {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [orphans, setOrphans]     = useState<OrphanRow[]>([]);
  const [loaded, setLoaded]       = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState("");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadError, setUploadError]   = useState("");
  const [assignTarget, setAssignTarget] = useState<Record<string, string>>({});
  const [loadError, setLoadError]       = useState("");
  // Keyed by location_key — a friendly heads-up (not a hard block) when a
  // just-uploaded image is smaller than what its spot needs to look sharp.
  const [sizeWarnings, setSizeWarnings] = useState<Record<string, string>>({});
  // Every page section starts collapsed — with 24+ image slots across 10
  // pages (some, like Seek Talent Services, have many cards each), showing
  // everything expanded at once made this tab a very long scroll just to
  // reach one image near the bottom.
  const [openPages, setOpenPages] = useState<Record<string, boolean>>({});

  const fetchData = (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setSyncing(true);
    return fetch("/api/site-images", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data: { locations?: LocationRow[]; orphans?: OrphanRow[]; error?: string }) => {
        setLocations(Array.isArray(data.locations) ? data.locations : []);
        setOrphans(Array.isArray(data.orphans) ? data.orphans : []);
        setLoadError(!data.locations && data.error ? data.error : "");
        setLoaded(true);
        setSyncing(false);
      })
      .catch(() => {
        setLoadError("Could not reach the server.");
        setLoaded(true);
        setSyncing(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const updateLocation = (key: string, file_path: string) => {
    setLocations((prev) => prev.map((l) => (l.location_key === key ? { ...l, file_path } : l)));
  };

  const uploadImage = async (key: string, file: File) => {
    setUploadError("");
    setSizeWarnings((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    // Check the real pixel size before uploading — a warning here, not a
    // block, since a smaller-than-recommended image might still be a
    // deliberate choice (e.g. a simple icon). This can only catch images
    // that are too SMALL; it can't fix one that's already blurry — that
    // needs a sharper source photo, not a setting.
    const category = IMAGE_LOCATIONS.find((l) => l.locationKey === key)?.category;
    if (category) {
      try {
        const { width, height } = await getImageDimensions(file);
        const info = IMAGE_CATEGORY_INFO[category];
        if (width < info.minWidth || height < info.minHeight) {
          setSizeWarnings((prev) => ({
            ...prev,
            [key]: `This image is ${width}×${height}px, smaller than the ${info.minWidth}×${info.minHeight}px recommended for this spot — it may look blurry once stretched to fit.`,
          }));
        }
      } catch {
        // Couldn't read dimensions client-side — not worth blocking the
        // upload over, just skip the size check for this file.
      }
    }

    setUploadingKey(key);
    try {
      const uploadFile = await shrinkImageIfNeeded(file);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("password", password);
      const res = await fetch("/api/site-images/upload", { method: "POST", body: formData });

      // A platform-level failure (e.g. Vercel's own request-size limit) comes
      // back as plain text, not JSON — res.json() would throw on that and
      // silently abort this function before the button ever resets. Read as
      // text first and parse only if there's something JSON-shaped there.
      const raw = await res.text();
      let json: { url?: string; error?: string } = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch {
        // Non-JSON response — fall through to the generic status-based message below.
      }

      if (res.ok && json.url) {
        updateLocation(key, json.url);
      } else {
        setUploadError(json.error || `Upload failed (server said: ${res.status} ${res.statusText || "error"}). Try a smaller image.`);
      }
    } catch {
      setUploadError("Could not reach the server. Check your connection and try again.");
    } finally {
      setUploadingKey(null);
    }
  };

  const assignOrphan = (orphan: OrphanRow) => {
    const targetKey = assignTarget[orphan.id];
    if (!targetKey) return;
    updateLocation(targetKey, orphan.file_path);
    setOrphans((prev) => prev.filter((o) => o.id !== orphan.id));
  };

  const dismissOrphan = async (id: string) => {
    setOrphans((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/site-images/orphans/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/site-images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        locations: locations.map((l) => ({ location_key: l.location_key, file_path: l.file_path, alt_text: l.alt_text })),
      }),
    });
    const json = await res.json();
    if (json.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(json.error ?? "Failed to save");
    }
    setSaving(false);
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading site images…
    </div>
  );

  const pages = orderedPages(locations);

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Site Images</h2>
          <p className="text-sm text-navy/60 mt-1">
            Every image slot, grouped by exactly where it&apos;s used. Replacing one only affects that
            page &amp; section — it never changes the same photo used elsewhere.
          </p>
        </div>
        <button type="button" onClick={() => fetchData()} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors disabled:opacity-50">
          <span className={syncing ? "animate-spin" : ""}>↻</span>
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load site images: {loadError}
          {loadError.includes("site_images") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/005_site_images.sql</code> in your Supabase SQL editor, then hit Sync Now.</>
          )}
        </div>
      )}

      <form onSubmit={save} className="space-y-3">
        {pages.map((page) => {
          const count = locations.filter((l) => l.page_name === page).length;
          const isOpen = !!openPages[page];
          return (
          <div
            key={page}
            className={`rounded-2xl border bg-white transition-colors ${isOpen ? "border-tan/40 shadow-[0_8px_24px_-12px_rgba(0,48,96,0.15)]" : "border-navy/10 hover:border-navy/20"}`}
          >
            <button
              type="button"
              onClick={() => setOpenPages((prev) => ({ ...prev, [page]: !prev[page] }))}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-3">
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isOpen ? "bg-steel/15 text-steel" : "bg-cream text-navy/40"}`}>
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
                    <path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L4 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-navy">{page}</span>
                <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-semibold text-navy/50">{count}</span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 flex-shrink-0 text-navy/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
            <div className="grid gap-4 border-t border-navy/10 px-5 pb-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {locations.filter((l) => l.page_name === page).map((loc) => {
                const category = IMAGE_LOCATIONS.find((l) => l.locationKey === loc.location_key)?.category;
                const info = category ? IMAGE_CATEGORY_INFO[category] : null;
                const warning = sizeWarnings[loc.location_key];
                return (
                <div key={loc.location_key} className="bg-cream/50 rounded-2xl border border-navy/10 p-4">
                  {/* Matches the real aspect-ratio and crop/letterbox behavior this
                      spot uses live — so what's previewed here is what visitors
                      actually see, not a generic guess. */}
                  <div
                    className="flex items-center justify-center rounded-lg bg-cream mb-3 overflow-hidden"
                    style={{ aspectRatio: info?.aspect ?? "4 / 3" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied preview, arbitrary URL */}
                    <img
                      src={loc.file_path}
                      alt={loc.section_name}
                      className="h-full w-full"
                      style={{ objectFit: info?.fit ?? "contain" }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-steel mb-1">
                    Used in: {loc.page_name} &rsaquo; {loc.section_name}
                  </p>
                  {info && (
                    <p className="text-[10px] text-navy/45 mb-1">
                      Recommended: {info.label}, at least {info.minWidth}×{info.minHeight}px
                    </p>
                  )}
                  {warning && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mb-1">
                      {warning}
                    </p>
                  )}
                  <div className="space-y-2 mt-2">
                    <input
                      value={loc.file_path}
                      onChange={(e) => updateLocation(loc.location_key, e.target.value)}
                      placeholder="Image URL (or upload below)"
                      className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-xs focus:border-steel focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="relative flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-cream hover:bg-mist text-navy/70 text-xs font-medium cursor-pointer transition-colors text-center">
                        {uploadingKey === loc.location_key ? "Uploading…" : "Upload from computer"}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingKey !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadImage(loc.location_key, file);
                            e.target.value = "";
                          }}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </label>
                      {loc.file_path !== loc.default_src && (
                        <button type="button" onClick={() => updateLocation(loc.location_key, loc.default_src)}
                          className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 text-xs font-medium transition-colors whitespace-nowrap">
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            )}
          </div>
          );
        })}

        {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <button type="submit" disabled={saving}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
              saved ? "bg-green-100 text-green-800" : "bg-white border border-navy hover:bg-mist text-navy"
            }`}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </form>

      {orphans.length > 0 && (
        <div className="mt-10 pt-8 border-t border-navy/10">
          <h3 className="text-lg font-semibold text-navy mb-1">Unassigned Static Images</h3>
          <p className="text-sm text-navy/60 mb-4">
            Found in <code className="px-1 py-0.5 rounded bg-cream">/public</code> but not wired to any page yet.
            Assign one to an existing slot above, or dismiss it to stop tracking it (this doesn&apos;t delete the file).
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orphans.map((orphan) => (
              <div key={orphan.id} className="relative bg-white rounded-2xl border border-navy/10 p-4 flex flex-col">
                <button type="button" onClick={() => dismissOrphan(orphan.id)} title="Dismiss"
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cream hover:bg-red-100 text-navy/40 hover:text-red-600 flex items-center justify-center text-sm leading-none transition-colors">
                  &times;
                </button>

                <div className="flex items-center justify-center h-24 rounded-lg bg-cream mb-3 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static /public preview */}
                  <img src={orphan.file_path} alt="" className="max-h-full max-w-full object-contain" />
                </div>

                <p className="text-xs font-mono text-navy/70 mb-3 break-all">{orphan.file_path}</p>

                <div className="mt-auto space-y-2">
                  <select
                    value={assignTarget[orphan.id] ?? ""}
                    onChange={(e) => setAssignTarget((prev) => ({ ...prev, [orphan.id]: e.target.value }))}
                    className="w-full min-w-0 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-xs focus:border-steel focus:outline-none"
                  >
                    <option value="">Assign to…</option>
                    {orderedPages(locations).map((page) => (
                      <optgroup key={page} label={page}>
                        {locations.filter((l) => l.page_name === page).map((l) => (
                          <option key={l.location_key} value={l.location_key}>{l.section_name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button type="button" onClick={() => assignOrphan(orphan)} disabled={!assignTarget[orphan.id]}
                    className="w-full px-3 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Messages Tab ─────────────────────────────────────────────────────────────
type ContactMessage = {
  id: string; name: string; email: string; company: string | null; phone: string | null;
  subject: string; message: string; is_read: boolean; created_at: string;
};

function MessagesTab({ password }: { password: string }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchData = () =>
    fetch("/api/admin/messages", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) { setMessages(data); setLoadError(""); }
        else setLoadError(data.error ?? "Failed to load messages");
        setLoaded(true);
      })
      .catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.is_read) return;
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
    await fetch(`/api/admin/messages/${msg.id}`, {
      method: "PUT",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSelected(null);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading messages…
    </div>
  );

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Contact Us Messages</h2>
          <p className="text-sm text-navy/60 mt-1">
            {messages.length} total · {unreadCount} unread
          </p>
        </div>
        <button type="button" onClick={fetchData}
          className="px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors">
          ↻ Refresh
        </button>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load messages: {loadError}
          {loadError.includes("contact_messages") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/006_contact_messages.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {messages.length === 0 && !loadError ? (
        <div className="py-16 text-center text-navy/50 text-sm">No messages yet.</div>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
          {messages.map((msg) => (
            <div key={msg.id} onClick={() => openMessage(msg)}
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-cream transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${msg.is_read ? "bg-transparent" : "bg-steel"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${msg.is_read ? "text-navy/70" : "text-navy font-semibold"}`}>{msg.name}</p>
                  <span className="text-xs text-navy/40 flex-shrink-0">{msg.email}</span>
                </div>
                <p className="text-xs text-navy/60 truncate mt-0.5">{msg.subject} — {msg.message}</p>
              </div>
              <span className="text-xs text-navy/40 flex-shrink-0 whitespace-nowrap">
                {new Date(msg.created_at).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-navy text-lg">{selected.subject}</h3>
                <p className="text-xs text-navy/50 mt-0.5">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Name" value={selected.name} />
                <InfoCard label="Email" value={selected.email} />
                {selected.company && <InfoCard label="Company" value={selected.company} />}
                {selected.phone && <InfoCard label="Phone" value={selected.phone} />}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Message</p>
                <div className="bg-mist rounded-xl p-4 text-sm text-navy/80 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={`mailto:${selected.email}`}
                  className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors">
                  Reply by Email
                </a>
                <button onClick={() => deleteMessage(selected.id)}
                  className="px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Saved Calculators Tab ─────────────────────────────────────────────────────
type CalculatorSavedResult = {
  id: string;
  code: string;
  mode: "employer" | "staffing" | "search";
  heading: string;
  headline_label: string;
  headline_value: string;
  lines: CalculatorBreakdownLine[];
  created_at: string;
};

const CALCULATOR_MODE_LABELS: Record<CalculatorSavedResult["mode"], string> = {
  employer: "Employer",
  staffing: "Staffing firm",
  search: "Executive search",
};

function CalculatorSavedResultsTab({ password }: { password: string }) {
  const [results, setResults] = useState<CalculatorSavedResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<CalculatorSavedResult | null>(null);

  const fetchData = () =>
    fetch("/api/admin/calculator-saved-results", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) { setResults(data); setLoadError(""); }
        else setLoadError(data.error ?? "Failed to load saved calculators");
        setLoaded(true);
      })
      .catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const deleteResult = async (id: string) => {
    if (!confirm("Delete this saved calculation? Its link will stop working.")) return;
    setResults((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
    await fetch(`/api/admin/calculator-saved-results/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading saved calculators…
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Saved Hiring Cost Calculators</h2>
          <p className="text-sm text-navy/60 mt-1">
            {results.length} saved via &ldquo;Save these numbers&rdquo; on the calculator
          </p>
        </div>
        <button type="button" onClick={fetchData}
          className="px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors">
          ↻ Refresh
        </button>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load saved calculators: {loadError}
          {loadError.includes("calculator_saved_results") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/024_calculator_saved_results.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {results.length === 0 && !loadError ? (
        <div className="py-16 text-center text-navy/50 text-sm">No one has saved a calculation yet.</div>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
          {results.map((r) => (
            <div key={r.id} onClick={() => setSelected(r)}
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-cream transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-navy truncate">{CALCULATOR_MODE_LABELS[r.mode]}</p>
                  <span className="text-xs text-navy/40 font-mono flex-shrink-0">{r.code}</span>
                </div>
                <p className="text-xs text-navy/60 truncate mt-0.5">{r.headline_label} — {r.headline_value}</p>
              </div>
              <span className="text-xs text-navy/40 flex-shrink-0 whitespace-nowrap">
                {new Date(r.created_at).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-navy text-lg">{selected.heading}</h3>
                <p className="text-xs text-navy/50 mt-0.5">
                  {CALCULATOR_MODE_LABELS[selected.mode]} · {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-5">
              <InfoCard label={selected.headline_label} value={selected.headline_value} />
              <div>
                <p className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide mb-2">Breakdown</p>
                <div className="bg-mist rounded-xl divide-y divide-navy/10 overflow-hidden">
                  {selected.lines.map((line, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <span className={line.strong ? "font-semibold text-navy" : "text-navy/80"}>{line.label}</span>
                      <span className={`font-semibold whitespace-nowrap ${line.accent ? "text-emerald-600" : "text-navy"}`}>{line.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={`/resources/hiring-cost-calculator/saved/${selected.code}`} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors">
                  Open Saved Link
                </a>
                <button onClick={() => deleteResult(selected.id)}
                  className="px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Resumes Tab ──────────────────────────────────────────────────────────────
type ResumeSubmission = {
  id: string; name: string; email: string; industry: string | null;
  resume_path: string; resume_filename: string; is_read: boolean; created_at: string;
};

function ResumesTab({ password }: { password: string }) {
  const [resumes, setResumes] = useState<ResumeSubmission[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<ResumeSubmission | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchData = () =>
    fetch("/api/admin/resumes", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) { setResumes(data); setLoadError(""); }
        else setLoadError(data.error ?? "Failed to load resumes");
        setLoaded(true);
      })
      .catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const openResume = async (r: ResumeSubmission) => {
    setSelected(r);
    if (r.is_read) return;
    setResumes((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_read: true } : x)));
    await fetch(`/api/admin/resumes/${r.id}`, {
      method: "PUT",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
  };

  const deleteResume = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    setResumes((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
    await fetch(`/api/admin/resumes/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
  };

  const downloadResume = async (r: ResumeSubmission) => {
    setDownloadError("");
    setDownloadingId(r.id);
    try {
      const res = await fetch(`/api/admin/resumes/download?id=${encodeURIComponent(r.id)}`, {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (!res.ok) { setDownloadError(data.error ?? "Download failed"); return; }
      window.open(data.url, "_blank");
    } catch {
      setDownloadError("Could not reach the server.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading resumes…
    </div>
  );

  const unreadCount = resumes.filter((r) => !r.is_read).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Shared Resumes</h2>
          <p className="text-sm text-navy/60 mt-1">
            {resumes.length} total · {unreadCount} unread
          </p>
        </div>
        <button type="button" onClick={fetchData}
          className="px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors">
          ↻ Refresh
        </button>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load resumes: {loadError}
          {loadError.includes("resume_submissions") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/011_resume_submissions.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {downloadError && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {downloadError}
        </div>
      )}

      {resumes.length === 0 && !loadError ? (
        <div className="py-16 text-center text-navy/50 text-sm">No resumes shared yet.</div>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
          {resumes.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.is_read ? "bg-transparent" : "bg-steel"}`} />
              <div onClick={() => openResume(r)} className="min-w-0 flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${r.is_read ? "text-navy/70" : "text-navy font-semibold"}`}>{r.name}</p>
                  <span className="text-xs text-navy/40 flex-shrink-0">{r.email}</span>
                </div>
                <p className="text-xs text-navy/60 truncate mt-0.5">
                  {r.industry || "No industry specified"} — {r.resume_filename}
                </p>
              </div>
              <span className="text-xs text-navy/40 flex-shrink-0 whitespace-nowrap">
                {new Date(r.created_at).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <button type="button" onClick={() => downloadResume(r)} disabled={downloadingId === r.id}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-tan/15 hover:bg-tan/25 text-navy text-xs font-semibold transition-colors disabled:opacity-50">
                {downloadingId === r.id ? "…" : "Download"}
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-navy text-lg">{selected.name}</h3>
                <p className="text-xs text-navy/50 mt-0.5">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Email" value={selected.email} />
                <InfoCard label="Industry" value={selected.industry || "—"} />
                <InfoCard label="Resume File" value={selected.resume_filename} />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => downloadResume(selected)} disabled={downloadingId === selected.id}
                  className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors disabled:opacity-50">
                  {downloadingId === selected.id ? "Preparing…" : "Download Resume"}
                </button>
                <a href={`mailto:${selected.email}`}
                  className="px-4 py-2 rounded-full bg-white hover:bg-mist text-navy text-sm font-semibold border border-navy/10 transition-colors">
                  Reply by Email
                </a>
                <button onClick={() => deleteResume(selected.id)}
                  className="px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hiring Inquiries Tab ───────────────────────────────────────────────────────
type HiringInquiry = {
  id: string; job_title: string; zip_code: string; first_name: string; last_name: string;
  email: string; phone: string; company: string; position: string;
  preferred_contact: "phone" | "email"; accepted_at: string | null;
  is_read: boolean; created_at: string;
};

function InquiriesTab({ password }: { password: string }) {
  const [inquiries, setInquiries] = useState<HiringInquiry[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<HiringInquiry | null>(null);
  const [accepting, setAccepting] = useState(false);

  const fetchData = () =>
    fetch("/api/admin/hiring-inquiries", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) { setInquiries(data); setLoadError(""); }
        else setLoadError(data.error ?? "Failed to load inquiries");
        setLoaded(true);
      })
      .catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const openInquiry = async (inquiry: HiringInquiry) => {
    setSelected(inquiry);
    if (inquiry.is_read) return;
    setInquiries((prev) => prev.map((i) => (i.id === inquiry.id ? { ...i, is_read: true } : i)));
    await fetch(`/api/admin/hiring-inquiries/${inquiry.id}`, {
      method: "PUT",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    setSelected(null);
    await fetch(`/api/admin/hiring-inquiries/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
  };

  const acceptInquiry = async (id: string) => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/admin/hiring-inquiries/${id}`, {
        method: "PUT",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setInquiries((prev) => prev.map((i) => (i.id === id ? data : i)));
      setSelected((prev) => (prev && prev.id === id ? data : prev));
    } finally {
      setAccepting(false);
    }
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading inquiries…
    </div>
  );

  const unreadCount = inquiries.filter((i) => !i.is_read).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Hiring Inquiries</h2>
          <p className="text-sm text-navy/60 mt-1">
            {inquiries.length} total · {unreadCount} unread
          </p>
        </div>
        <button type="button" onClick={fetchData}
          className="px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors">
          ↻ Refresh
        </button>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load inquiries: {loadError}
          {loadError.includes("hiring_inquiries") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/012_hiring_inquiries.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {inquiries.length === 0 && !loadError ? (
        <div className="py-16 text-center text-navy/50 text-sm">No hiring inquiries yet.</div>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} onClick={() => openInquiry(inquiry)}
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-cream transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${inquiry.is_read ? "bg-transparent" : "bg-steel"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${inquiry.is_read ? "text-navy/70" : "text-navy font-semibold"}`}>
                    {inquiry.first_name} {inquiry.last_name}
                  </p>
                  <span className="text-xs text-navy/40 flex-shrink-0">{inquiry.email}</span>
                </div>
                <p className="text-xs text-navy/60 truncate mt-0.5">
                  {inquiry.company} — {inquiry.job_title} — prefers {inquiry.preferred_contact}
                </p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${
                inquiry.accepted_at ? "bg-steel-lighter/40 text-navy" : "bg-tan/15 text-navy/70"
              }`}>
                {inquiry.accepted_at ? "Accepted" : "Pending"}
              </span>
              <span className="text-xs text-navy/40 flex-shrink-0 whitespace-nowrap">
                {new Date(inquiry.created_at).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-navy text-lg">{selected.first_name} {selected.last_name}</h3>
                <p className="text-xs text-navy/50 mt-0.5">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Email" value={selected.email} />
                <InfoCard label="Phone" value={selected.phone} />
                <InfoCard label="Company" value={selected.company} />
                <InfoCard label="Their Position" value={selected.position} />
                <InfoCard label="Job Title to Fill" value={selected.job_title} />
                <InfoCard label="Zip Code" value={selected.zip_code} />
                <InfoCard label="Preferred Contact Method" value={selected.preferred_contact === "email" ? "Email" : "Phone"} />
              </div>
              <p className="text-xs text-navy/50">
                {selected.accepted_at
                  ? `Accepted at ${new Date(selected.accepted_at).toLocaleString()} — the requester was emailed.`
                  : "Not yet accepted — accept to email the requester."}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {!selected.accepted_at && (
                  <button onClick={() => acceptInquiry(selected.id)} disabled={accepting}
                    className="px-4 py-2 rounded-full bg-navy hover:bg-navy-secondary text-white text-sm font-semibold transition-colors disabled:opacity-60">
                    {accepting ? "Accepting…" : "Accept Conversation"}
                  </button>
                )}
                <a href={`mailto:${selected.email}`}
                  className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors">
                  Reply by Email
                </a>
                <a href={`tel:${selected.phone}`}
                  className="px-4 py-2 rounded-full bg-white hover:bg-mist text-navy text-sm font-semibold border border-navy/10 transition-colors">
                  Call
                </a>
                <button onClick={() => deleteInquiry(selected.id)}
                  className="px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Insights Tab ─────────────────────────────────────────────────────────────
// Keep in sync with the server-side fallback in src/app/api/admin/insights/route.ts —
// this is the live preview as the admin types the title; that route is what
// actually runs if the Slug field is left untouched.
const SLUG_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "for", "to", "in", "on", "at",
  "by", "with", "is", "are", "was", "were", "be", "been", "being", "this",
  "that", "these", "those", "you", "your", "should", "have", "has", "had",
  "will", "would", "can", "could", "it", "as", "from", "into", "than",
  "then", "so", "if", "not", "no", "do", "does", "did",
]);
const SLUG_MAX_WORDS = 6;

function slugify(title: string): string {
  const words = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter(Boolean);

  const meaningful = words.filter((w) => !SLUG_STOPWORDS.has(w));
  return (meaningful.length > 0 ? meaningful : words).slice(0, SLUG_MAX_WORDS).join("-");
}

type InsightSourceRow = { label: string; url: string };

type InsightDraft = {
  id?: string; slug: string; category: string; title: string;
  excerpt: string; bodyHtml: string; published_at: string; author: string; image_url: string | null;
  author_title: string; author_bio: string; author_photo_url: string;
  sources: InsightSourceRow[];
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// One-time upgrade path: a post saved before the rich-text editor existed has
// no body_html, just the old plain-paragraph array with its guessed
// conventions (short unpunctuated line = heading, "-> "/"→ " = CTA). This
// reconstructs a reasonable starting point for the editor so opening an old
// post for edit doesn't show a blank box — the CTA's real destination is
// lost (the old system inferred it from keywords at render time rather than
// storing it), so it defaults to /insights and needs a manual re-point via
// the Link toolbar.
function legacyBodyToHtml(paragraphs: string[]): string {
  return paragraphs
    .map((p) => {
      const t = p.trim();
      if (!t) return "";
      if (/^(→|->)\s*/.test(t)) {
        const label = t.replace(/^(→|->)\s*/, "");
        return `<p><a href="${resolveCtaHref(label)}" class="cta-button">${escapeHtml(label)}</a></p>`;
      }
      const isHeading = t.length <= 70 && !/[.!,;:]$/.test(t);
      return isHeading ? `<h2>${escapeHtml(t)}</h2>` : `<p>${escapeHtml(t)}</p>`;
    })
    .join("");
}

// The `body` TEXT[] column stays NOT NULL and unused by the rich-text render
// path, but a plain-text fallback is still stored: search/excerpt tooling
// that predates body_html reads it, and it's what the "Sources:" line has
// always lived in. Doesn't need to be a perfect inverse of the HTML.
function htmlToPlainParagraphs(html: string): string[] {
  return html
    .split(/<\/(?:p|h2|h3|li|blockquote)>/gi)
    .map((chunk) =>
      chunk
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim()
    )
    .filter(Boolean);
}

// The body is still stored as plain paragraphs (no schema change) — sources
// are just one more paragraph in that array, formatted as
// "Sources: [label](url) · [label](url)". This section only exists so the
// admin doesn't have to hand-type that markdown; it parses back out of the
// body on load and gets serialized back into it on save.
const SOURCES_LINE_RE = /^Sources:\s*/i;
const SOURCE_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function parseSourcesLine(line: string): InsightSourceRow[] {
  const rows: InsightSourceRow[] = [];
  let match: RegExpExecArray | null;
  SOURCE_LINK_RE.lastIndex = 0;
  while ((match = SOURCE_LINK_RE.exec(line))) rows.push({ label: match[1], url: match[2] });
  return rows;
}

function formatSourcesLine(sources: InsightSourceRow[]): string | null {
  const valid = sources.filter((s) => s.label.trim() && s.url.trim());
  if (valid.length === 0) return null;
  return "Sources: " + valid.map((s) => `[${s.label.trim()}](${s.url.trim()})`).join(" · ");
}

function blankDraft(defaultCategory: string): InsightDraft {
  return {
    slug: "", category: defaultCategory, title: "", excerpt: "", bodyHtml: "",
    published_at: new Date().toISOString().slice(0, 10), author: "Mintex Staffing Editorial", image_url: null,
    author_title: "", author_bio: "", author_photo_url: "", sources: [],
  };
}

function toDraft(post: InsightPost): InsightDraft {
  const sourcesLine = post.body.find((p) => SOURCES_LINE_RE.test(p));
  const otherParagraphs = post.body.filter((p) => p !== sourcesLine);
  const bodyHtml = post.body_html && post.body_html.trim() ? post.body_html : legacyBodyToHtml(otherParagraphs);
  return {
    id: post.id, slug: post.slug, category: post.category, title: post.title,
    excerpt: post.excerpt, bodyHtml, published_at: post.published_at,
    author: post.author, image_url: post.image_url,
    author_title: post.author_title ?? "", author_bio: post.author_bio ?? "", author_photo_url: post.author_photo_url ?? "",
    sources: sourcesLine ? parseSourcesLine(sourcesLine) : [],
  };
}

function InsightsTab({ password }: { password: string }) {
  const [posts, setPosts]       = useState<InsightPost[]>([]);
  const [categories, setCategories] = useState<InsightCategoryRow[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft]       = useState<InsightDraft | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [managingCategories, setManagingCategories] = useState(false);
  const [uploadingAuthorPhoto, setUploadingAuthorPhoto] = useState(false);

  const fetchData = () =>
    Promise.all([
      fetch("/api/admin/insights", { headers: { "x-admin-password": password } }).then((r) => r.json()),
      fetch("/api/insight-categories").then((r) => r.json()),
    ]).then(([postsData, categoriesData]) => {
      if (Array.isArray(postsData)) { setPosts(postsData); setLoadError(""); }
      else setLoadError(postsData.error ?? "Failed to load insights");
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLoaded(true);
    }).catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const labelFor = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;

  const openNew = () => { setSlugTouched(false); setSaveError(""); setDraft(blankDraft(categories[0]?.slug ?? "")); };
  const openEdit = (post: InsightPost) => { setSlugTouched(true); setSaveError(""); setDraft(toDraft(post)); };
  const closeEditor = () => setDraft(null);

  const updateDraft = (patch: Partial<InsightDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const onTitleChange = (title: string) => {
    updateDraft({ title, ...(slugTouched ? {} : { slug: slugify(title) }) });
  };

  const uploadImage = async (file: File) => {
    setUploadError("");
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    const res = await fetch("/api/insights/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (json.url) updateDraft({ image_url: json.url });
    else setUploadError(json.error ?? "Upload failed");
    setUploadingImage(false);
  };

  const uploadAuthorPhoto = async (file: File) => {
    setUploadingAuthorPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    const res = await fetch("/api/insights/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (json.url) updateDraft({ author_photo_url: json.url });
    setUploadingAuthorPhoto(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setSaveError("");

    const bodyParagraphs = htmlToPlainParagraphs(draft.bodyHtml);
    const sourcesLine = formatSourcesLine(draft.sources);
    if (sourcesLine) bodyParagraphs.push(sourcesLine);
    const payload = {
      slug: draft.slug.trim() || slugify(draft.title),
      category: draft.category,
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      body: bodyParagraphs,
      body_html: draft.bodyHtml,
      published_at: draft.published_at,
      author: draft.author.trim(),
      image_url: draft.image_url,
      author_title: draft.author_title.trim() || null,
      author_bio: draft.author_bio.trim() || null,
      author_photo_url: draft.author_photo_url.trim() || null,
    };

    const isEdit = Boolean(draft.id);
    const res = await fetch(isEdit ? `/api/admin/insights/${draft.id}` : "/api/admin/insights", {
      method: isEdit ? "PUT" : "POST",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setSaveError(json.error ?? "Failed to save"); setSaving(false); return; }

    setDraft(null);
    setSaving(false);
    fetchData();
  };

  const deletePost = async (post: InsightPost) => {
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    await fetch(`/api/admin/insights/${post.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading insights…
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Insights</h2>
          <p className="text-sm text-navy/60 mt-1">{posts.length} published articles on /insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setManagingCategories(true)}
            className="px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm font-medium border border-navy/10 transition-colors">
            Manage Categories
          </button>
          <button type="button" onClick={openNew}
            className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors">
            + New Insight
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load insights: {loadError}
          {loadError.includes("insights") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/007_insights.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {posts.length === 0 && !loadError ? (
        <div className="py-16 text-center text-navy/50 text-sm">No insights yet — add your first one above.</div>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream transition-colors">
              <div className="w-14 h-14 rounded-lg bg-cream flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => openEdit(post)}>
                {post.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
                  <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-navy/30 text-xs">—</div>
                )}
              </div>
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEdit(post)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-cream text-navy/70 text-[10px] font-semibold uppercase tracking-wide">
                    {labelFor(post.category)}
                  </span>
                  <p className="text-sm font-semibold text-navy truncate">{post.title}</p>
                </div>
                <p className="text-xs text-navy/50 mt-1">
                  /insights/post/{post.slug} · {post.author} · {new Date(post.published_at).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => openEdit(post)}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-mist text-navy/70 text-xs font-medium border border-navy/10 transition-colors flex-shrink-0">
                Edit
              </button>
              <button onClick={() => deletePost(post)}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {managingCategories && (
        <InsightCategoriesModal
          password={password}
          categories={categories}
          onClose={() => setManagingCategories(false)}
          onChange={(next) => setCategories(next)}
        />
      )}

      {draft && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
          onClick={(e) => e.target === e.currentTarget && closeEditor()}>
          <form onSubmit={save} className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="font-bold text-navy text-lg">{draft.id ? "Edit Insight" : "New Insight"}</h3>
              <button type="button" onClick={closeEditor} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Cover Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-lg bg-cream flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {draft.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
                      <img src={draft.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-navy/30 text-xs">No image</span>
                    )}
                  </div>
                  <label className="relative inline-flex items-center justify-center px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-xs font-medium border border-navy/10 cursor-pointer transition-colors">
                    {uploadingImage ? "Uploading…" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                        e.target.value = "";
                      }}
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </label>
                  {draft.image_url && (
                    <button type="button" onClick={() => updateDraft({ image_url: null })}
                      className="px-3 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 text-xs font-medium transition-colors">
                      Remove
                    </button>
                  )}
                </div>
                {uploadError && <p className="text-red-600 text-xs mt-1.5">{uploadError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Title</label>
                <input required value={draft.title} onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Slug</label>
                  <input required value={draft.slug}
                    onChange={(e) => { setSlugTouched(true); updateDraft({ slug: e.target.value }); }}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm font-mono focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Category</label>
                  {categories.length > 0 ? (
                    <select value={draft.category} onChange={(e) => updateDraft({ category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none">
                      {categories.map((c) => <option key={c.id} value={c.slug}>{c.label}</option>)}
                    </select>
                  ) : (
                    <p className="text-xs text-navy/50 mt-2">No categories yet — add one via &ldquo;Manage Categories&rdquo;.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Author</label>
                  <input required value={draft.author} onChange={(e) => updateDraft({ author: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Published Date</label>
                  <input required type="date" value={draft.published_at} onChange={(e) => updateDraft({ published_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
              </div>

              <div className="rounded-lg border border-navy/10 p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Author bio (optional — shows an "About the author" card on the post)</p>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Author Title</label>
                  <input value={draft.author_title} onChange={(e) => updateDraft({ author_title: e.target.value })}
                    placeholder="e.g. Senior Recruiter"
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Author Bio</label>
                  <textarea rows={2} value={draft.author_bio} onChange={(e) => updateDraft({ author_bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Author Photo</label>
                  <div className="flex items-center gap-2">
                    <input value={draft.author_photo_url} onChange={(e) => updateDraft({ author_photo_url: e.target.value })}
                      placeholder="Photo URL, or upload below"
                      className="flex-1 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                    <label className="relative inline-flex items-center justify-center px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-xs font-medium border border-navy/10 cursor-pointer transition-colors whitespace-nowrap">
                      {uploadingAuthorPhoto ? "Uploading…" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingAuthorPhoto}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadAuthorPhoto(file);
                          e.target.value = "";
                        }}
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Excerpt</label>
                <textarea required rows={2} value={draft.excerpt} onChange={(e) => updateDraft({ excerpt: e.target.value })}
                  placeholder="Shown on the /insights listing card"
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Body</label>
                <p className="text-[11px] text-navy/50 mb-1.5">
                  Select text and use the toolbar for headings, bold, links, lists, and CTA buttons.
                </p>
                <InsightBodyEditor value={draft.bodyHtml} onChange={(html) => updateDraft({ bodyHtml: html })} />
                {(() => {
                  const plainText = draft.bodyHtml.replace(/<[^>]+>/g, " ").trim();
                  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
                  const meetsTarget = wordCount >= 1500;
                  return (
                    <p className={`mt-1.5 text-[11px] font-medium ${meetsTarget ? "text-green-600" : "text-amber-600"}`}>
                      {wordCount.toLocaleString()} words {meetsTarget ? "✓" : "(recommended: 1,500+ for strong SEO value)"}
                    </p>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Sources</label>
                <p className="text-[11px] text-navy/50 mb-1.5">Shown as a linked &quot;Sources:&quot; line at the end of the article.</p>
                <div className="space-y-2">
                  {draft.sources.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Label, e.g. SHRM, The Real Cost of Recruitment (2022)"
                        value={s.label}
                        onChange={(e) =>
                          updateDraft({ sources: draft.sources.map((row, ri) => (ri === i ? { ...row, label: e.target.value } : row)) })
                        }
                        className="flex-1 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={s.url}
                        onChange={(e) =>
                          updateDraft({ sources: draft.sources.map((row, ri) => (ri === i ? { ...row, url: e.target.value } : row)) })
                        }
                        className="w-64 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateDraft({ sources: draft.sources.filter((_, ri) => ri !== i) })}
                        className="px-3 rounded-lg border border-navy/10 text-navy/50 hover:border-red-200 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => updateDraft({ sources: [...draft.sources, { label: "", url: "" }] })}
                  className="mt-2 px-3 py-1.5 rounded-full bg-white border border-navy/15 hover:bg-mist text-navy/70 text-xs font-semibold transition-colors"
                >
                  + Add source
                </button>
              </div>

              {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
            </div>

            <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-3 border-t border-navy/10">
              <button type="button" onClick={closeEditor}
                className="px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm font-medium border border-navy/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors disabled:opacity-50">
                {saving ? "Saving…" : draft.id ? "Save Changes" : "Create Insight"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Insight Categories management modal ──────────────────────────────────────
function InsightCategoriesModal({ password, categories, onClose, onChange }: {
  password: string; categories: InsightCategoryRow[];
  onClose: () => void; onChange: (next: InsightCategoryRow[]) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState("");
  const [renaming, setRenaming] = useState<Record<string, string>>({});

  const refresh = () => fetch("/api/insight-categories").then((r) => r.json()).then((data) => onChange(Array.isArray(data) ? data : []));

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    setAdding(true);
    setError("");
    const res = await fetch("/api/insight-categories", {
      method: "POST",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Failed to add category"); setAdding(false); return; }
    setNewLabel("");
    setAdding(false);
    refresh();
  };

  const renameCategory = async (cat: InsightCategoryRow) => {
    const label = (renaming[cat.id] ?? "").trim();
    if (!label || label === cat.label) return;
    await fetch(`/api/insight-categories/${cat.id}`, {
      method: "PUT",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    setRenaming((prev) => { const next = { ...prev }; delete next[cat.id]; return next; });
    refresh();
  };

  const deleteCategory = async (cat: InsightCategoryRow) => {
    if (!confirm(`Delete category "${cat.label}"? Insights already using it will keep their value, but it will no longer appear as a filter or choice.`)) return;
    onChange(categories.filter((c) => c.id !== cat.id));
    await fetch(`/api/insight-categories/${cat.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
  };

  return (
    <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-navy text-lg">Insight Categories</h3>
          <button onClick={onClose} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-3">
          {categories.length === 0 && <p className="text-sm text-navy/50">No categories yet — add one below.</p>}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <input
                value={renaming[cat.id] ?? cat.label}
                onChange={(e) => setRenaming((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                onBlur={() => renameCategory(cat)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); renameCategory(cat); } }}
                className="flex-1 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none"
              />
              <span className="text-[10px] font-mono text-navy/40 whitespace-nowrap">{cat.slug}</span>
              <button type="button" onClick={() => deleteCategory(cat)}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                &times;
              </button>
            </div>
          ))}

          <form onSubmit={addCategory} className="flex items-center gap-2 pt-2 border-t border-navy/10">
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New category name"
              className="flex-1 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
            <button type="submit" disabled={adding || !newLabel.trim()}
              className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors disabled:opacity-50">
              Add
            </button>
          </form>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Case Studies Tab ──────────────────────────────────────────────────────────
const CASE_STUDY_TYPES: { value: CaseStudyType; label: string }[] = [
  { value: "client", label: "Client Testimonial" },
  { value: "candidate", label: "Candidate Testimonial" },
  { value: "other", label: "Other Case Study" },
];

type CaseStudyDraft = {
  id?: string; type: CaseStudyType; title: string; quote: string;
  author: string; role: string; video_url: string; thumbnail_url: string;
};

const BLANK_CASE_STUDY: CaseStudyDraft = {
  type: "client", title: "", quote: "", author: "", role: "", video_url: "", thumbnail_url: "",
};

function toCaseStudyDraft(cs: CaseStudy): CaseStudyDraft {
  return {
    id: cs.id, type: cs.type, title: cs.title, quote: cs.quote, author: cs.author,
    role: cs.role ?? "", video_url: cs.video_url ?? "", thumbnail_url: cs.thumbnail_url ?? "",
  };
}

function CaseStudiesTab({ password }: { password: string }) {
  const [items, setItems]       = useState<CaseStudy[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft]       = useState<CaseStudyDraft | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");
  // Separate from saveError: that state only renders inside the edit modal
  // (see the JSX below), but deleteItem is invoked from the list view where
  // the modal isn't open — a delete failure needs its own visible spot.
  const [deleteError, setDeleteError] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchData = () =>
    fetch("/api/admin/case-studies", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) { setItems(data); setLoadError(""); }
        else setLoadError(data.error ?? "Failed to load case studies");
        setLoaded(true);
      })
      .catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setSaveError(""); setDraft({ ...BLANK_CASE_STUDY }); };
  const openEdit = (cs: CaseStudy) => { setSaveError(""); setDraft(toCaseStudyDraft(cs)); };
  const closeEditor = () => setDraft(null);
  const updateDraft = (patch: Partial<CaseStudyDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const uploadVideo = async (file: File) => {
    setUploadError("");
    setUploadingVideo(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    const res = await fetch("/api/case-studies/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (json.url) updateDraft({ video_url: json.url });
    else setUploadError(json.error ?? "Upload failed");
    setUploadingVideo(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setSaveError("");

    const payload = {
      type: draft.type,
      title: draft.title.trim(),
      quote: draft.quote.trim(),
      author: draft.author.trim(),
      role: draft.role.trim() || null,
      video_url: draft.video_url.trim() || null,
      thumbnail_url: draft.thumbnail_url.trim() || null,
    };

    const isEdit = Boolean(draft.id);
    const res = await fetch(isEdit ? `/api/admin/case-studies/${draft.id}` : "/api/admin/case-studies", {
      method: isEdit ? "PUT" : "POST",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setSaveError(json.error ?? "Failed to save"); setSaving(false); return; }

    setDraft(null);
    setSaving(false);
    fetchData();
  };

  const deleteItem = async (cs: CaseStudy) => {
    if (!confirm(`Delete "${cs.title}"? This can't be undone.`)) return;
    setDeleteError("");
    const res = await fetch(`/api/admin/case-studies/${cs.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setDeleteError(json.error ?? "Failed to delete — it's still on the live site.");
      return;
    }
    // Re-fetch from the server instead of trusting the optimistic removal —
    // this is the source of the actual bug: the previous version removed the
    // item from the UI unconditionally, before/without checking whether the
    // DELETE request even succeeded, so a failed delete looked like it worked
    // in the admin panel while the row (and therefore the live /case-studies
    // page) was untouched.
    fetchData();
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading case studies…
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Case Studies</h2>
          <p className="text-sm text-navy/60 mt-1">{items.length} testimonials shown on /case-studies</p>
        </div>
        <button type="button" onClick={openNew}
          className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors">
          + New Case Study
        </button>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load case studies: {loadError}
          {loadError.includes("case_studies") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/009_case_studies.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {deleteError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {deleteError}
        </div>
      )}

      {CASE_STUDY_TYPES.map((t) => {
        const group = items.filter((i) => i.type === t.value);
        return (
          <div key={t.value} className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-navy/50 mb-3">{t.label}s</h3>
            {group.length === 0 ? (
              <p className="text-sm text-navy/40">None yet.</p>
            ) : (
              <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
                {group.map((cs) => (
                  <div key={cs.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream transition-colors">
                    <div className="w-14 h-10 rounded-lg bg-cream flex-shrink-0 overflow-hidden cursor-pointer flex items-center justify-center" onClick={() => openEdit(cs)}>
                      {cs.video_url ? (
                        <span className="text-navy/40 text-xs">▶</span>
                      ) : (
                        <span className="text-navy/30 text-xs">—</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEdit(cs)}>
                      <p className="text-sm font-semibold text-navy truncate">{cs.title}</p>
                      <p className="text-xs text-navy/50 mt-0.5 truncate">
                        {cs.author}{cs.role ? ` · ${cs.role}` : ""}
                      </p>
                    </div>
                    <button onClick={() => openEdit(cs)}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-mist text-navy/70 text-xs font-medium border border-navy/10 transition-colors flex-shrink-0">
                      Edit
                    </button>
                    <button onClick={() => deleteItem(cs)}
                      className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {draft && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
          onClick={(e) => e.target === e.currentTarget && closeEditor()}>
          <form onSubmit={save} className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="font-bold text-navy text-lg">{draft.id ? "Edit Case Study" : "New Case Study"}</h3>
              <button type="button" onClick={closeEditor} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Type</label>
                <select value={draft.type} onChange={(e) => updateDraft({ type: e.target.value as CaseStudyType })}
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none">
                  {CASE_STUDY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Title</label>
                <input required value={draft.title} onChange={(e) => updateDraft({ title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Quote</label>
                <textarea required rows={3} value={draft.quote} onChange={(e) => updateDraft({ quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Author</label>
                  <input required value={draft.author} onChange={(e) => updateDraft({ author: e.target.value })}
                    placeholder="e.g. VP of Engineering"
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Role / Company</label>
                  <input value={draft.role} onChange={(e) => updateDraft({ role: e.target.value })}
                    placeholder="e.g. Series C SaaS Company"
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Testimonial Video (optional)</label>
                <div className="flex items-center gap-2">
                  <input value={draft.video_url} onChange={(e) => updateDraft({ video_url: e.target.value })}
                    placeholder="Video URL, or upload below"
                    className="flex-1 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                  <label className="relative inline-flex items-center justify-center px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-xs font-medium border border-navy/10 cursor-pointer transition-colors whitespace-nowrap">
                    {uploadingVideo ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept="video/*"
                      disabled={uploadingVideo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadVideo(file);
                        e.target.value = "";
                      }}
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </label>
                </div>
                {uploadError && <p className="text-red-600 text-xs mt-1.5">{uploadError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Thumbnail URL (optional)</label>
                <input value={draft.thumbnail_url} onChange={(e) => updateDraft({ thumbnail_url: e.target.value })}
                  placeholder="Leave blank to auto-use the YouTube thumbnail, if applicable"
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
            </div>

            <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-3 border-t border-navy/10">
              <button type="button" onClick={closeEditor}
                className="px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm font-medium border border-navy/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors disabled:opacity-50">
                {saving ? "Saving…" : draft.id ? "Save Changes" : "Create Case Study"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Team Members Tab ─────────────────────────────────────────────────────────
type TeamMemberDraft = {
  id?: string; name: string; title: string; bio: string; photo_url: string; linkedin_url: string;
};

const BLANK_TEAM_MEMBER: TeamMemberDraft = {
  name: "", title: "", bio: "", photo_url: "", linkedin_url: "",
};

function toTeamMemberDraft(tm: TeamMember): TeamMemberDraft {
  return {
    id: tm.id, name: tm.name, title: tm.title, bio: tm.bio ?? "",
    photo_url: tm.photo_url ?? "", linkedin_url: tm.linkedin_url ?? "",
  };
}

function TeamMembersTab({ password }: { password: string }) {
  const [items, setItems]       = useState<TeamMember[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft]       = useState<TeamMemberDraft | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchData = () =>
    fetch("/api/admin/team-members", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) { setItems(data); setLoadError(""); }
        else setLoadError(data.error ?? "Failed to load team members");
        setLoaded(true);
      })
      .catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setSaveError(""); setDraft({ ...BLANK_TEAM_MEMBER }); };
  const openEdit = (tm: TeamMember) => { setSaveError(""); setDraft(toTeamMemberDraft(tm)); };
  const closeEditor = () => setDraft(null);
  const updateDraft = (patch: Partial<TeamMemberDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const uploadPhoto = async (file: File) => {
    setUploadError("");
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    const res = await fetch("/api/team-members/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!json.url) { setUploadError(json.error ?? "Upload failed"); setUploadingPhoto(false); return; }

    updateDraft({ photo_url: json.url });

    // Save the photo to this person's profile immediately — don't wait for a
    // separate "Save Changes" click. Editing an existing person only (a brand
    // new, not-yet-created person has no id to save to yet; their photo is
    // included when they hit "Create Team Member" below).
    if (draft?.id) {
      const saveRes = await fetch(`/api/admin/team-members/${draft.id}`, {
        method: "PUT",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: json.url }),
      });
      if (!saveRes.ok) {
        const saveJson = await saveRes.json().catch(() => ({}));
        setUploadError(saveJson.error ?? "Photo uploaded but couldn't be saved to this profile — try clicking Save Changes.");
      } else {
        fetchData();
      }
    }

    setUploadingPhoto(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setSaveError("");

    const payload = {
      name: draft.name.trim(),
      title: draft.title.trim(),
      bio: draft.bio.trim() || null,
      photo_url: draft.photo_url.trim() || null,
      linkedin_url: draft.linkedin_url.trim() || null,
    };

    const isEdit = Boolean(draft.id);
    const res = await fetch(isEdit ? `/api/admin/team-members/${draft.id}` : "/api/admin/team-members", {
      method: isEdit ? "PUT" : "POST",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setSaveError(json.error ?? "Failed to save"); setSaving(false); return; }

    setDraft(null);
    setSaving(false);
    fetchData();
  };

  const deleteItem = async (tm: TeamMember) => {
    if (!confirm(`Delete "${tm.name}"? This can't be undone.`)) return;
    setDeleteError("");
    const res = await fetch(`/api/admin/team-members/${tm.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setDeleteError(json.error ?? "Failed to delete — it's still on the live site.");
      return;
    }
    fetchData();
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading team members…
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Team Members</h2>
          <p className="text-sm text-navy/60 mt-1">{items.length} people shown on /about</p>
        </div>
        <button type="button" onClick={openNew}
          className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors">
          + New Team Member
        </button>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load team members: {loadError}
          {loadError.includes("team_members") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/016_team_members.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {deleteError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {deleteError}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-navy/40">None yet.</p>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
          {items.map((tm) => (
            <div key={tm.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream transition-colors">
              <div className="w-10 h-10 rounded-full bg-cream flex-shrink-0 overflow-hidden cursor-pointer flex items-center justify-center" onClick={() => openEdit(tm)}>
                {tm.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- small admin-panel thumbnail, not worth next/image here
                  <img src={tm.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-navy/30 text-xs">—</span>
                )}
              </div>
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEdit(tm)}>
                <p className="text-sm font-semibold text-navy truncate">{tm.name}</p>
                <p className="text-xs text-navy/50 mt-0.5 truncate">{tm.title}</p>
              </div>
              <button onClick={() => openEdit(tm)}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-mist text-navy/70 text-xs font-medium border border-navy/10 transition-colors flex-shrink-0">
                Edit
              </button>
              <button onClick={() => deleteItem(tm)}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
          onClick={(e) => e.target === e.currentTarget && closeEditor()}>
          <form onSubmit={save} className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="font-bold text-navy text-lg">{draft.id ? "Edit Team Member" : "New Team Member"}</h3>
              <button type="button" onClick={closeEditor} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Name</label>
                  <input required value={draft.name} onChange={(e) => updateDraft({ name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Title</label>
                  <input required value={draft.title} onChange={(e) => updateDraft({ title: e.target.value })}
                    placeholder="e.g. Founder & CEO"
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Bio (optional)</label>
                <textarea rows={3} value={draft.bio} onChange={(e) => updateDraft({ bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Photo (optional)</label>
                <div className="flex items-center gap-2">
                  <input value={draft.photo_url} onChange={(e) => updateDraft({ photo_url: e.target.value })}
                    placeholder="Photo URL, or upload below"
                    className="flex-1 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                  <label className="relative inline-flex items-center justify-center px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-xs font-medium border border-navy/10 cursor-pointer transition-colors whitespace-nowrap">
                    {uploadingPhoto ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingPhoto}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPhoto(file);
                        e.target.value = "";
                      }}
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </label>
                </div>
                {uploadError && <p className="text-red-600 text-xs mt-1.5">{uploadError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">LinkedIn URL (optional)</label>
                <input value={draft.linkedin_url} onChange={(e) => updateDraft({ linkedin_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
            </div>

            <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-3 border-t border-navy/10">
              <button type="button" onClick={closeEditor}
                className="px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm font-medium border border-navy/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors disabled:opacity-50">
                {saving ? "Saving…" : draft.id ? "Save Changes" : "Create Team Member"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Industries Tab ───────────────────────────────────────────────────────────
// Full CRUD for "Industries We Serve" — each row drives its own /industries/[slug]
// page plus the homepage section, main nav, footer, and the AI interview tool.
type IndustryDraft = {
  id?: string;
  slug: string;
  name: string;
  heroTitle: string;
  seoSubheading: string;
  intro: string;
  sectorInsightTitle: string;
  sectorInsightBody: string;
  workStyle: string;
  jobKeywordsText: string;
  faqs: { question: string; answer: string }[];
  stats: { label: string; value: string }[];
  typicalRoles: string;
  vettingProcess: string;
  marketContext: string;
  engagementModels: string;
};

const BLANK_INDUSTRY: IndustryDraft = {
  slug: "", name: "", heroTitle: "", seoSubheading: "", intro: "",
  sectorInsightTitle: "", sectorInsightBody: "", workStyle: "",
  jobKeywordsText: "", faqs: [], stats: [], typicalRoles: "", vettingProcess: "",
  marketContext: "", engagementModels: "",
};

function toIndustryDraft(ind: Industry): IndustryDraft {
  return {
    id: ind.id, slug: ind.slug, name: ind.name, heroTitle: ind.heroTitle,
    seoSubheading: ind.seoSubheading, intro: ind.intro,
    sectorInsightTitle: ind.sectorInsight.title, sectorInsightBody: ind.sectorInsight.body,
    workStyle: ind.workStyle, jobKeywordsText: ind.jobKeywords.join(", "),
    faqs: ind.faqs.length > 0 ? ind.faqs : [],
    stats: ind.stats.length > 0 ? ind.stats : [],
    typicalRoles: ind.typicalRoles, vettingProcess: ind.vettingProcess,
    marketContext: ind.marketContext, engagementModels: ind.engagementModels,
  };
}

function slugPreview(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function IndustriesTab({ password }: { password: string }) {
  const [items, setItems]         = useState<Industry[]>([]);
  const [loaded, setLoaded]       = useState(false);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft]         = useState<IndustryDraft | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchData = () =>
    fetch("/api/admin/industries", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) { setItems(data); setLoadError(""); }
        else setLoadError(data.error ?? "Failed to load industries");
        setLoaded(true);
      })
      .catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setSaveError(""); setDraft({ ...BLANK_INDUSTRY }); };
  const openEdit = (ind: Industry) => { setSaveError(""); setDraft(toIndustryDraft(ind)); };
  const closeEditor = () => setDraft(null);
  const updateDraft = (patch: Partial<IndustryDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const addFaq = () => updateDraft({ faqs: [...(draft?.faqs ?? []), { question: "", answer: "" }] });
  const removeFaq = (index: number) => updateDraft({ faqs: (draft?.faqs ?? []).filter((_, i) => i !== index) });
  const updateFaq = (index: number, patch: Partial<{ question: string; answer: string }>) =>
    updateDraft({ faqs: (draft?.faqs ?? []).map((f, i) => (i === index ? { ...f, ...patch } : f)) });

  const addStat = () => updateDraft({ stats: [...(draft?.stats ?? []), { label: "", value: "" }] });
  const removeStat = (index: number) => updateDraft({ stats: (draft?.stats ?? []).filter((_, i) => i !== index) });
  const updateStat = (index: number, patch: Partial<{ label: string; value: string }>) =>
    updateDraft({ stats: (draft?.stats ?? []).map((s, i) => (i === index ? { ...s, ...patch } : s)) });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setSaveError("");

    const payload = {
      slug: draft.slug.trim(),
      name: draft.name.trim(),
      heroTitle: draft.heroTitle.trim(),
      seoSubheading: draft.seoSubheading.trim(),
      intro: draft.intro.trim(),
      sectorInsightTitle: draft.sectorInsightTitle.trim(),
      sectorInsightBody: draft.sectorInsightBody.trim(),
      workStyle: draft.workStyle.trim(),
      jobKeywords: draft.jobKeywordsText.split(",").map((k) => k.trim()).filter(Boolean),
      faqs: draft.faqs.filter((f) => f.question.trim() && f.answer.trim()),
      stats: draft.stats.filter((s) => s.label.trim() && s.value.trim()),
      typicalRoles: draft.typicalRoles.trim(),
      vettingProcess: draft.vettingProcess.trim(),
      marketContext: draft.marketContext.trim(),
      engagementModels: draft.engagementModels.trim(),
    };

    const isEdit = Boolean(draft.id);
    const res = await fetch(isEdit ? `/api/admin/industries/${draft.id}` : "/api/admin/industries", {
      method: isEdit ? "PUT" : "POST",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setSaveError(json.error ?? "Failed to save"); setSaving(false); return; }

    setDraft(null);
    setSaving(false);
    fetchData();
  };

  const deleteItem = async (ind: Industry) => {
    if (!confirm(`Delete "${ind.name}"? This removes its page and can't be undone.`)) return;
    setDeleteError("");
    const res = await fetch(`/api/admin/industries/${ind.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setDeleteError(json.error ?? "Failed to delete — it's still on the live site.");
      return;
    }
    fetchData();
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading industries…
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Industries We Serve</h2>
          <p className="text-sm text-navy/60 mt-1">{items.length} industries — each gets its own page, nav entry, and footer link.</p>
        </div>
        <button type="button" onClick={openNew}
          className="px-4 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors">
          + New Industry
        </button>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load industries: {loadError}
          {loadError.includes("industries") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/018_industries.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {deleteError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {deleteError}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-navy/40">None yet.</p>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
          {items.map((ind) => (
            <div key={ind.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream transition-colors">
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEdit(ind)}>
                <p className="text-sm font-semibold text-navy truncate">{ind.name}</p>
                <p className="text-xs text-navy/50 mt-0.5 truncate">/industries/{ind.slug}</p>
              </div>
              <button onClick={() => openEdit(ind)}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-mist text-navy/70 text-xs font-medium border border-navy/10 transition-colors flex-shrink-0">
                Edit
              </button>
              <button onClick={() => deleteItem(ind)}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
          onClick={(e) => e.target === e.currentTarget && closeEditor()}>
          <form onSubmit={save} className="bg-white rounded-2xl border border-navy/10 shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between p-5 border-b border-navy/10 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="font-bold text-navy text-lg">{draft.id ? "Edit Industry" : "New Industry"}</h3>
              <button type="button" onClick={closeEditor} className="text-navy/50 hover:text-navy text-xl leading-none">&times;</button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Industry Name</label>
                <input required value={draft.name} onChange={(e) => updateDraft({ name: e.target.value })}
                  placeholder="e.g. Legal Staffing"
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                <p className="text-xs text-navy/40 mt-1">
                  Page URL: /industries/{draft.id ? draft.slug : (slugPreview(draft.name) || "…")}
                  {draft.id && " (can't change once created)"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Hero Title</label>
                  <input required value={draft.heroTitle} onChange={(e) => updateDraft({ heroTitle: e.target.value })}
                    placeholder="e.g. Hire Top Legal Talent"
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">SEO Subheading</label>
                  <input required value={draft.seoSubheading} onChange={(e) => updateDraft({ seoSubheading: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Intro paragraph</label>
                <textarea required rows={3} value={draft.intro} onChange={(e) => updateDraft({ intro: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Sector Insight — Title</label>
                  <input required value={draft.sectorInsightTitle} onChange={(e) => updateDraft({ sectorInsightTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Work Style</label>
                  <input required value={draft.workStyle} onChange={(e) => updateDraft({ workStyle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Sector Insight — Body</label>
                <textarea required rows={2} value={draft.sectorInsightBody} onChange={(e) => updateDraft({ sectorInsightBody: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1">Job-matching keywords (comma separated)</label>
                <textarea rows={2} value={draft.jobKeywordsText} onChange={(e) => updateDraft({ jobKeywordsText: e.target.value })}
                  placeholder="e.g. paralegal, legal assistant, attorney"
                  className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                <p className="text-xs text-navy/40 mt-1">Matched against each job&apos;s title/skills to decide which open roles show on this industry&apos;s page.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Typical Roles We Place</label>
                  <textarea required rows={3} value={draft.typicalRoles} onChange={(e) => updateDraft({ typicalRoles: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">How We Vet Candidates</label>
                  <textarea required rows={3} value={draft.vettingProcess} onChange={(e) => updateDraft({ vettingProcess: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">The Market Right Now</label>
                  <textarea required rows={3} value={draft.marketContext} onChange={(e) => updateDraft({ marketContext: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1">Flexible Engagement Models</label>
                  <textarea required rows={3} value={draft.engagementModels} onChange={(e) => updateDraft({ engagementModels: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-navy/60">Stats (shown as cards)</label>
                  <button type="button" onClick={addStat} className="text-xs text-steel hover:text-navy font-medium transition-colors">
                    + Add Stat
                  </button>
                </div>
                <p className="text-xs text-navy/40 mb-2">The first stat here is the one shown on the homepage card; all of them show on this industry&apos;s own page.</p>
                <div className="space-y-2">
                  {draft.stats.map((stat, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input value={stat.label} onChange={(e) => updateStat(i, { label: e.target.value })}
                          placeholder="Label (e.g. IT placements made)"
                          className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                      </div>
                      <div className="col-span-5">
                        <input value={stat.value} onChange={(e) => updateStat(i, { value: e.target.value })}
                          placeholder="Value (e.g. 1,200+)"
                          className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => removeStat(i)}
                          className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors">
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                  {draft.stats.length === 0 && <p className="text-sm text-navy/50">No stats yet — add one above.</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-navy/60">FAQs</label>
                  <button type="button" onClick={addFaq} className="text-xs text-steel hover:text-navy font-medium transition-colors">
                    + Add FAQ
                  </button>
                </div>
                <div className="space-y-3">
                  {draft.faqs.map((faq, i) => (
                    <div key={i} className="bg-cream rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input value={faq.question} onChange={(e) => updateFaq(i, { question: e.target.value })}
                          placeholder="Question"
                          className="flex-1 px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                        <button type="button" onClick={() => removeFaq(i)}
                          className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center text-sm transition-colors flex-shrink-0">
                          &times;
                        </button>
                      </div>
                      <textarea rows={2} value={faq.answer} onChange={(e) => updateFaq(i, { answer: e.target.value })}
                        placeholder="Answer"
                        className="w-full px-3 py-2 rounded-lg bg-white text-navy border border-navy/10 text-sm focus:border-steel focus:outline-none" />
                    </div>
                  ))}
                  {draft.faqs.length === 0 && <p className="text-sm text-navy/50">No FAQs yet — add one above.</p>}
                </div>
              </div>

              {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
            </div>

            <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-3 border-t border-navy/10">
              <button type="button" onClick={closeEditor}
                className="px-4 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm font-medium border border-navy/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-full bg-white border border-navy hover:bg-mist text-navy text-sm font-semibold transition-colors disabled:opacity-50">
                {saving ? "Saving…" : draft.id ? "Save Changes" : "Create Industry"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Curation Tab ───────────────────────────────────────────────────────────
// Turns the vote data collected on every generated interview kit into
// something a recruiter actually looks at (see implementation-notes.md §7):
// well-liked questions (5+ upvotes, 85%+ positive) surface here as
// candidates worth reusing/promoting; suppressed ones (3+ downvotes, 60%+
// negative) show what's already being filtered out of live kits. The
// "reviewed" checkbox is just the recruiter's own tracking — it doesn't
// change indexing or the kit itself.
type QuestionFeedbackRow = {
  hash: string;
  text: string;
  role_slug: string | null;
  up: number;
  down: number;
  down_reasons: Record<string, number>;
  reviewed: boolean;
  status: "suppressed" | "promotion_candidate" | "neutral";
};

const CURATION_STATUS_STYLES: Record<string, string> = {
  promotion_candidate: "bg-green-50 text-green-700 border-green-200",
  suppressed: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-mist text-navy/50 border-navy/10",
};
const CURATION_STATUS_LABELS: Record<string, string> = {
  promotion_candidate: "Well-liked",
  suppressed: "Suppressed",
  neutral: "Neutral",
};

function CurationTab({ password }: { password: string }) {
  const [rows, setRows] = useState<QuestionFeedbackRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"promotion_candidate" | "suppressed" | "all">("promotion_candidate");

  const fetchData = () =>
    fetch("/api/admin/question-curation", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) { setRows(data); setLoadError(""); }
        else setLoadError(data.error ?? "Failed to load question feedback");
        setLoaded(true);
      })
      .catch(() => { setLoadError("Could not reach the server."); setLoaded(true); });

  useEffect(() => { fetchData(); }, []);

  const toggleReviewed = async (row: QuestionFeedbackRow) => {
    setRows((prev) => prev.map((r) => (r.hash === row.hash ? { ...r, reviewed: !r.reviewed } : r)));
    await fetch(`/api/admin/question-curation/${row.hash}`, {
      method: "PUT",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed: !row.reviewed }),
    });
  };

  if (!loaded) return (
    <div className="flex items-center gap-3 py-10 text-navy/60">
      <div className="w-5 h-5 border-2 border-navy/15 border-t-steel rounded-full animate-spin" />
      Loading question feedback…
    </div>
  );

  const candidateCount = rows.filter((r) => r.status === "promotion_candidate").length;
  const suppressedCount = rows.filter((r) => r.status === "suppressed").length;
  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-navy">Interview Question Feedback</h2>
          <p className="text-sm text-navy/60 mt-1">
            {rows.length} voted questions · {candidateCount} well-liked · {suppressedCount} suppressed
          </p>
        </div>
        <button type="button" onClick={fetchData}
          className="px-3 py-2 rounded-full bg-white hover:bg-mist text-navy/70 text-sm border border-navy/10 transition-colors">
          ↻ Refresh
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        {(["promotion_candidate", "suppressed", "all"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f ? "bg-navy text-white border-navy" : "bg-white text-navy/70 border-navy/10 hover:bg-mist"
            }`}>
            {f === "promotion_candidate" ? `Well-liked (${candidateCount})` : f === "suppressed" ? `Suppressed (${suppressedCount})` : `All (${rows.length})`}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Couldn&apos;t load question feedback: {loadError}
          {loadError.includes("question_feedback") && (
            <> — run <code className="px-1 bg-red-100 rounded">supabase/migrations/023_question_curation.sql</code> in your Supabase SQL editor, then refresh.</>
          )}
        </div>
      )}

      {filtered.length === 0 && !loadError ? (
        <div className="py-16 text-center text-navy/50 text-sm">
          {filter === "promotion_candidate"
            ? "No well-liked questions yet — they show up here once a question gets 5+ upvotes at 85%+ positive."
            : "Nothing here yet."}
        </div>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white divide-y divide-navy/10 overflow-hidden">
          {filtered.map((row) => (
            <div key={row.hash} className="flex items-start gap-4 px-5 py-4">
              <input
                type="checkbox"
                checked={row.reviewed}
                onChange={() => toggleReviewed(row)}
                className="mt-1 h-4 w-4 flex-shrink-0 rounded border-navy/20"
                title="Mark reviewed"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-navy">{row.text}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${CURATION_STATUS_STYLES[row.status]}`}>
                    {CURATION_STATUS_LABELS[row.status]}
                  </span>
                  <span className="text-xs text-navy/40">{row.up} up · {row.down} down</span>
                  {row.role_slug && <span className="text-xs text-navy/40 truncate">· {row.role_slug}</span>}
                  {row.reviewed && <span className="text-xs text-steel font-medium">· Reviewed</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

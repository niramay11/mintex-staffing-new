"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Job extends Record<string, any> {
    job_code: string; job_title: string; public_job_title: string;
    client: string; client_manager: string; end_client: string;
    client_bill_rate___salary: string; pay_rate___salary: string;
    job_start_date: string; job_end_date: string; job_status: string;
    job_type: string; remote_job: string; country: string; states: string;
    city: string; zip_code: string; location: string; experience: string;
    primary_skills: string; secondary_skills: string; number_of_positions: number;
    duration: string; priority: string; department: string; industry: string;
    degree: string; tax_terms: string; work_authorization: string;
    interview_mode: string; clearance: string; required_documents: string;
    required_hours_week: string; career_portal_published_date: string;
    Created: string; Modified: string; ceipal_ref__: string;
    job_description: string; public_job_description: string;
    additional_details: string; comments: string;
}

type ClientInfo = { id: string; name: string; company: string; permissions: Record<string, boolean> };

const STATUS_BADGE: Record<string, { badge: string; dot: string }> = {
    Active:    { badge: 'bg-green-100 text-green-800',   dot: 'bg-green-600' },
    Open:      { badge: 'bg-steel/10 text-steel',        dot: 'bg-steel' },
    'On Hold': { badge: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-500' },
    Closed:    { badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
    Filled:    { badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
};
const STATUS_BADGE_FALLBACK = { badge: 'bg-cream text-navy/70', dot: 'bg-navy/30' };

const TABLE_COLUMNS: { key: string; label: string }[] = [
    { key: "job_code",                      label: "Job Code" },
    { key: "job_title",                     label: "Job Title" },
    { key: "job_status",                    label: "Status" },
    { key: "job_type",                      label: "Type" },
    { key: "client",                        label: "Client" },
    { key: "city",                          label: "City" },
    { key: "states",                        label: "State" },
    { key: "remote_job",                    label: "Remote" },
    { key: "experience",                    label: "Experience" },
    { key: "primary_skills",               label: "Skills" },
    { key: "number_of_positions",           label: "Positions" },
    { key: "job_start_date",               label: "Start" },
];

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onLogin, siteImages }: { onLogin: (client: ClientInfo) => void; siteImages: Record<string, string> }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setLoading(true);
        const res = await fetch("/api/portal/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) { setError(data.error ?? "Login failed"); return; }
        // Fetch client info after login
        const meRes = await fetch("/api/portal/me");
        if (meRes.ok) onLogin(await meRes.json());
    };

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            {/* Navbar */}
            <header className={`fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-navy/10 transition-shadow duration-300 ${scrolled ? 'shadow-[0_4px_20px_rgba(0,48,96,0.08)]' : ''}`}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[60px]">
                    <Link href="/" className="flex items-center">
                        <Image src={siteImages["client-portal:header-logo"]} alt="Mintex Staffing" width={148} height={20} priority className="h-5 w-auto" />
                    </Link>
                    <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold text-navy">
                        Client Portal
                    </span>
                </div>
            </header>

            {/* Login card */}
            <div className="flex-1 flex items-center justify-center px-4 relative z-10 pt-20">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-navy/10 bg-white px-3 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-tan" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy/60">Client Portal</span>
                        </div>
                        <h1 className="font-black text-3xl text-navy">Sign In</h1>
                        <p className="text-sm mt-2 text-navy/60">Access your job postings &amp; candidates</p>
                    </div>

                    <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-[0_8px_30px_rgba(0,48,96,0.08)]">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-navy/50">Username</label>
                                <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                                    placeholder="your_username" autoComplete="username"
                                    className="w-full rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy transition-colors focus:border-steel focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-navy/50">Password</label>
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" autoComplete="current-password"
                                    className="w-full rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy transition-colors focus:border-steel focus:outline-none"
                                />
                            </div>

                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full rounded-full bg-tan px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-tan-light disabled:opacity-50">
                                {loading ? "Signing in…" : "Sign In"}
                            </button>
                        </form>
                        <p className="text-center text-xs mt-6 text-navy/40">
                            Credentials provided by your Mintex account manager
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// ─── Pipeline helpers ─────────────────────────────────────────────────────────
const PIPELINE_STAGES = ['Pipeline','Submission','Client Submission','Interview','Confirmation','Placement','Not Joined'] as const;

function mapStageIdx(status: string): number {
    const s = (status ?? '').toLowerCase();
    if (s.includes('not joined'))                                        return 6;
    if (s.includes('placement') || s.includes('placed'))                return 5;
    if (s.includes('offer accepted'))                                    return 5;
    if (s.includes('confirmation') || s.includes('confirmed'))          return 4;
    if (s.includes('interview'))                                         return 3;
    if (s.includes('client submission') || s.includes('waiting'))       return 2;
    if (s.includes('submission') || s.includes('submitted') || s.includes('approved')) return 1;
    return 0;
}

type Submission = { id: string; submission_id: number; submission_status: string; pipeline_status: string; source: string; submitted_on: string; employment_type?: string; tax_term?: string; pay_rate?: string | null; applicant_id?: number; };

// ─── Job Detail Modal ─────────────────────────────────────────────────────────
function JobDetailModal({ job, permissions, onClose }: { job: Job; permissions: Record<string, boolean>; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'snapshot' | 'description' | 'skills' | 'submissions'>('snapshot');
    const [detail, setDetail]       = useState<Record<string, unknown> | null>(null);
    const [submissions, setSubs]    = useState<Submission[]>([]);
    const [subsLoading, setSL]      = useState(false);
    const [stageFilter, setStageFilter] = useState('all');

    useEffect(() => {
        const code = job.job_code;
        if (!code) return;
        // Fetch full job details
        fetch(`/api/portal/job-details?job_code=${encodeURIComponent(code)}`)
            .then(r => r.ok ? r.json() : null).then(d => setDetail(d));
        // Fetch submissions
        setSL(true);
        fetch(`/api/portal/job-submissions?job_code=${encodeURIComponent(code)}`)
            .then(r => r.ok ? r.json() : []).then(d => { setSubs(Array.isArray(d) ? d : []); setSL(false); })
            .catch(() => setSL(false));
    }, [job.job_code]);

    const desc   = String(detail?.requisition_description ?? detail?.public_job_desc ?? job.job_description ?? '');
    const skills = String(detail?.skills ?? job.primary_skills ?? '');
    const hasDesc   = !!desc && permissions.show_job_description !== false;
    const hasSkills = !!skills && permissions.show_required_skills !== false;

    const stageCounts = PIPELINE_STAGES.reduce<Record<string, number>>((acc, s) => {
        acc[s] = submissions.filter(sub => PIPELINE_STAGES[mapStageIdx(sub.submission_status || sub.pipeline_status)] === s).length;
        return acc;
    }, {});

    const filteredSubs = stageFilter === 'all'
        ? submissions
        : submissions.filter(sub => PIPELINE_STAGES[mapStageIdx(sub.submission_status || sub.pipeline_status)] === stageFilter);

    const s = STATUS_BADGE[job.job_status] ?? STATUS_BADGE_FALLBACK;
    const tabKeys = ['snapshot', ...(hasDesc ? ['description'] : []), ...(hasSkills ? ['skills'] : []), 'submissions'] as const;
    const tabLabels: Record<string, string> = { snapshot: 'Snapshot', description: 'Description', skills: 'Skills', submissions: `Submissions (${submissions.length})` };

    const fmt = (d: string) => { try { return new Date(d).toLocaleDateString('en-AU', { day:'2-digit', month:'short', year:'numeric' }); } catch { return d; } };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-6 px-4 bg-navy/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-4xl rounded-2xl overflow-hidden bg-white border border-navy/10 shadow-xl">

                {/* Header */}
                <div className="p-6 border-b border-navy/10">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-cream text-navy">
                                    {job.job_code}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{job.job_status}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-navy truncate">{job.job_title}</h2>
                            <p className="text-sm mt-1 text-navy/60">
                                {[job.city, job.states, job.country].filter(Boolean).join(', ')}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-2xl leading-none transition-colors text-navy/40 hover:text-navy">
                            &times;
                        </button>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-navy/10">
                        {[
                            { label: 'Positions',  value: job.number_of_positions },
                            { label: 'Type',       value: job.job_type },
                            { label: 'Remote',     value: job.remote_job || detail?.remote_opportunities },
                            { label: 'Industry',   value: job.industry  || detail?.industry },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5 text-navy/50">{label}</p>
                                <p className="text-sm font-semibold text-navy">{String(value || '—')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-navy/10 px-6 overflow-x-auto gap-1">
                    {tabKeys.map(key => (
                        <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
                            className={`px-4 py-3 text-sm transition-colors whitespace-nowrap relative -mb-px border-b-2 ${activeTab === key ? 'text-navy border-tan font-semibold' : 'text-navy/50 hover:text-navy border-transparent font-medium'}`}>
                            {tabLabels[key]}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="p-6 min-h-[260px]">

                    {/* Snapshot */}
                    {activeTab === 'snapshot' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Start Date',   val: job.job_start_date || detail?.job_start_date },
                                { label: 'End Date',     val: job.job_end_date   || detail?.job_end_date },
                                { label: 'Duration',     val: job.duration       || detail?.duration },
                                { label: 'Experience',   val: job.experience     || detail?.experience },
                                { label: 'Work Auth',    val: job.work_authorization || detail?.work_authorization },
                                { label: 'Tax Terms',    val: job.tax_terms      || detail?.tax_terms },
                                { label: 'Closing Date', val: detail?.closing_date },
                                ...(permissions.show_bill_rate ? [{ label: 'Bill Rate', val: job.client_bill_rate___salary }] : []),
                            ].filter(x => x.val).map(({ label, val }) => (
                                <div key={label} className="p-3 rounded-lg border border-navy/10 bg-cream/60">
                                    <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5 text-navy/50">{label}</p>
                                    <p className="text-sm text-navy/80">{String(val)}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {activeTab === 'description' && (
                        <div className="text-sm leading-relaxed max-h-[55vh] overflow-y-auto pr-2 text-navy/80"
                            dangerouslySetInnerHTML={{ __html: desc }} />
                    )}

                    {/* Skills */}
                    {activeTab === 'skills' && (
                        <div className="flex flex-wrap gap-2">
                            {skills.split(/,\s*/).filter(Boolean).map(sk => (
                                <span key={sk} className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy">
                                    {sk.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Submissions */}
                    {activeTab === 'submissions' && (
                        <div>
                            {subsLoading ? (
                                <div className="flex items-center justify-center gap-3 py-10 text-navy/50">
                                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-navy/15 border-t-steel" />
                                    <span className="text-xs tracking-widest uppercase">Loading submissions…</span>
                                </div>
                            ) : (
                                <>
                                    {/* Stage filter */}
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        <button onClick={() => setStageFilter('all')}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${stageFilter === 'all' ? 'border-navy bg-navy text-white' : 'border-navy/20 bg-white text-navy/70 hover:border-navy/40'}`}>
                                            All {submissions.length}
                                        </button>
                                        {PIPELINE_STAGES.map(stage => (stageCounts[stage] ?? 0) > 0 && (
                                            <button key={stage} onClick={() => setStageFilter(stage)}
                                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${stageFilter === stage ? 'border-navy bg-navy text-white' : 'border-navy/20 bg-white text-navy/70 hover:border-navy/40'}`}>
                                                {stage} {stageCounts[stage]}
                                            </button>
                                        ))}
                                    </div>

                                    {filteredSubs.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-sm text-navy/50">
                                                No submissions{stageFilter !== 'all' ? ` in "${stageFilter}"` : ''} yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="border-t border-navy/10">
                                            {filteredSubs.map((sub, i) => {
                                                const stageIdx    = mapStageIdx(sub.submission_status || sub.pipeline_status || '');
                                                const statusLabel = sub.submission_status || sub.pipeline_status || 'Unknown';
                                                const subOn = sub.submitted_on ? fmt(sub.submitted_on) : '';

                                                return (
                                                    <div key={sub.id ?? i} className="py-4 border-b border-navy/10">
                                                        {/* Row */}
                                                        <div className="flex items-start justify-between gap-3 mb-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-navy">
                                                                    {(sub as Record<string,unknown>).candidate_name
                                                                      ? String((sub as Record<string,unknown>).candidate_name)
                                                                      : `Submission #${sub.submission_id}`}
                                                                </p>
                                                                <p className="text-xs mt-0.5 text-navy/50">
                                                                    {sub.source ? `Source: ${sub.source}` : ''}
                                                                    {subOn ? ` · ${subOn}` : ''}
                                                                </p>
                                                            </div>
                                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${stageIdx >= 4 ? 'bg-steel/10 text-steel' : stageIdx >= 2 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                                {statusLabel}
                                                            </span>
                                                        </div>

                                                        {/* Pipeline dots */}
                                                        <div className="flex items-center w-full">
                                                            {PIPELINE_STAGES.map((stage, idx) => {
                                                                const done   = idx < stageIdx;
                                                                const active = idx === stageIdx;
                                                                // Line colors only up to (not including) active dot
                                                                const lineColored = idx < stageIdx;
                                                                return (
                                                                    <div key={stage} className="flex-1 flex flex-col items-center relative min-w-0">
                                                                        {idx < PIPELINE_STAGES.length - 1 && (
                                                                            <div className={`absolute top-[7px] left-1/2 w-full h-0.5 z-0 ${lineColored ? 'bg-steel' : 'bg-navy/10'}`} />
                                                                        )}
                                                                        {/* Dot with ✓ for completed */}
                                                                        <div className={`relative z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${active ? 'bg-navy border-navy shadow-sm' : done ? 'bg-steel border-steel' : 'bg-white border-navy/20'}`}>
                                                                            {done && (
                                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth={3} viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <p className={`text-[9px] mt-1 text-center truncate w-full px-0.5 ${active ? 'text-navy font-semibold' : done ? 'text-steel' : 'text-navy/40'}`}>
                                                                            {stage.split(' ')[0]}
                                                                        </p>
                                                                        {active && subOn && <p className="text-[8px] text-center truncate w-full text-navy/60">{subOn}</p>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Meta */}
                                                        {!!(sub.employment_type || sub.tax_term || (permissions.show_pay_rate && sub.pay_rate)) && (
                                                            <div className="flex flex-wrap gap-4 mt-2">
                                                                {sub.employment_type && <span className="text-xs text-navy/50">Type: <span className="text-navy/80">{sub.employment_type}</span></span>}
                                                                {sub.tax_term && <span className="text-xs text-navy/50">Tax: <span className="text-navy/80">{sub.tax_term}</span></span>}
                                                                {permissions.show_pay_rate && sub.pay_rate && <span className="text-xs text-navy/50">Pay: <span className="font-medium text-steel">{sub.pay_rate}</span></span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 flex justify-end border-t border-navy/10">
                    <button onClick={onClose} className="mt-4 rounded-full border border-navy/10 bg-white px-5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-mist">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Submissions Modal ────────────────────────────────────────────────────────
function SubmissionsModal({ onClose, permissions, onCountReady, jobCodes, initialData }: { onClose: () => void; permissions: Record<string, boolean>; onCountReady?: (n: number) => void; jobCodes?: string; initialData?: Record<string, unknown>[] }) {
    const [submissions, setSubmissions] = useState<Record<string, unknown>[]>(initialData ?? []);
    const [loading, setLoading]         = useState(!initialData);
    const [search, setSearch]           = useState('');
    const [stageFilter, setStageFilter] = useState('all');

    useEffect(() => {
        if (initialData) {
            onCountReady?.(initialData.length);
            return;
        }
        const url = jobCodes
            ? `/api/portal/submissions?job_codes=${encodeURIComponent(jobCodes)}`
            : '/api/portal/submissions';
        fetch(url)
            .then(r => r.ok ? r.json() : { results: [] })
            .then(d => {
                const list = Array.isArray(d.results) ? d.results : [];
                setSubmissions(list);
                onCountReady?.(list.length);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const fmt = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return d; } };

    const allStages = Array.from(new Set(submissions.map(s => String(s.submission_status || s.pipeline_status || 'Unknown')))).filter(Boolean);

    const filtered = submissions.filter(s => {
        const matchStage = stageFilter === 'all' || String(s.submission_status || s.pipeline_status || '') === stageFilter;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            String(s.candidate_name ?? '').toLowerCase().includes(q) ||
            String(s.job_title ?? '').toLowerCase().includes(q) ||
            String(s.job_code ?? '').toLowerCase().includes(q);
        return matchStage && matchSearch;
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-6 px-4 bg-navy/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-5xl rounded-2xl overflow-hidden bg-white border border-navy/10 shadow-xl">

                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-navy/10">
                    <div>
                        <h2 className="text-xl font-black text-navy">Total Submissions</h2>
                        <p className="text-xs mt-1 text-navy/50">All candidates submitted across your job postings</p>
                    </div>
                    <button onClick={onClose} className="text-2xl leading-none transition-colors text-navy/40 hover:text-navy">
                        &times;
                    </button>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 flex flex-wrap gap-3 border-b border-navy/10 bg-mist">
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search candidate, job title, code…"
                        className="flex-1 min-w-[200px] rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-steel focus:outline-none" />
                    <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
                        className="rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-steel focus:outline-none cursor-pointer">
                        <option value="all">All Stages</option>
                        {allStages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="rounded-full bg-cream px-3 py-2 text-xs font-medium text-navy">
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-16">
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-navy/15 border-t-steel" />
                            <span className="text-xs uppercase tracking-widest text-navy/50">Loading submissions…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-sm text-navy/50">No submissions found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((sub, i) => {
                                const status = String(sub.submission_status || sub.pipeline_status || 'Unknown');
                                const stageIdx = mapStageIdx(status);
                                const sl = status.toLowerCase();

                                // Status color based on actual status text
                                const isRejected   = sl.includes('reject') || sl.includes('declined') || sl.includes('not selected') || sl.includes('withdraw');
                                const isPlaced     = stageIdx >= 5 || sl.includes('placement') || sl.includes('placed') || sl.includes('hired');
                                const isInterview  = sl.includes('interview');
                                const isConfirmed  = sl.includes('confirm');
                                const isSubmitted  = sl.includes('submission') || sl.includes('submitted');
                                const isOnHold     = sl.includes('hold');

                                const statusBadge = isRejected
                                    ? 'bg-red-100 text-red-700'
                                    : isPlaced
                                    ? 'bg-purple-100 text-purple-700'
                                    : isConfirmed
                                    ? 'bg-green-100 text-green-800'
                                    : isInterview
                                    ? 'bg-amber-100 text-amber-800'
                                    : isSubmitted
                                    ? 'bg-steel/10 text-steel'
                                    : isOnHold
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-cream text-navy/70';

                                return (
                                    <div key={i} className={`p-4 rounded-lg border ${isRejected ? 'border-red-200 bg-red-50/60' : 'border-navy/10 bg-white'}`}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-navy truncate">
                                                    {sub.candidate_name ? String(sub.candidate_name) : `Submission #${sub.submission_id ?? i + 1}`}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cream text-navy">
                                                        {String(sub.job_code ?? '')}
                                                    </span>
                                                    <span className="text-xs text-navy/60">{String(sub.job_title ?? '')}</span>
                                                    {!!sub.job_city && <span className="text-xs text-navy/50">{String(sub.job_city)}{sub.job_state ? `, ${String(sub.job_state)}` : ''}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusBadge}`}>
                                                    {status}
                                                </span>
                                                {!!sub.submitted_on && <span className="text-[10px] text-navy/40">{fmt(String(sub.submitted_on))}</span>}
                                            </div>
                                        </div>
                                        {/* Pipeline */}
                                        <div className="flex items-center w-full mt-2">
                                            {PIPELINE_STAGES.map((stage, idx) => {
                                                const done = idx < stageIdx; const active = idx === stageIdx;
                                                return (
                                                    <div key={stage} className="flex-1 flex flex-col items-center relative min-w-0">
                                                        {idx < PIPELINE_STAGES.length - 1 && (
                                                            <div className={`absolute top-[7px] left-1/2 w-full h-0.5 z-0 ${idx < stageIdx ? 'bg-steel' : 'bg-navy/10'}`} />
                                                        )}
                                                        <div className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${active ? 'bg-navy border-navy shadow-sm' : done ? 'bg-steel border-steel' : 'bg-white border-navy/20'}`}>
                                                            {done && <svg className="w-2 h-2" fill="none" stroke="white" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <p className={`text-[8px] mt-0.5 text-center truncate w-full px-0.5 ${active ? 'text-navy font-semibold' : done ? 'text-steel' : 'text-navy/40'}`}>
                                                            {stage.split(' ')[0]}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Meta */}
                                        {!!(sub.employment_type || sub.tax_term || (permissions.show_pay_rate && sub.pay_rate)) && (
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                {!!sub.employment_type && <span className="text-xs text-navy/50">Type: <span className="text-navy/80">{String(sub.employment_type)}</span></span>}
                                                {!!(permissions.show_pay_rate && sub.pay_rate) && <span className="text-xs text-navy/50">Pay: <span className="font-medium text-steel">{String(sub.pay_rate)}</span></span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 pt-4 flex justify-end border-t border-navy/10">
                    <button onClick={onClose} className="rounded-full border border-navy/10 bg-white px-5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-mist">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Hired Modal ──────────────────────────────────────────────────────────────
function HiredModal({ onClose, permissions, onCountReady, jobCodes, initialData }: { onClose: () => void; permissions: Record<string, boolean>; onCountReady?: (n: number) => void; jobCodes?: string; initialData?: Record<string, unknown>[] }) {
    const filterHired = (all: Record<string, unknown>[]) => all.filter(s => {
        const st = String(s.submission_status || s.pipeline_status || '').toLowerCase();
        return st.includes('placement') || st.includes('placed') || st.includes('offer accepted')
            || mapStageIdx(String(s.submission_status || s.pipeline_status || '')) === 5;
    });

    const [placements, setPlacements] = useState<Record<string, unknown>[]>(initialData ? filterHired(initialData) : []);
    const [loading, setLoading]       = useState(!initialData);
    const [search, setSearch]         = useState('');

    useEffect(() => {
        if (initialData) {
            const hired = filterHired(initialData);
            onCountReady?.(hired.length);
            return;
        }
        const url = jobCodes
            ? `/api/portal/submissions?job_codes=${encodeURIComponent(jobCodes)}`
            : '/api/portal/submissions';
        fetch(url)
            .then(r => r.ok ? r.json() : { results: [] })
            .then(d => {
                const all: Record<string, unknown>[] = Array.isArray(d.results) ? d.results : [];
                const hired = filterHired(all);
                setPlacements(hired);
                onCountReady?.(hired.length);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const fmt = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return d; } };

    const filtered = placements.filter(p => {
        const q = search.toLowerCase();
        return !q ||
            String(p.candidate_name ?? '').toLowerCase().includes(q) ||
            String(p.job_title ?? '').toLowerCase().includes(q) ||
            String(p.job_code ?? '').toLowerCase().includes(q);
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-6 px-4 bg-navy/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-5xl rounded-2xl overflow-hidden bg-white border border-navy/10 shadow-xl">

                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-navy/10">
                    <div>
                        <h2 className="text-xl font-black text-navy">Total Hires</h2>
                        <p className="text-xs mt-1 text-navy/50">All candidates placed/hired for your account</p>
                    </div>
                    <button onClick={onClose} className="text-2xl leading-none transition-colors text-navy/40 hover:text-navy">
                        &times;
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 flex flex-wrap gap-3 border-b border-navy/10 bg-mist">
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search candidate or job…"
                        className="flex-1 min-w-[200px] rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-steel focus:outline-none" />
                    <span className="rounded-full bg-purple-100 px-3 py-2 text-xs font-medium text-purple-700">
                        {filtered.length} hired
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-16">
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-navy/15 border-t-steel" />
                            <span className="text-xs uppercase tracking-widest text-navy/50">Loading placements…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-sm text-navy/50">No hired candidates found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((p, i) => {
                                const candidateName = String(p.candidate_name ?? '') || `Candidate #${i + 1}`;
                                const jobTitle  = String(p.job_title ?? '—');
                                const jobCode   = String(p.job_code ?? '');
                                const submittedOn = String(p.submitted_on ?? '');
                                const location  = [String(p.job_city ?? ''), String(p.job_state ?? '')].filter(Boolean).join(', ');
                                const status    = String(p.submission_status || p.pipeline_status || 'Placed');
                                return (
                                    <div key={i} className="p-4 rounded-lg border border-navy/10 bg-white">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className="text-sm font-bold text-navy">{candidateName}</p>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                                        ✓ Hired
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                    {jobCode && <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cream text-navy">{jobCode}</span>}
                                                    <span className="text-xs text-navy/70">{jobTitle}</span>
                                                    {location && <span className="text-xs text-navy/50">{location}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">✓ {status}</span>
                                                {!!submittedOn && <span className="text-[10px] text-navy/40">{fmt(submittedOn)}</span>}
                                            </div>
                                        </div>
                                        {/* Extra details */}
                                        {!!(p.employment_type || (permissions.show_pay_rate && p.pay_rate)) && (
                                        <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-navy/10">
                                            {!!p.employment_type && <span className="text-xs text-navy/50">Type: <span className="text-navy/80">{String(p.employment_type)}</span></span>}
                                            {!!(permissions.show_pay_rate && p.pay_rate) && <span className="text-xs text-navy/50">Pay: <span className="font-medium text-steel">{String(p.pay_rate)}</span></span>}
                                        </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 pt-4 flex justify-end border-t border-navy/10">
                    <button onClick={onClose} className="rounded-full border border-navy/10 bg-white px-5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-mist">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Portal Dashboard ────────────────────────────────────────────────────
export default function PortalClient({
    siteImages,
    initialClient,
    initialJobs,
}: {
    siteImages: Record<string, string>;
    // undefined = not prefetched server-side (falls back to the old client-side
    // auth check); null = server checked, no session; object = server-verified
    // session, seeded straight into state so first paint already shows the dashboard.
    initialClient?: Record<string, unknown> | null;
    initialJobs?: Record<string, unknown>[];
}) {
    const [authChecked, setAuthChecked] = useState(initialClient !== undefined);
    const [client, setClient]           = useState<ClientInfo | null>((initialClient as ClientInfo | null) ?? null);
    const [jobs, setJobs]               = useState<Job[]>((initialJobs as Job[]) ?? []);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState<string | null>(null);
    // Same reasoning as JobBoard.tsx: right after a fresh deploy or any gap
    // in traffic, this can legitimately take up to ~40s — a bare spinner
    // that long reads as broken without a message explaining why.
    const [slowLoad, setSlowLoad]       = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [scrolled, setScrolled]       = useState(false);
    const [syncing, setSyncing]          = useState(false);
    const [lastSynced, setLastSynced]    = useState<Date | null>(null);
    const [showSubmissions, setShowSubmissions] = useState(false);
    const [showHired, setShowHired]             = useState(false);
    const [submissionCount, setSubmissionCount] = useState<number | null>(null);
    const [hiredCount, setHiredCount]           = useState<number | null>(null);
    const [cachedSubmissions, setCachedSubmissions] = useState<Record<string, unknown>[] | null>(null);

    // Guards the one-time skip of the mount-time jobs fetch when the server
    // already prefetched them — a later logout/login in the same session must
    // still fetch fresh jobs, so this only suppresses the very first run.
    const skipInitialJobsFetch = useRef(initialJobs !== undefined);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Check auth on mount — skipped entirely when the server already resolved
    // it (see client-portal/page.tsx), so there's no blank-screen wait on first load.
    useEffect(() => {
        if (initialClient !== undefined) return;
        fetch("/api/portal/me")
            .then(async r => {
                if (r.ok) setClient(await r.json());
                setAuthChecked(true);
            })
            .catch(() => setAuthChecked(true));
    }, [initialClient]);

    const fetchJobs = useCallback(async (force = false) => {
        if (force) setSyncing(true); else setLoading(true);
        setError(null);
        setSlowLoad(false);
        const slowTimer = setTimeout(() => setSlowLoad(true), 6000);
        try {
            const url = force ? "/api/portal/jobs?refresh=1" : "/api/portal/jobs";
            const res = await fetch(url);
            if (!res.ok) throw new Error((await res.json()).error ?? `Error ${res.status}`);
            const data = await res.json();
            setJobs(Array.isArray(data.results) ? data.results : []);
            setLastSynced(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load jobs");
        } finally { setLoading(false); setSyncing(false); clearTimeout(slowTimer); }
    }, []);

    useEffect(() => {
        if (!client) return;
        if (skipInitialJobsFetch.current) { skipInitialJobsFetch.current = false; return; }
        fetchJobs();
    }, [client, fetchJobs]);

    // Fetch submissions once AFTER jobs are loaded — results shared with modals to avoid re-fetches
    useEffect(() => {
        if (!client || jobs.length === 0) return;
        const codes = jobs.map(j => j.job_code).filter(Boolean).join(',');
        const url = `/api/portal/submissions?job_codes=${encodeURIComponent(codes)}`;
        fetch(url)
            .then(r => r.ok ? r.json() : { results: [] })
            .then(d => {
                const all: Record<string, unknown>[] = Array.isArray(d.results) ? d.results : [];
                setCachedSubmissions(all);
                setSubmissionCount(all.length);
                const hired = all.filter(s => {
                    const st = String(s.submission_status || s.pipeline_status || '').toLowerCase();
                    return st.includes('placement') || st.includes('placed') || st.includes('offer accepted')
                        || mapStageIdx(String(s.submission_status || s.pipeline_status || '')) === 5;
                });
                setHiredCount(hired.length);
            })
            .catch(() => { setSubmissionCount(0); setHiredCount(0); });
    }, [jobs]);

    const handleLogout = async () => {
        await fetch("/api/portal/logout", { method: "POST" });
        setClient(null); setJobs([]);
    };

    if (!authChecked) return <div className="min-h-screen bg-cream" />;

    if (!client) return <LoginForm onLogin={setClient} siteImages={siteImages} />;

    const uniqueStatuses = Array.from(new Set(jobs.map(j => j.job_status).filter(Boolean)));
    const filteredJobs = jobs.filter(job => {
        const matchStatus = statusFilter === "All" || job.job_status === statusFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || job.job_title?.toLowerCase().includes(q) || job.job_code?.toLowerCase().includes(q) || job.primary_skills?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const statusCounts: Record<string, number> = {
        Total: jobs.length,
        ...Object.fromEntries(uniqueStatuses.map(s => [s, jobs.filter(j => j.job_status === s).length])),
    };

    const formatDate = (s: string) => {
        if (!s) return "";
        try { const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
        catch { return s; }
    };

    const renderCell = (job: Job, key: string) => {
        const val = job[key];
        if (val === null || val === undefined || val === "") return <span className="text-navy/20">—</span>;
        if (key.includes("date") || key === "Created" || key === "Modified") return <span className="text-navy/60">{formatDate(String(val))}</span>;
        if (key === "job_status") {
            const s = STATUS_BADGE[val] ?? STATUS_BADGE_FALLBACK;
            return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.badge}`}><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />{val}</span>;
        }
        if (key === "priority") { const pClasses: Record<string,string> = { High: 'text-red-600', Medium: 'text-amber-600', Low: 'text-green-700' }; return <span className={`text-[11px] font-semibold ${pClasses[val] ?? 'text-navy/60'}`}>{val}</span>; }
        if (key === "remote_job") { const rClasses: Record<string,string> = { Remote: 'text-green-700', Hybrid: 'text-steel', 'On-site': 'text-red-600' }; return <span className={`text-[11px] ${rClasses[val] ?? 'text-navy/60'}`}>{val}</span>; }
        return <span className="text-navy/80">{String(val)}</span>;
    };

    return (
        <>
        <div className="min-h-screen bg-cream">
            {/* Navbar */}
            <header className={`fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-navy/10 transition-shadow duration-300 ${scrolled ? 'shadow-[0_4px_20px_rgba(0,48,96,0.08)]' : ''}`}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[60px]">
                    <Link href="/" className="flex items-center">
                        <Image src={siteImages["client-portal:header-logo"]} alt="Mintex Staffing" width={148} height={20} priority className="h-5 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-semibold text-navy">{client.company || client.name}</span>
                            <span className="text-[10px] text-navy/50">Client Portal</span>
                        </div>
                        <button onClick={handleLogout}
                            className="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 pb-6 border-b border-navy/10">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-navy/10 bg-white px-3 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-tan" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy/60">Client Portal</span>
                        </div>
                        <h1 className="font-black leading-tight text-navy" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                            <span>
                                Job Postings Dashboard
                            </span>
                        </h1>
                        <p className="text-sm mt-1 text-navy/60">
                            {jobs.length > 0 ? `${jobs.length} postings assigned to your account` : "Your assigned job postings from CEIPAL"}
                        </p>
                    </div>
                </motion.div>

                {/* Status stat cards */}
                {!loading && jobs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                        {Object.entries(statusCounts).map(([label, count], i) => {
                            const isTotal = label === "Total";
                            const isActive = statusFilter === label || (isTotal && statusFilter === "All");
                            const LABEL_MAP: Record<string, string> = {
                                'total':          'Total Jobs',
                                'active':         'Active Jobs',
                                'closed':         'Closed Jobs',
                                'hold by client': 'Jobs Hold By Client',
                            };
                            const displayLabel = LABEL_MAP[label.toLowerCase()] ?? label;
                            return (
                                <motion.button key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                    onClick={() => setStatusFilter(isTotal ? "All" : (statusFilter === label ? "All" : label))}
                                    className={`p-4 rounded-lg text-left border transition-colors duration-200 ${isActive ? 'border-navy bg-navy' : 'border-navy/20 bg-white hover:border-navy/40'}`}>
                                    <p className={`text-2xl font-black mb-1 ${isActive ? 'text-white' : 'text-navy'}`}>{count}</p>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? 'text-white/70' : 'text-navy/50'}`}>{displayLabel}</p>
                                </motion.button>
                            );
                        })}

                        {/* Total Submissions */}
                        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Object.keys(statusCounts).length * 0.04 }}
                            onClick={() => setShowSubmissions(true)}
                            className="p-4 rounded-lg text-left border border-navy/20 bg-white transition-colors duration-200 hover:border-navy/40 group">
                            <p className="text-2xl font-black mb-1 text-navy">
                                {submissionCount === null ? '…' : submissionCount}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-navy/50">Total Submissions</p>
                        </motion.button>

                        {/* Total Hires */}
                        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (Object.keys(statusCounts).length + 1) * 0.04 }}
                            onClick={() => setShowHired(true)}
                            className="p-4 rounded-lg text-left border border-navy/20 bg-white transition-colors duration-200 hover:border-navy/40 group">
                            <p className="text-2xl font-black mb-1 text-navy">
                                {hiredCount === null ? '…' : hiredCount}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-navy/50">Total Hires</p>
                        </motion.button>
                    </motion.div>
                )}

                {/* Filter bar */}
                {!loading && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="flex flex-wrap items-center gap-3 mb-5 px-4 py-3 rounded-lg border border-navy/10 bg-white">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-semibold uppercase tracking-wide text-navy/50">Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="rounded-md border border-navy/20 bg-white px-3 py-2 text-xs font-semibold text-navy focus:border-steel focus:outline-none cursor-pointer">
                                <option value="All">All Statuses</option>
                                {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="w-px h-5 bg-navy/10" />
                        <div className="flex-1 min-w-[220px] relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by title, code, skills…"
                                className="w-full pl-9 pr-4 py-2 rounded-md border border-navy/20 bg-white text-xs text-navy focus:border-steel focus:outline-none" />
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                            <span className="text-xs font-semibold text-navy/50">{filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}</span>
                            {lastSynced && (
                                <span className="text-[10px] text-navy/40">
                                    Synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                            <button
                                onClick={() => fetchJobs(true)}
                                disabled={syncing}
                                className="flex items-center gap-1.5 rounded-full border border-navy/10 bg-white px-4 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-mist disabled:opacity-50">
                                <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {syncing ? 'Syncing…' : 'Sync'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-28">
                        <div className="relative w-10 h-10 mb-4">
                            <div className="absolute inset-0 rounded-full border-2 border-navy/15" />
                            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-steel" />
                        </div>
                        <p className="text-xs tracking-[0.25em] uppercase text-navy/50">Loading postings…</p>
                        {slowLoad && (
                            <p className="mt-2 max-w-xs text-center text-xs text-navy/40">
                                Still working — this can take up to a minute right after things update. Thanks for your patience.
                            </p>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl text-center bg-red-50 border border-red-200">
                        <p className="text-sm font-semibold mb-3 text-red-700">{error}</p>
                        <button onClick={() => fetchJobs()} className="rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">Retry</button>
                    </motion.div>
                )}

                {/* No jobs assigned */}
                {!loading && !error && jobs.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 border border-navy/10 bg-white">
                            <svg className="w-6 h-6 text-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-navy/70">No job postings assigned yet</p>
                        <p className="text-xs mt-1 mb-4 text-navy/50">Contact your Mintex account manager to get access to job postings.</p>
                        <button
                            onClick={() => fetchJobs(true)}
                            disabled={syncing}
                            className="inline-flex items-center gap-2 rounded-full bg-tan px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-tan-light disabled:opacity-50">
                            <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {syncing ? 'Syncing…' : 'Try Sync Now'}
                        </button>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && filteredJobs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="rounded-lg overflow-hidden border border-navy/10 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-mist border-b border-navy/10">
                                        <th className="px-4 py-3 text-left w-10 text-xs font-semibold uppercase tracking-wide text-navy/50">#</th>
                                        {TABLE_COLUMNS.map(col => (
                                            <th key={col.key} className="px-3 py-3 text-left whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-navy/50">{col.label}</th>
                                        ))}
                                        <th className="px-3 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.map((job, index) => (
                                        <tr key={job.job_code || index}
                                            className="cursor-pointer border-b border-navy/10 transition-colors duration-150 hover:bg-cream"
                                            onClick={() => setSelectedJob(job)}>
                                            <td className="px-4 py-3 text-xs text-navy/40">{index + 1}</td>
                                            {TABLE_COLUMNS.map(col => (
                                                <td key={col.key} className="px-3 py-3 text-xs max-w-[180px] truncate">{renderCell(job, col.key)}</td>
                                            ))}
                                            <td className="px-3 py-3">
                                                <button onClick={e => { e.stopPropagation(); setSelectedJob(job); }}
                                                    className="rounded-full bg-tan px-3 py-1.5 text-[10px] font-semibold text-navy transition-colors hover:bg-tan-light">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Empty filter state */}
                {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
                    <div className="py-16 text-center">
                        <p className="text-sm text-navy/50">No jobs match your filters.</p>
                        <button onClick={() => { setStatusFilter("All"); setSearchQuery(""); }} className="mt-3 text-xs font-semibold text-steel transition-colors hover:text-navy">Clear filters</button>
                    </div>
                )}
            </div>
        </div>
        {selectedJob && (
            <JobDetailModal
                job={selectedJob}
                permissions={client.permissions ?? {}}
                onClose={() => setSelectedJob(null)}
            />
        )}
        {showSubmissions && (
            <SubmissionsModal
                permissions={client.permissions ?? {}}
                onClose={() => setShowSubmissions(false)}
                onCountReady={n => setSubmissionCount(n)}
                jobCodes={jobs.map(j => j.job_code).filter(Boolean).join(',')}
                initialData={cachedSubmissions ?? undefined}
            />
        )}
        {showHired && (
            <HiredModal
                permissions={client.permissions ?? {}}
                onClose={() => setShowHired(false)}
                onCountReady={n => setHiredCount(n)}
                jobCodes={jobs.map(j => j.job_code).filter(Boolean).join(',')}
                initialData={cachedSubmissions ?? undefined}
            />
        )}
        </>
    );
}

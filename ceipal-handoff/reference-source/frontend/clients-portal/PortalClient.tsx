"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../public/logo.svg";

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

const C = {
    coral: '#FF5758', coralDim: 'rgba(255,87,88,0.1)', coralBdr: 'rgba(255,87,88,0.28)',
    cyan: '#57EEFF', cyanDim: 'rgba(87,238,255,0.08)', cyanBdr: 'rgba(87,238,255,0.22)', cyanText: '#7ED6E6',
};
const GF = 'var(--font-gilroy)';

const STATUS_DARK: Record<string, { bg: string; border: string; color: string; dot: string }> = {
    Active:    { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  color: '#6EE7B7', dot: '#10B981' },
    Open:      { bg: C.cyanDim,               border: C.cyanBdr,               color: C.cyanText, dot: C.cyan },
    'On Hold': { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.28)', color: '#FCD34D', dot: '#FBBF24' },
    Closed:    { bg: C.coralDim,              border: C.coralBdr,              color: '#FFB3B3',  dot: C.coral },
    Filled:    { bg: 'rgba(155,92,246,0.1)',  border: 'rgba(155,92,246,0.28)', color: '#C4A8FF',  dot: '#9B5CF6' },
};

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
function LoginForm({ onLogin }: { onLogin: (client: ClientInfo) => void }) {
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
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #06091e 0%, #07122a 45%, #030e18 100%)' }}>
            {/* Grid texture */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(87,238,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '72px 72px', opacity: 0.5,
            }} />
            <div className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(87,238,255,0.05) 0%, transparent 60%)', filter: 'blur(60px)' }} />

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{ background: scrolled ? 'rgba(6,9,30,0.97)' : 'rgba(6,9,30,0.6)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{ height: 60 }}>
                    <Link href="/"><Image src={Logo} alt="Mintex Staffing" width={160} height={22} priority /></Link>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText, fontFamily: GF }}>
                        Client Portal
                    </span>
                </div>
            </header>

            {/* Login card */}
            <div className="flex-1 flex items-center justify-center px-4 relative z-10" style={{ paddingTop: 80 }}>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full"
                            style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.cyan }} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: C.cyan, fontFamily: GF }}>Client Portal</span>
                        </div>
                        <h1 className="font-black text-3xl text-white" style={{ fontFamily: GF }}>Sign In</h1>
                        <p className="text-sm mt-2" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>Access your job postings & candidates</p>
                    </div>

                    <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>Username</label>
                                <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                                    placeholder="your_username" autoComplete="username"
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f0ff', fontFamily: GF }}
                                    onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.07)`; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>Password</label>
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" autoComplete="current-password"
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f0ff', fontFamily: GF }}
                                    onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.07)`; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {error && (
                                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: '#FFB3B3', fontFamily: GF }}>
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, rgba(87,238,255,0.15) 0%, rgba(87,238,255,0.08) 100%)', border: `1px solid ${C.cyanBdr}`, color: C.cyan, fontFamily: GF }}>
                                {loading ? "Signing in…" : "Sign In"}
                            </button>
                        </form>
                        <p className="text-center text-xs mt-6" style={{ color: 'rgba(170,185,210,0.3)', fontFamily: GF }}>
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

    const s = STATUS_DARK[job.job_status] ?? { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(200,215,235,0.7)', dot: 'rgba(255,255,255,0.4)' };
    const tabKeys = ['snapshot', ...(hasDesc ? ['description'] : []), ...(hasSkills ? ['skills'] : []), 'submissions'] as const;
    const tabLabels: Record<string, string> = { snapshot: 'Snapshot', description: 'Description', skills: 'Skills', submissions: `Submissions (${submissions.length})` };

    const fmt = (d: string) => { try { return new Date(d).toLocaleDateString('en-AU', { day:'2-digit', month:'short', year:'numeric' }); } catch { return d; } };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-6 px-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-4xl rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#07122a 0%,#06091e 100%)', border: '1px solid rgba(87,238,255,0.15)', boxShadow: `0 0 60px rgba(87,238,255,0.07)` }}>

                {/* Top accent line */}
                <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${C.cyan}55,transparent)` }} />

                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="font-mono text-xs px-2.5 py-1 rounded-md" style={{ background: 'rgba(87,238,255,0.08)', border: `1px solid ${C.cyanBdr}`, color: C.cyan, fontFamily: GF }}>
                                    {job.job_code}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: GF }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />{job.job_status}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-white truncate" style={{ fontFamily: GF }}>{job.job_title}</h2>
                            <p className="text-sm mt-1" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                                {[job.city, job.states, job.country].filter(Boolean).join(', ')}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-2xl leading-none transition-colors" style={{ color: 'rgba(170,185,210,0.4)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(170,185,210,0.4)')}>
                            &times;
                        </button>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { label: 'Positions',  value: job.number_of_positions },
                            { label: 'Type',       value: job.job_type },
                            { label: 'Remote',     value: job.remote_job || detail?.remote_opportunities },
                            { label: 'Industry',   value: job.industry  || detail?.industry },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>{label}</p>
                                <p className="text-sm font-semibold text-white" style={{ fontFamily: GF }}>{String(value || '—')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6 overflow-x-auto gap-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {tabKeys.map(key => (
                        <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
                            className="px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap relative"
                            style={{ color: activeTab === key ? C.cyan : 'rgba(170,185,210,0.45)', fontFamily: GF, borderBottom: activeTab === key ? `2px solid ${C.cyan}` : '2px solid transparent', marginBottom: -1 }}>
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
                                <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>{label}</p>
                                    <p className="text-sm" style={{ color: 'rgba(200,215,235,0.85)', fontFamily: GF }}>{String(val)}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {activeTab === 'description' && (
                        <div className="text-sm leading-relaxed max-h-[55vh] overflow-y-auto pr-2"
                            style={{ color: 'rgba(190,205,225,0.75)', fontFamily: GF }}
                            dangerouslySetInnerHTML={{ __html: desc }} />
                    )}

                    {/* Skills */}
                    {activeTab === 'skills' && (
                        <div className="flex flex-wrap gap-2">
                            {skills.split(/,\s*/).filter(Boolean).map(sk => (
                                <span key={sk} className="px-3 py-1.5 rounded-full text-sm font-semibold"
                                    style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText, fontFamily: GF }}>
                                    {sk.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Submissions */}
                    {activeTab === 'submissions' && (
                        <div>
                            {subsLoading ? (
                                <div className="flex items-center justify-center gap-3 py-10" style={{ color: 'rgba(170,185,210,0.4)' }}>
                                    <div className="w-5 h-5 rounded-full animate-spin" style={{ border: `1.5px solid transparent`, borderTopColor: C.cyan }} />
                                    <span className="text-xs tracking-widest uppercase" style={{ fontFamily: GF }}>Loading submissions…</span>
                                </div>
                            ) : (
                                <>
                                    {/* Stage filter */}
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        <button onClick={() => setStageFilter('all')}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                            style={{ background: stageFilter === 'all' ? C.cyanDim : 'rgba(255,255,255,0.04)', border: `1px solid ${stageFilter === 'all' ? C.cyanBdr : 'rgba(255,255,255,0.08)'}`, color: stageFilter === 'all' ? C.cyan : 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                                            All {submissions.length}
                                        </button>
                                        {PIPELINE_STAGES.map(stage => (stageCounts[stage] ?? 0) > 0 && (
                                            <button key={stage} onClick={() => setStageFilter(stage)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                                style={{ background: stageFilter === stage ? C.cyanDim : 'rgba(255,255,255,0.04)', border: `1px solid ${stageFilter === stage ? C.cyanBdr : 'rgba(255,255,255,0.08)'}`, color: stageFilter === stage ? C.cyan : 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                                                {stage} {stageCounts[stage]}
                                            </button>
                                        ))}
                                    </div>

                                    {filteredSubs.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-sm" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>
                                                No submissions{stageFilter !== 'all' ? ` in "${stageFilter}"` : ''} yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            {filteredSubs.map((sub, i) => {
                                                const stageIdx    = mapStageIdx(sub.submission_status || sub.pipeline_status || '');
                                                const statusLabel = sub.submission_status || sub.pipeline_status || 'Unknown';
                                                const subOn = sub.submitted_on ? fmt(sub.submitted_on) : '';

                                                return (
                                                    <div key={sub.id ?? i} className="py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                        {/* Row */}
                                                        <div className="flex items-start justify-between gap-3 mb-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-white" style={{ fontFamily: GF }}>
                                                                    {(sub as Record<string,unknown>).candidate_name
                                                                      ? String((sub as Record<string,unknown>).candidate_name)
                                                                      : `Submission #${sub.submission_id}`}
                                                                </p>
                                                                <p className="text-xs mt-0.5" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>
                                                                    {sub.source ? `Source: ${sub.source}` : ''}
                                                                    {subOn ? ` · ${subOn}` : ''}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                                                                style={{
                                                                    background: stageIdx >= 4 ? 'rgba(87,238,255,0.08)' : stageIdx >= 2 ? 'rgba(251,191,36,0.1)' : 'rgba(16,185,129,0.08)',
                                                                    border: stageIdx >= 4 ? `1px solid ${C.cyanBdr}` : stageIdx >= 2 ? '1px solid rgba(251,191,36,0.28)' : '1px solid rgba(16,185,129,0.3)',
                                                                    color: stageIdx >= 4 ? C.cyanText : stageIdx >= 2 ? '#FCD34D' : '#6EE7B7',
                                                                    fontFamily: GF,
                                                                }}>
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
                                                                            <div className="absolute top-[7px] left-1/2 w-full h-0.5 z-0" style={{ background: lineColored ? C.cyan + '99' : 'rgba(255,255,255,0.06)' }} />
                                                                        )}
                                                                        {/* Dot with ✓ for completed */}
                                                                        <div className="relative z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                                                                            style={{ background: active ? C.cyan : done ? C.cyan + '99' : 'rgba(255,255,255,0.08)', borderColor: active ? C.cyan : done ? C.cyan : 'rgba(255,255,255,0.15)', boxShadow: active ? `0 0 8px ${C.cyan}55` : 'none' }}>
                                                                            {done && (
                                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth={3} viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[9px] mt-1 text-center truncate w-full px-0.5" style={{ color: active ? C.cyanText : done ? C.cyan + 'aa' : 'rgba(170,185,210,0.2)', fontFamily: GF, fontWeight: active ? 600 : 400 }}>
                                                                            {stage.split(' ')[0]}
                                                                        </p>
                                                                        {active && subOn && <p className="text-[8px] text-center truncate w-full" style={{ color: C.cyanText, fontFamily: GF }}>{subOn}</p>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Meta */}
                                                        {!!(sub.employment_type || sub.tax_term || (permissions.show_pay_rate && sub.pay_rate)) && (
                                                            <div className="flex flex-wrap gap-4 mt-2">
                                                                {sub.employment_type && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Type: <span style={{ color: 'rgba(200,215,235,0.7)' }}>{sub.employment_type}</span></span>}
                                                                {sub.tax_term && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Tax: <span style={{ color: 'rgba(200,215,235,0.7)' }}>{sub.tax_term}</span></span>}
                                                                {permissions.show_pay_rate && sub.pay_rate && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Pay: <span style={{ color: C.cyan }}>{sub.pay_rate}</span></span>}
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

                <div className="px-6 pb-6 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={onClose} className="mt-4 px-5 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(170,185,210,0.6)', fontFamily: GF }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-6 px-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-5xl rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#07122a 0%,#06091e 100%)', border: '1px solid rgba(87,238,255,0.15)', boxShadow: '0 0 60px rgba(87,238,255,0.07)' }}>
                <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${C.cyan}55,transparent)` }} />

                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                        <h2 className="text-xl font-black text-white" style={{ fontFamily: GF }}>Total Submissions</h2>
                        <p className="text-xs mt-1" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}>All candidates submitted across your job postings</p>
                    </div>
                    <button onClick={onClose} className="text-2xl leading-none transition-colors" style={{ color: 'rgba(170,185,210,0.4)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(170,185,210,0.4)')}>
                        &times;
                    </button>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 flex flex-wrap gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search candidate, job title, code…"
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-xs focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }} />
                    <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg text-xs focus:outline-none cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }}>
                        <option value="all" style={{ background: '#07122a' }}>All Stages</option>
                        {allStages.map(s => <option key={s} value={s} style={{ background: '#07122a' }}>{s}</option>)}
                    </select>
                    <span className="px-3 py-2 text-xs font-semibold rounded-lg" style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText, fontFamily: GF }}>
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-16">
                            <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: C.cyan }} />
                            <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Loading submissions…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-sm" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>No submissions found.</p>
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

                                const statusStyle = isRejected
                                    ? { bg: 'rgba(255,87,88,0.12)', border: `1px solid ${C.coralBdr}`, color: '#FFB3B3' }
                                    : isPlaced
                                    ? { bg: 'rgba(155,92,246,0.12)', border: '1px solid rgba(155,92,246,0.3)', color: '#C4A8FF' }
                                    : isConfirmed
                                    ? { bg: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6EE7B7' }
                                    : isInterview
                                    ? { bg: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.28)', color: '#FCD34D' }
                                    : isSubmitted
                                    ? { bg: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText }
                                    : isOnHold
                                    ? { bg: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#FCD34D' }
                                    : { bg: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(200,215,235,0.6)' };

                                return (
                                    <div key={i} className="p-4 rounded-xl"
                                        style={{ background: isRejected ? 'rgba(255,87,88,0.03)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isRejected ? 'rgba(255,87,88,0.1)' : 'rgba(255,255,255,0.06)'}` }}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate" style={{ fontFamily: GF }}>
                                                    {sub.candidate_name ? String(sub.candidate_name) : `Submission #${sub.submission_id ?? i + 1}`}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(87,238,255,0.08)', color: C.cyanText, fontFamily: GF }}>
                                                        {String(sub.job_code ?? '')}
                                                    </span>
                                                    <span className="text-xs" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>{String(sub.job_title ?? '')}</span>
                                                    {!!sub.job_city && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>{String(sub.job_city)}{sub.job_state ? `, ${String(sub.job_state)}` : ''}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                                                    style={{ background: statusStyle.bg, border: statusStyle.border, color: statusStyle.color, fontFamily: GF }}>
                                                    {status}
                                                </span>
                                                {!!sub.submitted_on && <span className="text-[10px]" style={{ color: 'rgba(170,185,210,0.3)', fontFamily: GF }}>{fmt(String(sub.submitted_on))}</span>}
                                            </div>
                                        </div>
                                        {/* Pipeline */}
                                        <div className="flex items-center w-full mt-2">
                                            {PIPELINE_STAGES.map((stage, idx) => {
                                                const done = idx < stageIdx; const active = idx === stageIdx;
                                                return (
                                                    <div key={stage} className="flex-1 flex flex-col items-center relative min-w-0">
                                                        {idx < PIPELINE_STAGES.length - 1 && (
                                                            <div className="absolute top-[7px] left-1/2 w-full h-0.5 z-0" style={{ background: idx < stageIdx ? C.cyan + '88' : 'rgba(255,255,255,0.05)' }} />
                                                        )}
                                                        <div className="relative z-10 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                                                            style={{ background: active ? C.cyan : done ? C.cyan + '88' : 'rgba(255,255,255,0.07)', borderColor: active ? C.cyan : done ? C.cyan : 'rgba(255,255,255,0.12)', boxShadow: active ? `0 0 6px ${C.cyan}55` : 'none' }}>
                                                            {done && <svg className="w-2 h-2" fill="none" stroke="white" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <p className="text-[8px] mt-0.5 text-center truncate w-full px-0.5" style={{ color: active ? C.cyanText : done ? C.cyan + 'aa' : 'rgba(170,185,210,0.18)', fontFamily: GF, fontWeight: active ? 600 : 400 }}>
                                                            {stage.split(' ')[0]}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Meta */}
                                        {!!(sub.employment_type || sub.tax_term || (permissions.show_pay_rate && sub.pay_rate)) && (
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                {!!sub.employment_type && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Type: <span style={{ color: 'rgba(200,215,235,0.7)' }}>{String(sub.employment_type)}</span></span>}
                                                {!!(permissions.show_pay_rate && sub.pay_rate) && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Pay: <span style={{ color: C.cyan }}>{String(sub.pay_rate)}</span></span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 pt-4 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(170,185,210,0.6)', fontFamily: GF }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-6 px-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-5xl rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#07122a 0%,#06091e 100%)', border: '1px solid rgba(155,92,246,0.25)', boxShadow: '0 0 60px rgba(155,92,246,0.07)' }}>
                <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,rgba(155,92,246,0.6),transparent)' }} />

                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                        <h2 className="text-xl font-black text-white" style={{ fontFamily: GF }}>Total Hires</h2>
                        <p className="text-xs mt-1" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}>All candidates placed/hired for your account</p>
                    </div>
                    <button onClick={onClose} className="text-2xl leading-none transition-colors" style={{ color: 'rgba(170,185,210,0.4)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(170,185,210,0.4)')}>
                        &times;
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 flex flex-wrap gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search candidate or job…"
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-xs focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }} />
                    <span className="px-3 py-2 text-xs font-semibold rounded-lg" style={{ background: 'rgba(155,92,246,0.1)', border: '1px solid rgba(155,92,246,0.3)', color: '#C4A8FF', fontFamily: GF }}>
                        {filtered.length} hired
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-16">
                            <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: '#9B5CF6' }} />
                            <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Loading placements…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-sm" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>No hired candidates found.</p>
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
                                    <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(155,92,246,0.12)' }}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className="text-sm font-bold text-white" style={{ fontFamily: GF }}>{candidateName}</p>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(155,92,246,0.12)', border: '1px solid rgba(155,92,246,0.3)', color: '#C4A8FF', fontFamily: GF }}>
                                                        ✓ Hired
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                    {jobCode && <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(87,238,255,0.08)', color: C.cyanText, fontFamily: GF }}>{jobCode}</span>}
                                                    <span className="text-xs" style={{ color: 'rgba(170,185,210,0.6)', fontFamily: GF }}>{jobTitle}</span>
                                                    {location && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>{location}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(155,92,246,0.12)', border: '1px solid rgba(155,92,246,0.3)', color: '#C4A8FF', fontFamily: GF }}>✓ {status}</span>
                                                {!!submittedOn && <span className="text-[10px]" style={{ color: 'rgba(170,185,210,0.3)', fontFamily: GF }}>{fmt(submittedOn)}</span>}
                                            </div>
                                        </div>
                                        {/* Extra details */}
                                        {!!(p.employment_type || (permissions.show_pay_rate && p.pay_rate)) && (
                                        <div className="flex flex-wrap gap-4 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                            {!!p.employment_type && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Type: <span style={{ color: 'rgba(200,215,235,0.7)' }}>{String(p.employment_type)}</span></span>}
                                            {!!(permissions.show_pay_rate && p.pay_rate) && <span className="text-xs" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Pay: <span style={{ color: '#6EE7B7' }}>{String(p.pay_rate)}</span></span>}
                                        </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 pt-4 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(170,185,210,0.6)', fontFamily: GF }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Portal Dashboard ────────────────────────────────────────────────────
export default function PortalClient() {
    const [authChecked, setAuthChecked] = useState(false);
    const [client, setClient]           = useState<ClientInfo | null>(null);
    const [jobs, setJobs]               = useState<Job[]>([]);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState<string | null>(null);
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

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Check auth on mount
    useEffect(() => {
        fetch("/api/portal/me")
            .then(async r => {
                if (r.ok) setClient(await r.json());
                setAuthChecked(true);
            })
            .catch(() => setAuthChecked(true));
    }, []);

    const fetchJobs = useCallback(async (force = false) => {
        if (force) setSyncing(true); else setLoading(true);
        setError(null);
        try {
            const url = force ? "/api/portal/jobs?refresh=1" : "/api/portal/jobs";
            const res = await fetch(url);
            if (!res.ok) throw new Error((await res.json()).error ?? `Error ${res.status}`);
            const data = await res.json();
            setJobs(Array.isArray(data.results) ? data.results : []);
            setLastSynced(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load jobs");
        } finally { setLoading(false); setSyncing(false); }
    }, []);

    useEffect(() => { if (client) fetchJobs(); }, [client, fetchJobs]);

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

    if (!authChecked) return <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #07122a 45%, #030e18 100%)' }} />;

    if (!client) return <LoginForm onLogin={setClient} />;

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
        if (val === null || val === undefined || val === "") return <span style={{ color: 'rgba(255,255,255,0.12)' }}>—</span>;
        if (key.includes("date") || key === "Created" || key === "Modified") return <span style={{ color: 'rgba(170,185,210,0.65)' }}>{formatDate(String(val))}</span>;
        if (key === "job_status") {
            const s = STATUS_DARK[val] ?? { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(200,215,235,0.7)', dot: 'rgba(255,255,255,0.4)' };
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: GF }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />{val}</span>;
        }
        if (key === "priority") { const pColors: Record<string,string> = { High: C.coral, Medium: '#FCD34D', Low: '#6EE7B7' }; return <span style={{ color: pColors[val] ?? 'rgba(170,185,210,0.65)', fontFamily: GF, fontWeight: 600, fontSize: 11 }}>{val}</span>; }
        if (key === "remote_job") { const rColors: Record<string,string> = { Remote: '#6EE7B7', Hybrid: C.cyanText, 'On-site': '#FFB3B3' }; return <span style={{ color: rColors[val] ?? 'rgba(170,185,210,0.65)', fontFamily: GF, fontSize: 11 }}>{val}</span>; }
        return <span style={{ color: 'rgba(200,215,235,0.75)', fontFamily: GF }}>{String(val)}</span>;
    };

    return (
        <>
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #07122a 45%, #030e18 100%)' }}>
            <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(87,238,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.03) 1px, transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.5 }} />
            <div className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(87,238,255,0.04) 0%, transparent 60%)', filter: 'blur(60px)' }} />
            <div className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 70%, rgba(255,87,88,0.04) 0%, transparent 65%)', filter: 'blur(60px)' }} />

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{ background: scrolled ? 'rgba(6,9,30,0.97)' : 'rgba(6,9,30,0.6)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none' }}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{ height: 60 }}>
                    <Link href="/"><Image src={Logo} alt="Mintex Staffing" width={160} height={22} priority /></Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-semibold text-white" style={{ fontFamily: GF }}>{client.company || client.name}</span>
                            <span className="text-[10px]" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Client Portal</span>
                        </div>
                        <button onClick={handleLogout}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                            style={{ background: 'rgba(255,87,88,0.1)', border: '1px solid rgba(255,87,88,0.25)', color: '#FFB3B3', fontFamily: GF }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,87,88,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,87,88,0.1)')}>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ paddingTop: 80, paddingBottom: 80 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full" style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.cyan }} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: C.cyan, fontFamily: GF }}>Client Portal</span>
                        </div>
                        <h1 className="font-black leading-tight" style={{ fontFamily: GF, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                            <span style={{ background: `linear-gradient(120deg, #ffffff 0%, #c8f8ff 60%, ${C.cyan} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Job Postings Dashboard
                            </span>
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
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
                            const s = STATUS_DARK[label];
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
                                    className="p-4 rounded-xl text-left transition-all duration-200"
                                    style={{ background: isActive ? (isTotal ? C.cyanDim : (s?.bg ?? C.cyanDim)) : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? (isTotal ? C.cyanBdr : (s?.border ?? C.cyanBdr)) : 'rgba(255,255,255,0.07)'}` }}>
                                    <p className="text-2xl font-black mb-1" style={{ fontFamily: GF, color: isActive ? (isTotal ? C.cyan : (s?.color ?? C.cyan)) : '#f0f4ff' }}>{count}</p>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: isActive ? (isTotal ? C.cyanText : (s?.color ?? C.cyanText)) : 'rgba(170,185,210,0.45)', fontFamily: GF }}>{displayLabel}</p>
                                </motion.button>
                            );
                        })}

                        {/* Total Submissions */}
                        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Object.keys(statusCounts).length * 0.04 }}
                            onClick={() => setShowSubmissions(true)}
                            className="p-4 rounded-xl text-left transition-all duration-200 group"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.cyanDim; (e.currentTarget as HTMLElement).style.borderColor = C.cyanBdr; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                            <p className="text-2xl font-black mb-1" style={{ fontFamily: GF, color: '#f0f4ff' }}>
                                {submissionCount === null ? '…' : submissionCount}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}>Total Submissions</p>
                        </motion.button>

                        {/* Total Hires */}
                        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (Object.keys(statusCounts).length + 1) * 0.04 }}
                            onClick={() => setShowHired(true)}
                            className="p-4 rounded-xl text-left transition-all duration-200 group"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(155,92,246,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(155,92,246,0.3)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                            <p className="text-2xl font-black mb-1" style={{ fontFamily: GF, color: '#f0f4ff' }}>
                                {hiredCount === null ? '…' : hiredCount}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}>Total Hires</p>
                        </motion.button>
                    </motion.div>
                )}

                {/* Filter bar */}
                {!loading && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="flex flex-wrap items-center gap-3 mb-5 px-4 py-3 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f0ff', fontFamily: GF }}>
                                <option value="All" style={{ background: '#07122a' }}>All Statuses</option>
                                {uniqueStatuses.map(s => <option key={s} value={s} style={{ background: '#07122a' }}>{s}</option>)}
                            </select>
                        </div>
                        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        <div className="flex-1 min-w-[220px] relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(170,185,210,0.35)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by title, code, skills…"
                                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }} />
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                            <span className="text-xs font-semibold" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>{filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}</span>
                            {lastSynced && (
                                <span className="text-[10px]" style={{ color: 'rgba(170,185,210,0.3)', fontFamily: GF }}>
                                    Synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                            <button
                                onClick={() => fetchJobs(true)}
                                disabled={syncing}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-50"
                                style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText, fontFamily: GF }}
                                onMouseEnter={e => { if (!syncing) (e.currentTarget as HTMLElement).style.background = 'rgba(87,238,255,0.14)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.cyanDim; }}>
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
                            <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${C.cyanDim}` }} />
                            <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: C.cyan }} />
                        </div>
                        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Loading postings…</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl text-center" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                        <p className="text-sm font-semibold mb-3" style={{ color: '#FFB3B3', fontFamily: GF }}>{error}</p>
                        <button onClick={() => fetchJobs()} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: C.coral, fontFamily: GF }}>Retry</button>
                    </motion.div>
                )}

                {/* No jobs assigned */}
                {!loading && !error && jobs.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}` }}>
                            <svg className="w-6 h-6" style={{ color: C.cyanText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'rgba(170,185,210,0.6)', fontFamily: GF }}>No job postings assigned yet</p>
                        <p className="text-xs mt-1 mb-4" style={{ color: 'rgba(170,185,210,0.3)', fontFamily: GF }}>Contact your Mintex account manager to get access to job postings.</p>
                        <button
                            onClick={() => fetchJobs(true)}
                            disabled={syncing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50"
                            style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText, fontFamily: GF }}>
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
                        className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)' }}>
                        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 0%, ${C.cyan}33 30%, ${C.coral}33 70%, transparent 100%)` }} />
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                                        <th className="px-4 py-3 text-left w-10" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>#</th>
                                        {TABLE_COLUMNS.map(col => (
                                            <th key={col.key} className="px-3 py-3 text-left whitespace-nowrap" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{col.label}</th>
                                        ))}
                                        <th className="px-3 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.map((job, index) => (
                                        <tr key={job.job_code || index}
                                            className="cursor-pointer transition-all duration-150"
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                            onClick={() => setSelectedJob(job)}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(87,238,255,0.03)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                            <td className="px-4 py-3 text-xs" style={{ color: 'rgba(170,185,210,0.28)', fontFamily: GF }}>{index + 1}</td>
                                            {TABLE_COLUMNS.map(col => (
                                                <td key={col.key} className="px-3 py-3 text-xs max-w-[180px] truncate" style={{ fontFamily: GF }}>{renderCell(job, col.key)}</td>
                                            ))}
                                            <td className="px-3 py-3">
                                                <button onClick={e => { e.stopPropagation(); setSelectedJob(job); }}
                                                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                                                    style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyan, fontFamily: GF }}>
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
                        <p className="text-sm" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>No jobs match your filters.</p>
                        <button onClick={() => { setStatusFilter("All"); setSearchQuery(""); }} className="mt-3 text-xs font-semibold" style={{ color: C.cyanText, fontFamily: GF }}>Clear filters</button>
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

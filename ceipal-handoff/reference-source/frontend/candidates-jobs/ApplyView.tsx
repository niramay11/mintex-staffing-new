"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
    job_code: string;
    job_title: string;
    city: string;
    states: string;
    zip_code: string;
    location: string;
    pay_rate___salary: string;
    remote_job: string;
    job_type: string;
    experience: string;
    career_portal_published_date: string;
    industry?: string;
}

interface ApplyViewProps {
    jobs: Job[];
    allJobs?: Job[];
    onBack: () => void;
    onSuccess: () => void;
}

const C = {
    coral:    '#FF5758',
    coralDim: 'rgba(255,87,88,0.12)',
    coralBdr: 'rgba(255,87,88,0.28)',
    cyan:     '#57EEFF',
    cyanDim:  'rgba(87,238,255,0.08)',
    cyanBdr:  'rgba(87,238,255,0.2)',
    cyanText: '#7ED6E6',
};
const GF = 'var(--font-gilroy)';

const REMOTE_COLORS: Record<string, { bg: string; border: string; color: string; dot: string }> = {
    Remote:    { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', color: '#6EE7B7', dot: '#10B981' },
    Hybrid:    { bg: 'rgba(87,238,255,0.08)', border: 'rgba(87,238,255,0.2)',  color: '#7ED6E6', dot: '#57EEFF' },
    'On-site': { bg: 'rgba(255,87,88,0.12)',  border: 'rgba(255,87,88,0.28)', color: '#FFB3B3', dot: '#FF5758' },
};

const WORK_AUTH = ['US Citizen', 'Green Card', 'H1B', 'H4 EAD', 'OPT', 'CPT', 'TN Visa', 'E3 Visa', 'L2 EAD', 'Other'];
const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

interface FormData {
    fullName: string;
    email: string;
    mobileNumber: string;
    workAuthorization: string;
    state: string;
    city: string;
    zipCode: string;
    availability: string;
    relocation: 'Yes' | 'No';
    videoLink: string;
    signatureType: 'type' | 'draw';
    signatureText: string;
    signatureDataUrl: string;
    agreedToTerms: boolean;
    resume: File | null;
}

const defaultForm = (): FormData => ({
    fullName: '',
    email: '', mobileNumber: '',
    workAuthorization: '',
    state: '', city: '', zipCode: '',
    availability: '',
    relocation: 'No', videoLink: '',
    signatureType: 'type', signatureText: '', signatureDataUrl: '',
    agreedToTerms: false, resume: null,
});

// ── Field helpers ────────────────────────────────────────────────────────────
const inputStyle = (err?: string): React.CSSProperties => ({
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${err ? C.coralBdr : 'rgba(255,255,255,0.1)'}`,
    color: '#e8f0ff', fontFamily: GF, width: '100%',
    borderRadius: 10, padding: '10px 14px', fontSize: '0.875rem',
    outline: 'none',
});
const selectStyle = (err?: string): React.CSSProperties => ({
    ...inputStyle(err),
    appearance: 'none', cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='rgba(160,178,205,0.5)' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    paddingRight: 32,
});
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.68rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.12em',
    color: 'rgba(160,178,205,0.5)', fontFamily: GF, marginBottom: 6,
};

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label style={labelStyle}>
        {children}{required && <span style={{ color: C.coral }}> *</span>}
    </label>
);
const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p style={{ color: '#FFB3B3', fontSize: '0.75rem', marginTop: 4, fontFamily: GF }}>{msg}</p> : null;

const fmtDate = (s: string) => {
    if (!s) return null;
    try {
        const d = new Date(s);
        if (isNaN(d.getTime())) return null;
        const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (diff === 0) return 'Today';
        if (diff < 30) return `${diff} days ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return null; }
};

// ── Main Component ───────────────────────────────────────────────────────────
const ApplyView: React.FC<ApplyViewProps> = ({ jobs, allJobs, onBack, onSuccess }) => {
    const [form, setForm]           = useState<FormData>(defaultForm());
    const [errors, setErrors]       = useState<Partial<Record<keyof FormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const set = (field: keyof FormData, value: unknown) => {
        setForm(p => ({ ...p, [field]: value }));
        if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
    };

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormData, string>> = {};
        if (!form.fullName.trim())     e.fullName     = 'Required';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
        if (!form.mobileNumber.trim() || !/^\d{7,15}$/.test(form.mobileNumber.replace(/[\s\-()]/g, ''))) e.mobileNumber = 'Valid number required';
        if (!form.workAuthorization)   e.workAuthorization = 'Required';
        if (!form.city.trim())         e.city         = 'Required';
        if (!form.resume)              e.resume       = 'Resume required';
        if (form.signatureType === 'type' && !form.signatureText.trim())
            e.signatureText = 'Please type your signature';
        if (form.signatureType === 'draw' && !form.signatureDataUrl)
            e.signatureText = 'Please draw your signature';
        if (!form.agreedToTerms)       e.agreedToTerms = 'You must agree to the terms';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true); setSubmitStatus(null);
        try {
            const fd = new FormData();
            fd.append('fullName',         form.fullName);
            fd.append('email',            form.email);
            fd.append('mobileNumber',     form.mobileNumber);
            fd.append('workAuthorization',form.workAuthorization);
            fd.append('state',            form.state);
            fd.append('city',             form.city);
            fd.append('zipCode',          form.zipCode);
            fd.append('availability',     form.availability);
            fd.append('relocation',       form.relocation);
            fd.append('videoLink',        form.videoLink);
            fd.append('signatureText',    form.signatureType === 'type' ? form.signatureText : '[Drawn Signature]');
            fd.append('signatureDataUrl', form.signatureDataUrl);
            fd.append('jobs', JSON.stringify(jobs.map(j => ({
                job_code: j.job_code, job_title: j.job_title,
                location: j.location || [j.city, j.states].filter(Boolean).join(', '),
                pay_rate: j.pay_rate___salary || 'N/A',
            }))));
            if (form.resume) fd.append('resume', form.resume);

            const res  = await fetch('/api/apply', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok) {
                setSubmitStatus({ type: 'success', message: 'Application submitted successfully! We will be in touch soon.' });
                setTimeout(() => onSuccess(), 2500);
            } else {
                setSubmitStatus({ type: 'error', message: data.error || 'Submission failed. Please try again.' });
            }
        } catch {
            setSubmitStatus({ type: 'error', message: 'Network error. Please check your connection.' });
        } finally {
            setSubmitting(false);
        }
    };

    const jobLabel = jobs.length === 1
        ? jobs[0].job_title
        : `${jobs.length} Positions`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-h-[calc(100vh-62px)] pb-20"
            style={{ background: 'linear-gradient(160deg, #06091e 0%, #060f28 50%, #030e18 100%)' }}>

            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(87,238,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(87,238,255,0.015) 1px,transparent 1px)`,
                backgroundSize: '80px 80px',
            }} />

            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">

                {/* ── Header card ── */}
                <div className="rounded-2xl mb-5 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                    <div className="h-px" style={{ background: `linear-gradient(90deg,transparent,${C.coral}66,transparent)` }} />
                    <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: C.coral, fontFamily: GF }}>
                                {(form.fullName?.[0] ?? form.email?.[0] ?? 'A').toUpperCase()}
                            </div>
                            <div>
                                <p className="font-black text-sm" style={{ color: '#f0f4ff', fontFamily: GF }}>
                                    {form.fullName.trim() || 'New Applicant'}
                                </p>
                                <p className="text-[12px]" style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                    Applying for <span style={{ color: C.cyanText }}>{jobLabel}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onBack}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(185,200,220,0.6)', fontFamily: GF }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = '#e8f0ff'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(185,200,220,0.6)'; }}>
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit} disabled={submitting}
                                className="px-7 py-2.5 rounded-xl text-sm font-black tracking-wide flex items-center gap-2"
                                style={{ background: submitting ? C.coralDim : `linear-gradient(135deg,${C.coral},#ff8181)`, color: submitting ? C.coral : '#fff', boxShadow: submitting ? 'none' : `0 0 20px ${C.coral}44`, cursor: submitting ? 'not-allowed' : 'pointer', border: submitting ? `1px solid ${C.coralBdr}` : 'none', fontFamily: GF }}>
                                {submitting
                                    ? <><span className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: `${C.coral}33`, borderTopColor: C.coral }} /> Submitting…</>
                                    : 'Apply'}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Status message */}
                <AnimatePresence>
                    {submitStatus && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mb-5 p-4 rounded-xl"
                            style={{ background: submitStatus.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(255,87,88,0.08)', border: `1px solid ${submitStatus.type === 'success' ? 'rgba(16,185,129,0.25)' : C.coralBdr}` }}>
                            <p className="text-sm font-semibold" style={{ color: submitStatus.type === 'success' ? '#6EE7B7' : '#FFB3B3', fontFamily: GF }}>
                                {submitStatus.message}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Two-column layout ── */}
                <div className="flex flex-col lg:flex-row gap-5">

                    {/* ── LEFT: Form ── */}
                    <div className="flex-1 min-w-0 space-y-5">

                        {/* Submission Details */}
                        <Section title="Submission Details">
                            {/* Row 1: Full Name */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <FieldLabel required>Full Name</FieldLabel>
                                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                                        placeholder="Full Name" style={inputStyle(errors.fullName)}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = errors.fullName ? C.coralBdr : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                                    <FieldError msg={errors.fullName} />
                                </div>
                            </div>

                            {/* Row 2: Mobile / Work Auth */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>Mobile Number</FieldLabel>
                                    <input value={form.mobileNumber} onChange={e => set('mobileNumber', e.target.value)}
                                        placeholder="Mobile Number" style={inputStyle(errors.mobileNumber)}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = errors.mobileNumber ? C.coralBdr : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                                    <FieldError msg={errors.mobileNumber} />
                                </div>
                                <div>
                                    <FieldLabel required>Work Authorization</FieldLabel>
                                    <select value={form.workAuthorization} onChange={e => set('workAuthorization', e.target.value)}
                                        style={selectStyle(errors.workAuthorization)}>
                                        <option value="" style={{ background: '#06091e' }}>Select</option>
                                        {WORK_AUTH.map(o => <option key={o} value={o} style={{ background: '#06091e' }}>{o}</option>)}
                                    </select>
                                    <FieldError msg={errors.workAuthorization} />
                                </div>
                            </div>

                            {/* Row 3: State / City / Zip */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <FieldLabel>State</FieldLabel>
                                    <select value={form.state} onChange={e => set('state', e.target.value)}
                                        style={selectStyle()}>
                                        <option value="" style={{ background: '#06091e' }}>Select</option>
                                        {US_STATES.map(o => <option key={o} value={o} style={{ background: '#06091e' }}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel required>City</FieldLabel>
                                    <input value={form.city} onChange={e => set('city', e.target.value)}
                                        placeholder="City" style={inputStyle(errors.city)}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = errors.city ? C.coralBdr : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                                    <FieldError msg={errors.city} />
                                </div>
                                <div>
                                    <FieldLabel>Zip Code</FieldLabel>
                                    <input value={form.zipCode} onChange={e => set('zipCode', e.target.value)}
                                        placeholder="Zip Code" style={inputStyle()}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                                </div>
                            </div>

                            {/* Row 4: Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>Email</FieldLabel>
                                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                        placeholder="your@email.com" style={inputStyle(errors.email)}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = errors.email ? C.coralBdr : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                                    <FieldError msg={errors.email} />
                                </div>
                                <div>
                                    <FieldLabel>Availability</FieldLabel>
                                    <input value={form.availability} onChange={e => set('availability', e.target.value)}
                                        placeholder="e.g. Immediate / 2 weeks" style={inputStyle()}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                                </div>
                            </div>

                            {/* Row 5: Relocation */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <FieldLabel>Relocation</FieldLabel>
                                    <div className="flex items-center gap-5 h-[42px]">
                                        {(['Yes', 'No'] as const).map(opt => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                <div onClick={() => set('relocation', opt)}
                                                    className="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-150"
                                                    style={{ border: `2px solid ${form.relocation === opt ? C.coral : 'rgba(255,255,255,0.2)'}`, background: form.relocation === opt ? C.coral : 'transparent' }}>
                                                    {form.relocation === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                                <span className="text-sm" style={{ color: form.relocation === opt ? '#e8eeff' : 'rgba(160,178,205,0.6)', fontFamily: GF }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Row 6: Video Link */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1">
                                    <FieldLabel>Video Link</FieldLabel>
                                    <input value={form.videoLink} onChange={e => set('videoLink', e.target.value)}
                                        placeholder="YouTube / LinkedIn video URL" style={inputStyle()}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                                </div>
                            </div>
                        </Section>

                        {/* Resume Upload */}
                        <Section title="Resume">
                            <label
                                className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all duration-200"
                                style={{ background: form.resume ? C.coralDim : 'rgba(255,255,255,0.02)', border: `1.5px dashed ${errors.resume ? C.coralBdr : form.resume ? C.coralBdr : 'rgba(255,87,88,0.2)'}` }}
                                onMouseEnter={e => { if (!form.resume) (e.currentTarget as HTMLElement).style.background = C.coralDim; }}
                                onMouseLeave={e => { if (!form.resume) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}>
                                {form.resume ? (
                                    <>
                                        <svg className="w-7 h-7 mb-2" style={{ color: C.coral }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm font-bold" style={{ color: '#FFB3B3', fontFamily: GF }}>{form.resume.name}</p>
                                        <p className="text-[11px] mt-1" style={{ color: 'rgba(160,178,205,0.4)', fontFamily: GF }}>Click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-7 h-7 mb-2" style={{ color: 'rgba(255,87,88,0.45)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-sm" style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                            <span style={{ color: '#FFB3B3', fontWeight: 700 }}>Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-[11px] mt-1" style={{ color: 'rgba(150,165,185,0.35)', fontFamily: GF }}>PDF, DOC, DOCX — max 5 MB</p>
                                    </>
                                )}
                                <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                                    onChange={e => {
                                        if (e.target.files?.[0]) {
                                            set('resume', e.target.files[0]);
                                        }
                                    }} />
                            </label>
                            <FieldError msg={errors.resume} />
                        </Section>

                        {/* Signature */}
                        <Section title="Signature">
                            {/* Type / Draw toggle */}
                            <div className="flex gap-4 mb-4">
                                {(['type', 'draw'] as const).map(opt => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => {
                                            set('signatureType', opt);
                                            // clear both fields on switch
                                            set('signatureText', '');
                                            set('signatureDataUrl', '');
                                        }}>
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-150"
                                            style={{ border: `2px solid ${form.signatureType === opt ? C.coral : 'rgba(255,255,255,0.2)'}`, background: form.signatureType === opt ? C.coral : 'transparent' }}>
                                            {form.signatureType === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-sm capitalize" style={{ color: form.signatureType === opt ? '#e8eeff' : 'rgba(160,178,205,0.6)', fontFamily: GF }}>
                                            {opt} Signature
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {/* Type mode */}
                            {form.signatureType === 'type' && (
                                <div>
                                    <FieldLabel required>Signature Text</FieldLabel>
                                    <input
                                        value={form.signatureText}
                                        onChange={e => set('signatureText', e.target.value)}
                                        placeholder="Type your full name as signature"
                                        style={{
                                            ...inputStyle(errors.signatureText),
                                            fontFamily: 'Georgia, serif',
                                            fontStyle: 'italic',
                                            fontSize: '1.15rem',
                                            letterSpacing: '0.02em',
                                        }}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = errors.signatureText ? C.coralBdr : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                    {form.signatureText && (
                                        <div className="mt-3 px-4 py-3 rounded-xl flex items-center gap-3"
                                            style={{ background: 'rgba(87,238,255,0.04)', border: '1px solid rgba(87,238,255,0.1)' }}>
                                            <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(160,178,205,0.4)', fontFamily: GF }}>Preview:</span>
                                            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.3rem', color: '#e8eeff', letterSpacing: '0.02em' }}>
                                                {form.signatureText}
                                            </span>
                                        </div>
                                    )}
                                    <FieldError msg={errors.signatureText} />
                                </div>
                            )}

                            {/* Draw mode */}
                            {form.signatureType === 'draw' && (
                                <div>
                                    <FieldLabel required>Draw Your Signature</FieldLabel>
                                    <SignatureCanvas
                                        hasError={!!errors.signatureText}
                                        onSave={(dataUrl) => {
                                            set('signatureDataUrl', dataUrl);
                                            if (errors.signatureText) setErrors(p => { const n = { ...p }; delete n.signatureText; return n; });
                                        }}
                                        onClear={() => set('signatureDataUrl', '')}
                                    />
                                    <FieldError msg={errors.signatureText} />
                                </div>
                            )}

                            {/* Terms */}
                            <div className="flex items-start gap-3 mt-4 p-4 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${errors.agreedToTerms ? C.coralBdr : 'rgba(255,255,255,0.07)'}` }}>
                                <div
                                    onClick={() => set('agreedToTerms', !form.agreedToTerms)}
                                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-all duration-150"
                                    style={{ background: form.agreedToTerms ? C.coral : 'rgba(255,255,255,0.04)', border: `1.5px solid ${form.agreedToTerms ? C.coral : 'rgba(255,255,255,0.18)'}`, boxShadow: form.agreedToTerms ? `0 0 10px ${C.coral}60` : 'none' }}>
                                    {form.agreedToTerms && (
                                        <svg className="w-3 h-3" style={{ color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: 'rgba(160,178,205,0.6)', fontFamily: GF }}>
                                    I agree to the{' '}
                                    <span className="font-semibold cursor-pointer" style={{ color: C.cyanText }}>
                                        terms and conditions
                                    </span>
                                    {' '}and certify that the information provided is accurate and complete.
                                </p>
                            </div>
                            <FieldError msg={errors.agreedToTerms} />
                        </Section>

                        {/* Submit button at bottom */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={onBack}
                                className="px-6 py-3 rounded-xl text-sm font-semibold"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(185,200,220,0.55)', fontFamily: GF }}>
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit} disabled={submitting}
                                className="px-10 py-3 rounded-xl text-sm font-black tracking-widest uppercase flex items-center gap-2"
                                style={{ background: submitting ? C.coralDim : `linear-gradient(135deg,${C.coral},#ff8181)`, color: submitting ? C.coral : '#fff', boxShadow: submitting ? 'none' : `0 0 28px ${C.coral}44`, cursor: submitting ? 'not-allowed' : 'pointer', border: submitting ? `1px solid ${C.coralBdr}` : 'none', fontFamily: GF }}>
                                {submitting
                                    ? <><span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: `${C.coral}33`, borderTopColor: C.coral }} /> Submitting…</>
                                    : 'Submit Application'}
                            </motion.button>
                        </div>
                    </div>

                    {/* ── RIGHT: Applying For sidebar ── */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="lg:sticky lg:top-6">
                            <div className="rounded-2xl overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                                <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 className="text-sm font-black" style={{ color: '#e8eeff', fontFamily: GF }}>
                                        Applying For
                                        <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: C.coralDim, color: C.coral, border: `1px solid ${C.coralBdr}` }}>
                                            {jobs.length} {jobs.length === 1 ? 'role' : 'roles'}
                                        </span>
                                    </h3>
                                </div>
                                <div className="px-5 py-3 space-y-2">
                                    {jobs.map((job, i) => (
                                        <div key={job.job_code} className="flex items-center gap-3 py-2"
                                            style={{ borderBottom: i < jobs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-black"
                                                style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: C.coral, fontFamily: GF }}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-bold leading-snug truncate" style={{ color: '#e8eeff', fontFamily: GF }}>{job.job_title}</p>
                                                <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(87,238,255,0.5)' }}>{job.job_code}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ── Signature Canvas ─────────────────────────────────────────────────────────
const SignatureCanvas = ({
    hasError, onSave, onClear,
}: {
    hasError: boolean;
    onSave: (dataUrl: string) => void;
    onClear: () => void;
}) => {
    const canvasRef  = useRef<HTMLCanvasElement>(null);
    const drawing    = useRef(false);
    const [hasStrokes, setHasStrokes] = useState(false);
    const hasStrokesRef = useRef(false);
    const lastPos    = useRef<{ x: number; y: number } | null>(null);

    // Size canvas correctly after layout
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const init = () => {
            const w = canvas.parentElement?.offsetWidth ?? 600;
            canvas.width  = w;
            canvas.height = 140;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        // slight delay so layout is complete
        const t = setTimeout(init, 50);
        return () => clearTimeout(t);
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    };

    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        drawing.current = true;
        const canvas = canvasRef.current!;
        lastPos.current = getPos(e, canvas);
    }, []);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!drawing.current) return;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const pos = getPos(e, canvas);

        ctx.beginPath();
        ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = '#e8eeff';
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.stroke();

        lastPos.current = pos;
        if (!hasStrokesRef.current) {
            hasStrokesRef.current = true;
            setHasStrokes(true);
        }
    }, []);

    const endDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!drawing.current) return;
        drawing.current = false;
        if (hasStrokesRef.current) {
            onSave(canvasRef.current!.toDataURL('image/png'));
        }
    }, [onSave]);

    const clear = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasStrokesRef.current = false;
        setHasStrokes(false);
        lastPos.current = null;
        onClear();
    };

    return (
        <div>
            <div className="relative rounded-xl overflow-hidden"
                style={{ border: `1.5px solid ${hasError ? C.coralBdr : 'rgba(255,255,255,0.12)'}`, cursor: 'crosshair' }}>
                <canvas
                    ref={canvasRef}
                    style={{ display: 'block', width: '100%', height: 140, touchAction: 'none' }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                />
                {!hasStrokes && (
                    <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
                        style={{ color: 'rgba(160,178,205,0.2)', fontFamily: GF }}>
                        Sign here
                    </p>
                )}
            </div>
            <div className="flex items-center justify-between mt-2">
                <p className="text-[11px]" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>
                    Use mouse or finger to draw your signature
                </p>
                <button type="button" onClick={clear}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-150"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(160,178,205,0.5)', fontFamily: GF }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.coral; (e.currentTarget as HTMLElement).style.borderColor = C.coralBdr; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(160,178,205,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'; }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                </button>
            </div>
        </div>
    );
};

// ── Helper sub-components ────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-base font-black" style={{ color: '#e8eeff', fontFamily: GF }}>{title}</h2>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
);

const DetailRow = ({ icon, label, value, accent, mono }: { icon: string; label: string; value: string; accent?: boolean; mono?: boolean }) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(87,238,255,0.05)', border: '1px solid rgba(87,238,255,0.1)' }}>
            <svg className="w-3.5 h-3.5" style={{ color: '#7ED6E6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
            </svg>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>{label}</p>
            <p className="text-[13px] font-semibold truncate"
                style={{ color: accent ? '#a3e8f0' : 'rgba(200,215,235,0.8)', fontFamily: mono ? 'monospace' : GF }}>
                {value}
            </p>
        </div>
    </div>
);

export default ApplyView;

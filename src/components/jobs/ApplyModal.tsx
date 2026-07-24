"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SelectedJob } from "./types";

const WORK_AUTH = ["US Citizen", "Green Card", "H1B", "H4 EAD", "OPT", "CPT", "TN Visa", "E3 Visa", "L2 EAD", "Other"];
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
  "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
  "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
  "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

interface FormState {
  fullName: string;
  email: string;
  mobileNumber: string;
  workAuthorization: string;
  state: string;
  city: string;
  zipCode: string;
  availability: string;
  relocation: "Yes" | "No";
  videoLink: string;
  signatureType: "type" | "draw";
  signatureText: string;
  signatureDataUrl: string;
  agreedToTerms: boolean;
  resume: File | null;
}

const defaultForm = (): FormState => ({
  fullName: "",
  email: "",
  mobileNumber: "",
  workAuthorization: "",
  state: "",
  city: "",
  zipCode: "",
  availability: "",
  relocation: "No",
  videoLink: "",
  signatureType: "type",
  signatureText: "",
  signatureDataUrl: "",
  agreedToTerms: false,
  resume: null,
});

const inputClass =
  "mt-1 w-full rounded-md border px-3 py-2 text-sm text-navy focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel";

function fieldBorder(hasError?: string) {
  return hasError ? "border-red-400" : "border-navy/20";
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

interface ApplyModalProps {
  jobs: SelectedJob[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ jobs, onClose, onSuccess }: ApplyModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.mobileNumber.trim() || !/^\d{7,15}$/.test(form.mobileNumber.replace(/[\s\-()]/g, "")))
      e.mobileNumber = "Valid phone number required";
    if (!form.workAuthorization) e.workAuthorization = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.resume) e.resume = "Resume required";
    if (form.signatureType === "type" && !form.signatureText.trim()) e.signatureText = "Please type your signature";
    if (form.signatureType === "draw" && !form.signatureDataUrl) e.signatureText = "Please draw your signature";
    if (!form.agreedToTerms) e.agreedToTerms = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      fd.append("mobileNumber", form.mobileNumber);
      fd.append("workAuthorization", form.workAuthorization);
      fd.append("state", form.state);
      fd.append("city", form.city);
      fd.append("zipCode", form.zipCode);
      fd.append("availability", form.availability);
      fd.append("relocation", form.relocation);
      fd.append("videoLink", form.videoLink);
      fd.append("signatureText", form.signatureType === "type" ? form.signatureText : "[Drawn Signature]");
      fd.append("signatureDataUrl", form.signatureDataUrl);
      fd.append("jobs", JSON.stringify(jobs));
      if (form.resume) fd.append("resume", form.resume);

      const res = await fetch("/api/apply", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: "Application submitted successfully! We'll be in touch soon." });
        setTimeout(() => onSuccess(), 2000);
      } else {
        setStatus({ type: "error", message: data.error || "Submission failed. Please try again." });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const jobLabel = jobs.length === 1 ? jobs[0].job_title : `${jobs.length} positions`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-navy/60 px-4 py-8 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(0,48,96,0.5)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-navy/10 px-6 py-5 sm:px-8">
          <div>
            <h3 className="text-lg font-bold text-navy">Apply for {jobLabel}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {jobs.map((job) => (
                <span key={job.job_code} className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy">
                  {job.job_title}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-navy/50 hover:bg-mist hover:text-navy"
          >
            &times;
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6 sm:px-8">
          {status && (
            <div
              className={`mb-5 rounded-lg p-4 text-sm font-medium ${
                status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              {status.message}
            </div>
          )}

          {status?.type !== "success" && (
            <div className="space-y-6">
              {/* Applicant details */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-navy/50">Your details</h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      className={`${inputClass} ${fieldBorder(errors.fullName)}`}
                    />
                    <FieldError msg={errors.fullName} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy">
                      Mobile number <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.mobileNumber}
                      onChange={(e) => set("mobileNumber", e.target.value)}
                      className={`${inputClass} ${fieldBorder(errors.mobileNumber)}`}
                    />
                    <FieldError msg={errors.mobileNumber} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={`${inputClass} ${fieldBorder(errors.email)}`}
                    />
                    <FieldError msg={errors.email} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy">
                      Work authorization <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.workAuthorization}
                      onChange={(e) => set("workAuthorization", e.target.value)}
                      className={`${inputClass} ${fieldBorder(errors.workAuthorization)}`}
                    >
                      <option value="">Select</option>
                      {WORK_AUTH.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    <FieldError msg={errors.workAuthorization} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy">Availability</label>
                    <input
                      value={form.availability}
                      onChange={(e) => set("availability", e.target.value)}
                      placeholder="e.g. Immediate / 2 weeks"
                      className={`${inputClass} border-navy/20`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy">State</label>
                    <select
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      className={`${inputClass} border-navy/20`}
                    >
                      <option value="">Select</option>
                      {US_STATES.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className={`${inputClass} ${fieldBorder(errors.city)}`}
                    />
                    <FieldError msg={errors.city} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy">Zip code</label>
                    <input
                      value={form.zipCode}
                      onChange={(e) => set("zipCode", e.target.value)}
                      className={`${inputClass} border-navy/20`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy">Relocation</label>
                    <div className="mt-2 flex items-center gap-5">
                      {(["Yes", "No"] as const).map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-sm text-navy/80">
                          <input
                            type="radio"
                            name="relocation"
                            checked={form.relocation === opt}
                            onChange={() => set("relocation", opt)}
                            className="h-4 w-4 border-navy/30 text-steel focus:ring-steel"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy">Video link (optional)</label>
                    <input
                      value={form.videoLink}
                      onChange={(e) => set("videoLink", e.target.value)}
                      placeholder="YouTube / LinkedIn video URL"
                      className={`${inputClass} border-navy/20`}
                    />
                  </div>
                </div>
              </div>

              {/* Resume */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-navy/50">Resume</h4>
                <label
                  className={`mt-3 flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors ${
                    errors.resume ? "border-red-300 bg-red-50/40" : "border-navy/20 bg-mist/60 hover:border-steel"
                  }`}
                >
                  {form.resume ? (
                    <>
                      <p className="text-sm font-semibold text-navy">{form.resume.name}</p>
                      <p className="mt-1 text-xs text-navy/50">Click to change</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-navy/70">
                        <span className="font-semibold text-navy">Click to upload</span> or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-navy/40">PDF, DOC, DOCX — max 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) set("resume", e.target.files[0]);
                    }}
                  />
                </label>
                <FieldError msg={errors.resume} />
              </div>

              {/* Signature */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-navy/50">Signature</h4>
                <div className="mt-3 flex gap-5">
                  {(["type", "draw"] as const).map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm capitalize text-navy/80">
                      <input
                        type="radio"
                        name="signatureType"
                        checked={form.signatureType === opt}
                        onChange={() => {
                          set("signatureType", opt);
                          set("signatureText", "");
                          set("signatureDataUrl", "");
                        }}
                        className="h-4 w-4 border-navy/30 text-steel focus:ring-steel"
                      />
                      {opt} signature
                    </label>
                  ))}
                </div>

                {form.signatureType === "type" ? (
                  <div className="mt-3">
                    <input
                      value={form.signatureText}
                      onChange={(e) => set("signatureText", e.target.value)}
                      placeholder="Type your full name as signature"
                      className={`${inputClass} ${fieldBorder(errors.signatureText)} font-serif italic`}
                    />
                    <FieldError msg={errors.signatureText} />
                  </div>
                ) : (
                  <div className="mt-3">
                    <SignatureCanvas
                      hasError={!!errors.signatureText}
                      onSave={(dataUrl) => set("signatureDataUrl", dataUrl)}
                      onClear={() => set("signatureDataUrl", "")}
                    />
                    <FieldError msg={errors.signatureText} />
                  </div>
                )}

                <label className="mt-4 flex items-start gap-3 rounded-lg bg-mist/60 p-4 text-sm text-navy/80">
                  <input
                    type="checkbox"
                    checked={form.agreedToTerms}
                    onChange={(e) => set("agreedToTerms", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-navy/30 text-steel focus:ring-steel"
                  />
                  <span>
                    I agree to the terms and conditions and certify that the information provided is accurate and
                    complete.
                  </span>
                </label>
                <FieldError msg={errors.agreedToTerms} />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 border-t border-navy/10 px-6 py-5 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
          >
            {status?.type === "success" ? "Close" : "Cancel"}
          </button>
          {status?.type !== "success" && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-navy px-7 py-2.5 text-sm font-semibold text-white hover:bg-navy-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SignatureCanvas({
  hasError,
  onSave,
  onClear,
}: {
  hasError: boolean;
  onSave: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStrokesRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const t = setTimeout(() => {
      const width = canvas.parentElement?.offsetWidth ?? 600;
      canvas.width = width;
      canvas.height = 140;
    }, 50);
    return () => clearTimeout(t);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    if (canvas) lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#003060";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPos.current = pos;
    if (!hasStrokesRef.current) {
      hasStrokesRef.current = true;
      setHasStrokes(true);
    }
  }, []);

  const endDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!drawing.current) return;
      drawing.current = false;
      if (hasStrokesRef.current && canvasRef.current) {
        onSave(canvasRef.current.toDataURL("image/png"));
      }
    },
    [onSave]
  );

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokesRef.current = false;
    setHasStrokes(false);
    lastPos.current = null;
    onClear();
  };

  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-lg border-2 ${hasError ? "border-red-300" : "border-navy/20"}`}
        style={{ cursor: "crosshair" }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full bg-mist/40"
          style={{ height: 140, touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasStrokes && (
          <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-sm text-navy/30">
            Sign here
          </p>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-navy/50">Use your mouse or finger to draw your signature</p>
        <button
          type="button"
          onClick={clear}
          className="rounded-md border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy/60 hover:border-navy/40 hover:text-navy"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

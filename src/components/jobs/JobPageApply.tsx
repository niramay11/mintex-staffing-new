"use client";

import { useState, type ReactNode } from "react";
import ApplyModal from "./ApplyModal";
import type { SelectedJob } from "./types";

const defaultClassName =
  "inline-flex items-center justify-center gap-2 rounded-full bg-tan px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-tan-light";

export default function JobPageApply({
  job,
  className = defaultClassName,
  children = "Apply for this role",
}: {
  job: SelectedJob;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <ApplyModal jobs={[job]} onClose={() => setOpen(false)} onSuccess={() => setOpen(false)} />}
    </>
  );
}

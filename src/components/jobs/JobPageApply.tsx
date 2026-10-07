"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import ApplyModal from "./ApplyModal";
import type { SelectedJob } from "./types";
import { PRIMARY_BUTTON } from "@/components/ui/Button";

const defaultClassName = `${PRIMARY_BUTTON} gap-2`;

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
      {/* Portaled to <body>: this button can sit inside a card that uses a
          CSS transform (e.g. JobCard's hover lift), and a transformed
          ancestor makes the modal's position: fixed relative to that card
          instead of the viewport — the form rendered squeezed inside it. */}
      {open &&
        createPortal(
          <ApplyModal jobs={[job]} onClose={() => setOpen(false)} onSuccess={() => setOpen(false)} />,
          document.body
        )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import JobAlertModal from "./JobAlertModal";

// Opens the same job alert modal the job board's own "Create job alert"
// button uses, for CTAs that sit outside the board.
export default function JobAlertButton({
  variant = "primary",
  className = "",
  children = "Create a job alert",
}: {
  variant?: "primary" | "outline" | "secondary";
  className?: string;
  children?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant={variant} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      {open && <JobAlertModal onClose={() => setOpen(false)} />}
    </>
  );
}

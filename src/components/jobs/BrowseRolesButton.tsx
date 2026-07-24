"use client";

import { Button } from "@/components/ui/Button";

// Scrolls to the Apply to Jobs section without adding a #hash to the URL
// (a plain <a href="#apply-to-jobs"> link used to leave the address bar
// showing /get-hired#apply-to-jobs).
export default function BrowseRolesButton() {
  return (
    <Button
      type="button"
      variant="primary"
      onClick={() => document.getElementById("apply-to-jobs")?.scrollIntoView({ behavior: "smooth" })}
    >
      Browse Open Roles
    </Button>
  );
}

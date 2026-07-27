"use client";

import { useEffect } from "react";

export default function ScrollToSection({ id }: { id: string }) {
  useEffect(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, [id]);

  return null;
}

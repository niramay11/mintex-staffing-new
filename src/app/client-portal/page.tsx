import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import PortalClient from "./PortalClient";
import { getSiteImages } from "@/lib/siteImages";
import { verifySession } from "@/lib/portal-auth";
import { getPortalJobsForClient } from "@/lib/portalJobsCache";
import { withTimeout } from "@/lib/withTimeout";

export const metadata: Metadata = {
  title: "Client Portal",
  description: "Sign in to view your job postings, submissions, and placements with Mintex Staffing.",
  robots: { index: false, follow: false },
};

// Everything that depends on cookies()/Ceipal lives in here, isolated behind
// its own Suspense boundary below — so the route itself resolves instantly
// instead of the browser sitting on a blank tab until auth + jobs finish.
async function PortalDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("portal_token")?.value;

  const [siteImages, client] = await Promise.all([
    getSiteImages(),
    verifySession(token ?? ""),
  ]);

  // Warm cache → near-instant. Cold cache → give up after 3s so the page
  // still opens quickly; `undefined` tells PortalClient to fall back to its
  // own client-side fetch (with a spinner), same as if nothing had been
  // prefetched at all. An empty-but-defined array (a real "you have zero
  // jobs" answer that arrived in time) is left alone — that's authoritative.
  const jobs = client
    ? await withTimeout(getPortalJobsForClient(client).then((r) => r.results), 3000, undefined)
    : undefined;

  return <PortalClient siteImages={siteImages} initialClient={client} initialJobs={jobs} />;
}

function PortalSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy/15 border-t-steel" />
    </div>
  );
}

export default function ClientPortalPage() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <PortalDashboard />
    </Suspense>
  );
}

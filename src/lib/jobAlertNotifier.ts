import { getAllJobs } from "@/lib/data-cache";
import { supabaseAdmin } from "@/lib/supabase";
import { sendJobAlertDigest } from "@/lib/mailer";

interface JobAlertRow {
  id: string;
  email: string;
  keyword: string | null;
  location: string | null;
  unsubscribe_token: string;
}

function matches(needle: string | null, haystacks: string[]): boolean {
  const term = needle?.trim().toLowerCase();
  if (!term) return true;
  return haystacks.some((h) => h.toLowerCase().includes(term));
}

let running = false;

// Diffs the live Ceipal job list against the job_alert_seen_jobs snapshot to find
// newly-posted jobs, then emails every active job_alerts subscriber whose
// keyword/location filters match. The first-ever run only seeds the snapshot —
// it never emails, since every existing job would otherwise look "new".
export async function checkForNewJobsAndNotify(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const jobs = await getAllJobs();
    const codes = jobs
      .map((j) => String(j.job_code ?? ""))
      .filter(Boolean);
    if (codes.length === 0) return;

    const { data: seenRows, error: seenErr } = await supabaseAdmin
      .from("job_alert_seen_jobs")
      .select("job_code");
    if (seenErr) {
      console.error("[job-alerts] failed to read seen jobs:", seenErr.message);
      return;
    }

    const seen = new Set((seenRows ?? []).map((r) => r.job_code as string));
    const firstRun = seen.size === 0;
    const newCodes = codes.filter((c) => !seen.has(c));

    if (newCodes.length > 0) {
      const { error: upsertErr } = await supabaseAdmin
        .from("job_alert_seen_jobs")
        .upsert(newCodes.map((job_code) => ({ job_code })), { onConflict: "job_code", ignoreDuplicates: true });
      if (upsertErr) console.error("[job-alerts] failed to record seen jobs:", upsertErr.message);
    }

    if (firstRun) {
      console.log(`[job-alerts] first run — seeded ${newCodes.length} existing jobs, no emails sent`);
      return;
    }
    if (newCodes.length === 0) return;

    const newJobs = jobs.filter((j) => newCodes.includes(String(j.job_code ?? "")));

    const { data: alerts, error: alertsErr } = await supabaseAdmin
      .from("job_alerts")
      .select("id, email, keyword, location, unsubscribe_token")
      .eq("is_active", true);
    if (alertsErr) {
      console.error("[job-alerts] failed to read alerts:", alertsErr.message);
      return;
    }
    if (!alerts || alerts.length === 0) return;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mintexstaffing.com";

    for (const alert of alerts as JobAlertRow[]) {
      const matchedJobs = newJobs.filter((job) =>
        matches(alert.keyword, [String(job.job_title ?? ""), String(job.primary_skills ?? "")]) &&
        matches(alert.location, [String(job.location ?? ""), String(job.city ?? ""), String(job.states ?? "")])
      );
      if (matchedJobs.length === 0) continue;

      const unsubscribeUrl = `${siteUrl}/api/job-alerts/unsubscribe?token=${alert.unsubscribe_token}`;
      try {
        await sendJobAlertDigest(
          alert.email,
          matchedJobs.map((job) => ({
            job_title: String(job.job_title ?? "Untitled role"),
            location: String(job.location ?? job.city ?? ""),
            job_code: String(job.job_code ?? ""),
          })),
          unsubscribeUrl
        );
      } catch (err) {
        console.error(`[job-alerts] failed to email ${alert.email}:`, err);
      }
    }

    console.log(`[job-alerts] notified subscribers about ${newJobs.length} new job(s)`);
  } catch (err) {
    console.error("[job-alerts] check failed:", err);
  } finally {
    running = false;
  }
}

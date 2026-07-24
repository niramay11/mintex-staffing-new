import { ceipalFetch } from './ceipal';

const V2_JOBS_URL = 'https://api.ceipal.com/v2/getJobPostingsList/';

type JobMap  = Record<string, string>;                  // job_code → v2 id
type JobData = Record<string, unknown>;

// Shared caches — built once, reused by admin + portal routes
let mapCache:  { map:  JobMap;     at: number } | null = null;
let dataCache: { jobs: JobData[];  at: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

function normalise(j: JobData): JobData {
  return {
    ...j,
    job_title:           j.position_title    ?? j.job_title      ?? '',
    job_code:            j.job_code          ?? '',
    job_status:          j.job_status        ?? '',
    job_type:            j.employment_type   ?? j.job_type       ?? '',
    city:                j.primary_city      ?? j.city           ?? '',
    states:              j.primary_state     ?? j.states         ?? '',
    country:             j.country           ?? '',
    number_of_positions: j.number_of_positions ?? '',
    primary_skills:      j.skills            ?? j.primary_skills ?? '',
    pay_rate___salary:   Array.isArray(j.pay_rates) && (j.pay_rates as JobData[]).length > 0
                           ? String((j.pay_rates as JobData[])[0].pay_rate ?? '')
                           : String(j.pay_rate___salary ?? ''),
    job_start_date:      j.job_start_date    ?? '',
    job_end_date:        j.job_end_date      ?? '',
    work_authorization:  j.work_authorization ?? '',
    tax_terms:           j.tax_terms         ?? '',
    remote_job:          j.remote_opportunities ?? j.remote_job  ?? '',
    industry:            j.industry          ?? '',
    job_description:     j.requisition_description ?? j.public_job_desc ?? '',
    client:              j.client            ?? '',
    duration:            j.duration          ?? '',
    experience:          j.experience        ?? '',
  };
}

async function fetchAll(): Promise<JobData[]> {
  const all: JobData[] = [];
  let nextUrl: string | null = `${V2_JOBS_URL}?paging_length=100&page=1`;

  while (nextUrl) {
    const res = await ceipalFetch(nextUrl);
    if (!res.ok) break;
    const data = await res.json();
    const results: JobData[] = Array.isArray(data?.results)
      ? data.results : Array.isArray(data) ? data : [];
    if (results.length === 0) break;
    all.push(...results.map(normalise));
    nextUrl = typeof data?.next === 'string' && data.next ? data.next : null;
  }
  return all;
}

// Returns job_code → v2 encoded id map (used for detail/submissions API)
export async function getJobMap(): Promise<JobMap> {
  if (mapCache && Date.now() < mapCache.at + CACHE_TTL) return mapCache.map;
  const jobs = await getV2Jobs();
  const map: JobMap = {};
  for (const j of jobs) {
    const code = String(j.job_code ?? '').trim();
    const id   = String(j.id ?? '').trim();
    if (code && id) map[code] = id;
  }
  mapCache = { map, at: Date.now() };
  return map;
}

// Returns full normalised V2 job list (shared cache for admin + portal)
export async function getV2Jobs(): Promise<JobData[]> {
  if (dataCache && Date.now() < dataCache.at + CACHE_TTL) return dataCache.jobs;
  const jobs = await fetchAll();
  dataCache = { jobs, at: Date.now() };
  return jobs;
}

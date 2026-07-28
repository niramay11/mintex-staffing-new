// Shape of a job record as returned by the Ceipal-backed `/api/jobs` route.
// Field names mirror Ceipal's raw API response, so they intentionally use
// snake_case / Ceipal's own naming (job_code, pay_rate___salary, etc).
export interface CeipalJob {
  job_code: string;
  job_title: string;
  client?: string;
  city?: string;
  states?: string;
  zip_code?: string;
  country?: string;
  location?: string;
  pay_rate___salary?: string;
  career_portal_published_date?: string;
  job_type?: string;
  job_status?: string;
  job_end_date?: string;
  number_of_positions?: string | number;
  remote_job?: string;
  experience?: string;
  primary_skills?: string;
  job_description?: string;
  public_job_description?: string;
  industry?: string;
  work_authorization?: string;
  // Ceipal's "Modified" timestamp, used to decide whether a job is stale.
  Modified?: string;
  modified?: string;
}

export interface SelectedJob {
  job_code: string;
  job_title: string;
  location: string;
  pay_rate: string;
}

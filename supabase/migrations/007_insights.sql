-- Insights articles (career / market / trends). Fully admin-managed via
-- /api/admin/insights — public read is used by the /insights pages + sitemap.
CREATE TABLE IF NOT EXISTS insights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  category      TEXT NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL,
  body          TEXT[] NOT NULL DEFAULT '{}',
  published_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  author        TEXT NOT NULL DEFAULT 'Mintex Staffing Editorial',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read insights" ON insights
  FOR SELECT USING (true);

CREATE TRIGGER insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed with the posts that were previously hardcoded in src/content/insights.ts
INSERT INTO insights (slug, category, title, excerpt, body, published_at, author) VALUES
(
  'how-to-negotiate-your-next-offer', 'career',
  'How to Negotiate Your Next Job Offer With Confidence',
  $x$Salary is only one lever. Here's how to evaluate and negotiate the whole offer, not just the base number.$x$,
  ARRAY[
    $p$Most candidates focus their entire negotiation on base salary, and leave value on the table elsewhere. A strong offer conversation covers base, bonus structure, equity, signing bonus, remote flexibility, and start date all together.$p$,
    $p$Before you respond to an offer, research market range for the role and region, and come with a number backed by data, not a gut feeling.$p$,
    $p$Always negotiate in writing where possible, and ask for 24-48 hours to review any offer before you respond, even if you're excited.$p$
  ],
  '2026-06-10', 'Mintex Staffing Editorial'
),
(
  'resume-mistakes-that-cost-you-interviews', 'career',
  '5 Resume Mistakes That Are Costing You Interviews',
  $x$Recruiters scan a resume in seconds. These are the most common issues that get otherwise-qualified candidates screened out.$x$,
  ARRAY[
    $p$Generic objective statements, unquantified accomplishments, and inconsistent formatting are the top reasons a strong candidate gets passed over.$p$,
    $p$Lead every bullet with an outcome, not a task: what changed because you did the work?$p$,
    $p$Tailor your top third of the resume to the specific role, that's the part a recruiter actually reads closely.$p$
  ],
  '2026-05-28', 'Mintex Staffing Editorial'
),
(
  '2026-hiring-trends-outlook', 'market',
  '2026 Hiring Trends: What Employers Need to Watch',
  $x$From AI-assisted screening to skills-based hiring, here's what's actually changing how companies hire this year.$x$,
  ARRAY[
    $p$Skills-based hiring continues to displace degree requirements across technical and administrative roles alike.$p$,
    $p$AI-assisted screening tools are speeding up top-of-funnel review, but companies that lean on them exclusively risk losing strong non-traditional candidates.$p$,
    $p$Contract-to-hire engagements are up across nearly every industry we serve, as employers de-risk headcount decisions in an uncertain macro environment.$p$
  ],
  '2026-06-30', 'Mintex Staffing Research Team'
),
(
  'cost-of-a-bad-hire', 'market',
  'The Real Cost of a Bad Hire (It''s Higher Than You Think)',
  $x$Turnover costs go far beyond a recruiting fee. Here's how to actually calculate the impact of a mis-hire.$x$,
  ARRAY[
    $p$A bad hire's true cost includes lost productivity, team disruption, retraining time, and the opportunity cost of the role sitting unfilled again.$p$,
    $p$Most estimates put the fully-loaded cost of a bad hire at 1.5x to 3x annual salary depending on seniority.$p$,
    $p$Structured interviews and reference checks that focus on past behavior, not hypotheticals, meaningfully reduce mis-hire risk.$p$
  ],
  '2026-05-12', 'Mintex Staffing Research Team'
),
(
  'remote-hiring-still-growing', 'trends',
  'Remote Hiring Isn''t Slowing Down, It''s Specializing',
  $x$Blanket return-to-office mandates are giving way to role-by-role remote policies. Here's what that means for hiring.$x$,
  ARRAY[
    $p$Rather than an all-or-nothing office policy, more employers are making remote-eligibility a role-level decision based on collaboration needs.$p$,
    $p$Candidates increasingly filter job searches by remote eligibility first, meaning ambiguous remote policy in a job post costs you qualified applicants.$p$,
    $p$Clearly stating your remote/hybrid/onsite policy in the first line of a job description measurably improves application quality.$p$
  ],
  '2026-06-05', 'Mintex Staffing Research Team'
),
(
  'building-a-talent-pipeline-before-you-need-it', 'trends',
  'Why the Best Companies Build Talent Pipelines Before They Need Them',
  $x$Reactive hiring is expensive hiring. Here's how leading employers stay ahead of their next headcount need.$x$,
  ARRAY[
    $p$Companies that maintain warm relationships with past candidates and silver-medalists fill roles faster and cheaper than those starting from zero every time.$p$,
    $p$A quarterly check-in cadence with your staffing partner keeps your pipeline warm even between active searches.$p$,
    $p$Track time-to-fill by role type over time, if it's creeping up, that's a signal to invest in pipeline building now, not after the next resignation.$p$
  ],
  '2026-04-22', 'Mintex Staffing Research Team'
)
ON CONFLICT (slug) DO NOTHING;

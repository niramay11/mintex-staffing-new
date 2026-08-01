-- "Industries We Serve" pages, fully admin-managed via /api/admin/industries.
-- Previously hardcoded in src/content/industries.ts; migrated so new industries
-- can be added (and existing ones edited) from the admin panel's "Industries" tab.
-- Existing 9 rows are seeded below (dollar-quoted so none of the long prose
-- needs manual apostrophe escaping) so the live site is unaffected on migration.
CREATE TABLE IF NOT EXISTS industries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  hero_title            TEXT NOT NULL,
  seo_subheading        TEXT NOT NULL,
  intro                 TEXT NOT NULL,
  sector_insight_title  TEXT NOT NULL,
  sector_insight_body   TEXT NOT NULL,
  work_style            TEXT NOT NULL,
  job_keywords          TEXT[] NOT NULL DEFAULT '{}',
  faqs                  JSONB NOT NULL DEFAULT '[]',
  typical_roles         TEXT NOT NULL DEFAULT '',
  vetting_process       TEXT NOT NULL DEFAULT '',
  market_context        TEXT NOT NULL DEFAULT '',
  engagement_models     TEXT NOT NULL DEFAULT '',
  sort_order            INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read industries" ON industries
  FOR SELECT USING (true);

CREATE TRIGGER industries_updated_at
  BEFORE UPDATE ON industries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO industries (
  slug, name, hero_title, seo_subheading, intro, sector_insight_title, sector_insight_body,
  work_style, job_keywords, faqs, typical_roles, vetting_process, market_context, engagement_models, sort_order
) VALUES
(
  $$it-staffing$$,
  $$IT Staffing$$,
  $$Hire Top IT Talent$$,
  $$Connect with vetted software engineers, cloud architects, and IT project leaders ready to move your technology roadmap forward.$$,
  $$From full-stack developers to DevOps specialists and cloud infrastructure engineers, our IT staffing pool is screened for both technical depth and delivery track record. Based in Edison, New Jersey, Mintex Staffing places software engineers, cloud architects, IT project managers and more with employers throughout the state and beyond, for contract, permanent, and contract-to-hire roles.$$,
  $$The IT hiring market is tightening around specialized skills$$,
  $$Demand for cloud-native, AI/ML, and cybersecurity talent continues to outpace supply. Employers who move fast on vetted candidates and offer flexible engagement models (contract, contract-to-hire, permanent) are winning the best talent before competitors even finish their first interview loop.$$,
  $$We embed with your engineering leadership to understand your stack, team culture, and delivery cadence before we ever send a resume.$$,
  ARRAY[$$software engineer$$,$$software developer$$,$$full stack$$,$$full-stack$$,$$front end$$,$$frontend$$,$$back end$$,$$backend$$,$$devops$$,$$cloud$$,$$aws$$,$$azure$$,$$network engineer$$,$$systems administrator$$,$$sysadmin$$,$$it project manager$$,$$qa engineer$$,$$data engineer$$,$$data scientist$$,$$cybersecurity$$,$$help desk$$,$$it support$$,$$solutions engineer$$,$$servicenow$$,$$web developer$$,$$.net$$,$$java developer$$,$$python developer$$,$$sql developer$$,$$database administrator$$,$$ai engineer$$,$$machine learning$$,$$react$$,$$node.js$$,$$nodejs$$,$$angular$$,$$programmer$$,$$it analyst$$,$$technology analyst$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$How quickly can Mintex Staffing fill an IT role?$$, 'answer', $$Our average time to hire is 9 days, drawing from an active, pre-vetted technical talent network.$$),
    jsonb_build_object('question', $$What IT roles do you typically staff?$$, 'answer', $$Software engineers, DevOps and cloud specialists, QA engineers, data engineers, IT project managers, and more, across contract, contract-to-hire, and permanent placements.$$),
    jsonb_build_object('question', $$Do you screen for technical skill or just resume experience?$$, 'answer', $$Both. Candidates are vetted for technical depth and a track record of shipping real projects, not just keyword matches on a resume.$$),
    jsonb_build_object('question', $$Can I hire on a contract basis and convert to full-time later?$$, 'answer', $$Yes. Many contract placements are structured with a clear path to permanent hire once both sides confirm it's the right fit.$$)
  ),
  $$Our IT staffing bench spans the full technology stack: full-stack and back-end developers working in Java, .NET, Python, and Node.js; front-end engineers building in React and Angular; DevOps and cloud engineers running AWS and Azure infrastructure; QA engineers and data engineers keeping releases reliable and data pipelines clean; and IT project managers who can actually read a Gantt chart and a stand-up. We also place more specialized roles as they come up: cybersecurity analysts, machine learning and AI engineers, database administrators, and ServiceNow specialists. Whether you need one contract developer to cover parental leave or a five-person pod to stand up a new platform, the same screening bar applies.$$,
  $$Every technical candidate goes through a structured screen before you ever see a resume: we verify hands-on experience with the specific stack you're hiring for, not just keyword-matching a LinkedIn profile, confirm delivery history on real production systems, and check communication skill, because the best engineer on paper is useless if they can't work with your team. For contract and contract-to-hire roles, we also confirm availability and notice-period realism up front, so you're not three weeks into a search only to find out your top candidate can't start for two months.$$,
  $$Demand for cloud-native, AI/ML, and cybersecurity talent continues to outpace the available supply, and that gap shows up fastest in time-to-fill: teams that wait on a "perfect on paper" candidate often lose them to a faster-moving offer. Our average time to hire is 9 days across the roles we staff, which is only possible because our active technical talent network is pre-screened before your req even opens, not after.$$,
  $$We staff IT roles as contract, contract-to-hire, or direct permanent placements, so the engagement model fits the actual shape of the work, not a one-size-fits-all default. A short-term migration project doesn't need a full-time hire; a core platform team lead usually does. Many of our contract placements convert to permanent once both sides confirm it's the right long-term fit, with no separate re-hiring process required.$$,
  0
),
(
  $$healthcare-staffing$$,
  $$Healthcare Staffing$$,
  $$Hire Top Healthcare Talent$$,
  $$Credentialed nurses, allied health professionals, and healthcare administrators, matched fast without compromising compliance.$$,
  $$We handle license verification, credentialing, and compliance checks up front so your clinical teams can focus on patient care. Headquartered in Edison, NJ, we support healthcare facilities across New Jersey.$$,
  $$Staffing shortages remain the top operational risk in healthcare$$,
  $$Facilities that build a reliable pool of pre-credentialed contract and per-diem staff are avoiding costly agency premiums and last-minute shift gaps. A proactive staffing partner is now table stakes, not a nice-to-have.$$,
  $$Our clinical recruiting team understands shift patterns, credentialing timelines, and facility compliance requirements inside and out.$$,
  ARRAY[$$nurse$$,$$ rn $$,$$rn -$$,$$rn –$$,$$registered nurse$$,$$clinical$$,$$medical$$,$$healthcare$$,$$hospital$$,$$patient$$,$$pharmacy$$,$$physician$$,$$therapist$$,$$clinician$$,$$cna$$,$$lpn$$,$$dialysis$$,$$radiology$$,$$lab technologist$$,$$phlebotomist$$,$$home health$$,$$behavior analyst$$,$$bcba$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$How do you handle license verification and credentialing?$$, 'answer', $$We handle license verification, credentialing, and compliance checks up front so your clinical teams can focus on patient care.$$),
    jsonb_build_object('question', $$What healthcare roles do you staff?$$, 'answer', $$Credentialed nurses, allied health professionals, and healthcare administrators, matched for both compliance and cultural fit.$$),
    jsonb_build_object('question', $$Can you support last-minute or shift-based staffing needs?$$, 'answer', $$Our clinical recruiting team understands shift patterns, credentialing timelines, and facility compliance requirements, so we can move quickly when coverage gaps come up.$$),
    jsonb_build_object('question', $$What's your average time to fill a healthcare role?$$, 'answer', $$Our average time to hire is 11 days, built on a pool of pre-credentialed contract and per-diem staff.$$)
  ),
  $$Our healthcare staffing bench covers the full clinical and allied health spectrum: registered nurses and CNAs, licensed practical nurses, dialysis and radiology technicians, lab technologists and phlebotomists, physical and behavioral therapists (including BCBA-credentialed behavior analysts), home health aides, and healthcare administrators who keep the operational side running. We staff for acute care, outpatient, home health, and behavioral health settings, matched to your facility's actual patient-care model, not a generic hospital template.$$,
  $$License verification, credentialing, and compliance checks happen before a candidate profile ever reaches you, not after you've already extended an offer. We confirm active licensure in your state, check credentialing timelines against your start-date needs, and screen for facility-specific compliance requirements (background checks, immunization records, certifications) up front, so onboarding isn't held up by paperwork surprises.$$,
  $$Staffing shortages remain the top operational risk healthcare facilities report, and the cost of an unfilled shift compounds fast: agency premiums, overtime strain on existing staff, and patient-care risk. Facilities that build a reliable pool of pre-credentialed contract and per-diem staff avoid that spiral. Our average time to hire for this industry is 11 days, built on an active clinical network that's already screened before your shift gap opens.$$,
  $$We staff healthcare roles as per-diem, contract, contract-to-hire, or direct permanent placements, matched to whether you're covering a single shift gap or building out a permanent unit. Many contract clinical placements convert to permanent once both the facility and the candidate confirm long-term fit.$$,
  1
),
(
  $$engineering-staffing$$,
  $$Engineering Staffing$$,
  $$Hire Top Engineering Talent$$,
  $$Mechanical, civil, electrical, and industrial engineers with the hands-on project experience your builds demand.$$,
  $$We source engineers who've shipped real projects in your discipline, not just candidates who look good on paper. Our Edison, NJ team places engineering talent across New Jersey and nationally.$$,
  $$Infrastructure investment is driving a multi-year engineering talent crunch$$,
  $$Public and private infrastructure spending has outpaced the engineering graduate pipeline. Firms that offer clear project ownership and modern tooling are winning the recruiting conversation with senior engineers weighing multiple offers.$$,
  $$We work alongside your project managers to map staffing needs against your project timeline, not just a generic job spec.$$,
  ARRAY[$$mechanical engineer$$,$$civil engineer$$,$$electrical engineer$$,$$structural engineer$$,$$industrial engineer$$,$$surveyor$$,$$cost estimator$$,$$field service engineer$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$What engineering disciplines do you cover?$$, 'answer', $$Mechanical, civil, electrical, structural, and industrial engineering, across contract, contract-to-hire, and permanent placements.$$),
    jsonb_build_object('question', $$Do your engineering candidates have real project experience?$$, 'answer', $$Yes. We source engineers who've shipped real projects in your discipline, not just candidates who look good on paper.$$),
    jsonb_build_object('question', $$Can you staff around a specific project timeline?$$, 'answer', $$We work alongside your project managers to map staffing needs against your actual project timeline, not a generic job spec.$$),
    jsonb_build_object('question', $$What's your average time to fill an engineering role?$$, 'answer', $$Our average time to hire is 14 days, drawn from a talent pool that spans New Jersey and nationally.$$)
  ),
  $$We place mechanical, civil, electrical, structural, and industrial engineers, along with surveyors, cost estimators, and field service engineers. Our engineering bench covers everything from a single specialized hire, such as a structural engineer for a permitting push, to full project teams standing up a new build from design through commissioning.$$,
  $$We source engineers who've shipped real projects in your discipline, verifying hands-on project experience and outcomes, not just degrees and certifications on paper. Candidates are screened against the specific tools, codes, and project types your team actually works in, so the first resume you see is already a realistic fit.$$,
  $$Public and private infrastructure investment has outpaced the engineering graduate pipeline, creating a multi-year talent crunch, especially for senior engineers weighing multiple offers. Firms that can offer clear project ownership and modern tooling are winning that conversation faster. Our average time to hire for this industry is 14 days, drawn from a talent pool spanning New Jersey and nationally.$$,
  $$Engineering roles are staffed as contract, contract-to-hire, or permanent placements, mapped against your actual project timeline rather than a generic hiring calendar. A project with a hard delivery date needs a different staffing approach than a permanent plant-leadership hire, and we scope for that difference up front.$$,
  2
),
(
  $$manufacturing-staffing$$,
  $$Manufacturing Staffing$$,
  $$Hire Top Manufacturing Talent$$,
  $$Production leads, quality engineers, and skilled trades who keep your lines running and your output on spec.$$,
  $$Our manufacturing talent pool spans shop floor to plant leadership, with a focus on safety record and process discipline. We staff plants across New Jersey from our Edison, NJ home base.$$,
  $$Reshoring is reshaping manufacturing hiring$$,
  $$As production moves closer to home, plants are competing hard for experienced operators and quality engineers. A staffing partner with a pre-vetted regional talent pool is the difference between hitting a launch date and missing it.$$,
  $$We staff around your shift schedule and ramp curve, from a single skilled hire to a full line launch team.$$,
  ARRAY[$$production supervisor$$,$$production operator$$,$$manufacturing engineer$$,$$quality engineer$$,$$quality control$$,$$machinist$$,$$cnc$$,$$plant manager$$,$$plant engineer$$,$$maintenance technician$$,$$maintenance supervisor$$,$$maintenance superintendent$$,$$assembly$$,$$packaging$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$What manufacturing roles do you staff?$$, 'answer', $$Production leads, quality engineers, and skilled trades, from shop floor to plant leadership.$$),
    jsonb_build_object('question', $$Can you staff around our shift schedule?$$, 'answer', $$Yes. We staff around your shift schedule and ramp curve, from a single skilled hire to a full line launch team.$$),
    jsonb_build_object('question', $$Do you screen for safety record?$$, 'answer', $$Yes, our manufacturing talent pool is screened with a focus on safety record and process discipline.$$),
    jsonb_build_object('question', $$What's your coverage area for manufacturing staffing?$$, 'answer', $$We staff plants across New Jersey from our Edison, NJ home base.$$)
  ),
  $$Our manufacturing bench spans shop floor to plant leadership: production supervisors and operators, CNC machinists, quality engineers and quality control staff, maintenance technicians through maintenance superintendents, plant engineers and plant managers, plus assembly and packaging roles. We staff single skilled hires and full line-launch teams alike.$$,
  $$Every candidate is screened with a focus on safety record and process discipline, since one weak link on a production line affects everyone around them. We verify hands-on experience with your specific equipment and production environment, not just a generic manufacturing resume.$$,
  $$As production moves closer to home, plants are competing hard for experienced operators and quality engineers, and a pre-vetted regional talent pool has become the difference between hitting a launch date and missing it. Our average time to hire for this industry is 8 days, and we staff plants across New Jersey from our Edison, NJ home base.$$,
  $$We staff around your shift schedule and ramp curve, whether that's a single skilled maintenance hire or a full line-launch team brought on together. Contract, contract-to-hire, and permanent placements are all available depending on how long-term the need is.$$,
  3
),
(
  $$finance-staffing$$,
  $$Finance Staffing$$,
  $$Hire Top Finance Talent$$,
  $$Accountants, FP&A analysts, controllers, and finance leaders vetted for accuracy, compliance, and business impact.$$,
  $$Every finance candidate we present has been screened for technical accounting skill and the judgment to communicate it to leadership. As a New Jersey-based staffing partner, we know the local finance talent market well.$$,
  $$Finance teams are being asked to do more strategic work with leaner headcount$$,
  $$Automation is absorbing transactional accounting work, and companies now want FP&A and controllership hires who can also partner with the business. Candidates with both technical and communication skills are commanding a premium.$$,
  $$We scope your reporting stack and stakeholder expectations up front, so every candidate we send can hit the ground running.$$,
  ARRAY[$$accountant$$,$$accounting$$,$$financial accountant$$,$$finance$$,$$financial controller$$,$$controller$$,$$cpa$$,$$underwriter$$,$$fp&a$$,$$bookkeeper$$,$$payroll$$,$$reconciliation$$,$$settlements$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$What finance roles do you staff?$$, 'answer', $$Accountants, FP&A analysts, controllers, and finance leaders, vetted for accuracy, compliance, and business impact.$$),
    jsonb_build_object('question', $$How are finance candidates screened?$$, 'answer', $$Every candidate is screened for technical accounting skill and the judgment to communicate it to leadership, not just certifications.$$),
    jsonb_build_object('question', $$Do you understand the local finance talent market?$$, 'answer', $$Yes, as a New Jersey-based staffing partner, we know the local finance talent market well.$$),
    jsonb_build_object('question', $$What's your average time to fill a finance role?$$, 'answer', $$Our average time to hire is 10 days across the roles we staff.$$)
  ),
  $$We place accountants and bookkeepers, payroll and reconciliation specialists, FP&A analysts, financial controllers, CPAs, and underwriters, matched not just on technical accounting skill but on the ability to communicate that work to leadership.$$,
  $$Every finance candidate is screened for technical accuracy first, then for the judgment to explain a number to a non-finance stakeholder, since that combination is what actually makes a finance hire valuable to a growing team, not just a compliant one.$$,
  $$Automation is absorbing transactional accounting work, and companies increasingly want FP&A and controllership hires who can also partner with the business, not just close the books. Candidates with both technical and communication skills are commanding a premium, and our average time to hire of 10 days depends on already knowing which candidates in our network have both.$$,
  $$Finance roles are staffed as contract, contract-to-hire, or permanent placements. A close-cycle crunch or an audit-prep sprint often calls for a different engagement model than a permanent controller hire, and we scope for that difference before sourcing begins.$$,
  4
),
(
  $$administrative-staffing$$,
  $$Administrative Staffing$$,
  $$Hire Top Administrative Talent$$,
  $$Executive assistants, office managers, and administrative support professionals who keep your operations running smoothly.$$,
  $$We match on organizational skill, discretion, and tooling fluency, not just years of generic office experience. We're proud to be based in Edison, New Jersey, supporting employers throughout the region.$$,
  $$Hybrid work has raised the bar for administrative talent$$,
  $$Modern administrative professionals are expected to manage distributed calendars, digital workflows, and cross-office coordination. Employers are prioritizing candidates who are fluent in modern collaboration tooling, not just traditional office admin.$$,
  $$We ask about your tools, your leadership team's working style, and your pace before we shortlist a single candidate.$$,
  ARRAY[$$administrative assistant$$,$$executive assistant$$,$$office manager$$,$$receptionist$$,$$data entry$$,$$administrative$$,$$legal assistant$$,$$paralegal$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$What administrative roles do you staff?$$, 'answer', $$Executive assistants, office managers, and administrative support professionals, matched on organizational skill and discretion.$$),
    jsonb_build_object('question', $$What do you screen for in administrative candidates?$$, 'answer', $$Organizational skill, discretion, and tooling fluency, not just years of generic office experience.$$),
    jsonb_build_object('question', $$Do you understand hybrid and remote administrative work?$$, 'answer', $$We ask about your tools, your leadership team's working style, and your pace before we shortlist a single candidate.$$),
    jsonb_build_object('question', $$Where are you based and who do you serve?$$, 'answer', $$We're based in Edison, New Jersey, supporting employers throughout the region.$$)
  ),
  $$We place executive assistants, office managers, receptionists, data entry and administrative support staff, plus legal assistants and paralegals for firms that need admin support with legal-process fluency.$$,
  $$We screen for organizational skill, discretion, and tooling fluency, not just years of generic office experience. For executive assistant roles specifically, we also confirm comfort managing distributed calendars and cross-office coordination, since that's now the baseline expectation, not a bonus skill.$$,
  $$Hybrid work has raised the bar for administrative talent: modern professionals are expected to manage digital workflows and cross-office coordination fluently, not just traditional in-office admin tasks. Our average time to hire for this industry is 6 days, built on a network already screened for these modern-workplace skills.$$,
  $$Administrative roles are staffed as contract, contract-to-hire, or permanent placements, whether you need short-term coverage for a leave or a long-term executive assistant hire.$$,
  5
),
(
  $$sales-staffing$$,
  $$Sales Staffing$$,
  $$Hire Top Sales Talent$$,
  $$Quota-carrying reps, sales engineers, and sales leadership who can prove pipeline impact, not just charisma.$$,
  $$We validate track record against real quota attainment data before a sales candidate ever reaches your interview loop. Our team works out of Edison, NJ, placing sales talent across New Jersey and beyond.$$,
  $$Buyers have changed, and sales hiring has to catch up$$,
  $$Longer, more technical buying cycles mean sales teams need reps who can navigate multiple stakeholders and technical evaluations, not just relationship-driven closers. We screen for consultative selling skill, not just charisma.$$,
  $$We benchmark candidates against your actual comp plan and quota structure, not a generic sales persona.$$,
  ARRAY[$$sales executive$$,$$account executive$$,$$business development$$,$$account manager$$,$$sales manager$$,$$sales representative$$,$$director of sales$$,$$regional business development$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$What sales roles do you staff?$$, 'answer', $$Quota-carrying reps, sales engineers, and sales leadership, who can prove pipeline impact, not just charisma.$$),
    jsonb_build_object('question', $$How do you validate sales candidates?$$, 'answer', $$We validate track record against real quota attainment data before a candidate ever reaches your interview loop.$$),
    jsonb_build_object('question', $$Do you benchmark against our specific comp plan?$$, 'answer', $$Yes. We benchmark candidates against your actual comp plan and quota structure, not a generic sales persona.$$),
    jsonb_build_object('question', $$What's your coverage area for sales staffing?$$, 'answer', $$We're based in Edison, NJ, placing sales talent across New Jersey and beyond.$$)
  ),
  $$We place account executives and account managers, business development reps, sales managers and directors of sales, and sales engineers, screened for quota-carrying track record rather than interview charisma alone.$$,
  $$We validate track record against real quota attainment data before a candidate ever reaches your interview loop, and we benchmark every candidate against your actual comp plan and quota structure rather than a generic sales persona.$$,
  $$Longer, more technical buying cycles mean sales teams need reps who can navigate multiple stakeholders and technical evaluations, not just relationship-driven closers. We screen for consultative selling skill specifically, and our average time to hire for this industry is 12 days across the roles we staff.$$,
  $$Sales roles are staffed as contract, contract-to-hire, or permanent placements, from a single account executive hire to a full outbound team build-out.$$,
  6
),
(
  $$customer-service-staffing$$,
  $$Customer Service Staffing$$,
  $$Hire Top Customer Service Talent$$,
  $$Support agents, customer success managers, and CX leaders who protect your retention and your brand reputation.$$,
  $$We screen for communication skill, product-learning speed, and composure under pressure, the traits that actually predict CX performance. Based in Edison, New Jersey, we support CX teams statewide.$$,
  $$Customer service is now a retention function, not a cost center$$,
  $$As acquisition costs rise, companies are investing in support and success teams that can prevent churn, not just close tickets. That's shifted hiring criteria toward proactive communicators who can spot risk signals early.$$,
  $$We staff around your support channels, SLAs, and escalation process so new hires ramp faster.$$,
  ARRAY[$$customer service$$,$$customer support$$,$$call center$$,$$customer success$$,$$client relations$$,$$customer relationship$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$What customer service roles do you staff?$$, 'answer', $$Support agents, customer success managers, and CX leaders, who protect your retention and brand reputation.$$),
    jsonb_build_object('question', $$What do you screen for in customer service candidates?$$, 'answer', $$Communication skill, product-learning speed, and composure under pressure, the traits that actually predict CX performance.$$),
    jsonb_build_object('question', $$Can you staff around our support channels and SLAs?$$, 'answer', $$Yes. We staff around your support channels, SLAs, and escalation process so new hires ramp faster.$$),
    jsonb_build_object('question', $$Where do you support customer service teams?$$, 'answer', $$We're based in Edison, New Jersey, and support CX teams statewide.$$)
  ),
  $$We place support agents, customer success managers, call center staff, and CX leaders, screened for communication skill and composure under pressure rather than just call-volume experience.$$,
  $$We screen for communication skill, product-learning speed, and composure under pressure, the traits that actually predict CX performance, and we staff around your specific support channels, SLAs, and escalation process rather than a generic support-desk template.$$,
  $$As acquisition costs rise, companies are investing in support and success teams that can prevent churn, not just close tickets, shifting hiring criteria toward proactive communicators who spot risk signals early. Our average time to hire for this industry is 7 days, and we support CX teams statewide from our Edison, NJ base.$$,
  $$Customer service roles are staffed as contract, contract-to-hire, or permanent placements, matched to whether you're covering a seasonal support spike or building a permanent success team.$$,
  7
),
(
  $$logistics-staffing$$,
  $$Logistics Staffing$$,
  $$Hire Top Logistics Talent$$,
  $$Supply chain planners, warehouse leads, and logistics coordinators who keep freight, inventory, and delivery on schedule.$$,
  $$Our logistics talent pool is built for volume and speed, from a single warehouse supervisor to a multi-site staffing ramp. We're headquartered in Edison, NJ, with deep reach across New Jersey's logistics corridor.$$,
  $$Supply chain volatility has made staffing agility a competitive advantage$$,
  $$Companies that can flex headcount up and down with demand swings are outperforming those locked into rigid staffing models. A responsive staffing partner with a pre-screened regional talent pool is now a core part of supply chain resilience.$$,
  $$We plan around your peak seasons and shipping windows, so you're never short-staffed when volume spikes.$$,
  ARRAY[$$logistics$$,$$supply chain$$,$$warehouse$$,$$distribution$$,$$dispatcher$$,$$freight$$,$$sourcing$$,$$purchasing manager$$]::text[],
  jsonb_build_array(
    jsonb_build_object('question', $$What logistics roles do you staff?$$, 'answer', $$Supply chain planners, warehouse leads, and logistics coordinators, who keep freight, inventory, and delivery on schedule.$$),
    jsonb_build_object('question', $$Can you handle seasonal or peak-volume staffing?$$, 'answer', $$Yes. We plan around your peak seasons and shipping windows, so you're never short-staffed when volume spikes.$$),
    jsonb_build_object('question', $$What's your coverage area for logistics staffing?$$, 'answer', $$We're headquartered in Edison, NJ, with deep reach across New Jersey's logistics corridor.$$),
    jsonb_build_object('question', $$What size staffing ramps can you support?$$, 'answer', $$Our logistics talent pool is built for volume and speed, from a single warehouse supervisor to a multi-site staffing ramp.$$)
  ),
  $$We place supply chain planners, warehouse leads and supervisors, logistics coordinators, dispatchers, and purchasing managers, built for both steady-state operations and peak-season ramps.$$,
  $$We screen for hands-on experience in your specific logistics environment, whether that's warehouse, distribution, freight, or supply-chain planning, rather than generic operations experience, and we plan around your peak seasons and shipping windows from the first conversation.$$,
  $$Supply chain volatility has made staffing agility a competitive advantage: companies that can flex headcount up and down with demand swings are outperforming those locked into rigid staffing models. Our average time to hire for this industry is 5 days, and we're headquartered in Edison, NJ, with deep reach across New Jersey's logistics corridor.$$,
  $$Logistics roles are staffed as contract, contract-to-hire, or permanent placements, from a single warehouse supervisor hire to a full multi-site staffing ramp for a new distribution center.$$,
  8
);

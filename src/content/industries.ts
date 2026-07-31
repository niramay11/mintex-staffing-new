import type { Industry } from "./types";

export const industries: Industry[] = [
  {
    slug: "it-staffing",
    name: "IT Staffing",
    heroTitle: "Hire Top IT Talent",
    seoSubheading:
      "Connect with vetted software engineers, cloud architects, and IT project leaders ready to move your technology roadmap forward.",
    intro:
      "From full-stack developers to DevOps specialists and cloud infrastructure engineers, our IT staffing pool is screened for both technical depth and delivery track record. Based in Edison, New Jersey, Mintex Staffing places software engineers, cloud architects, IT project managers and more with employers throughout the state and beyond, for contract, permanent, and contract-to-hire roles.",
    sectorInsight: {
      title: "The IT hiring market is tightening around specialized skills",
      body: "Demand for cloud-native, AI/ML, and cybersecurity talent continues to outpace supply. Employers who move fast on vetted candidates and offer flexible engagement models (contract, contract-to-hire, permanent) are winning the best talent before competitors even finish their first interview loop.",
    },
    workStyle:
      "We embed with your engineering leadership to understand your stack, team culture, and delivery cadence before we ever send a resume.",
    jobKeywords: [
      "software engineer", "software developer", "full stack", "full-stack", "front end", "frontend",
      "back end", "backend", "devops", "cloud", "aws", "azure", "network engineer",
      "systems administrator", "sysadmin", "it project manager", "qa engineer", "data engineer",
      "data scientist", "cybersecurity", "help desk", "it support", "solutions engineer", "servicenow",
      "web developer", ".net", "java developer", "python developer", "sql developer",
      "database administrator", "ai engineer", "machine learning", "react", "node.js", "nodejs",
      "angular", "programmer", "it analyst", "technology analyst",
    ],
    faqs: [
      {
        question: "How quickly can Mintex Staffing fill an IT role?",
        answer: "Our average time to hire is 9 days, drawing from an active, pre-vetted technical talent network.",
      },
      {
        question: "What IT roles do you typically staff?",
        answer: "Software engineers, DevOps and cloud specialists, QA engineers, data engineers, IT project managers, and more, across contract, contract-to-hire, and permanent placements.",
      },
      {
        question: "Do you screen for technical skill or just resume experience?",
        answer: "Both. Candidates are vetted for technical depth and a track record of shipping real projects, not just keyword matches on a resume.",
      },
      {
        question: "Can I hire on a contract basis and convert to full-time later?",
        answer: "Yes. Many contract placements are structured with a clear path to permanent hire once both sides confirm it's the right fit.",
      },
    ],
    typicalRoles:
      "Our IT staffing bench spans the full technology stack: full-stack and back-end developers working in Java, .NET, Python, and Node.js; front-end engineers building in React and Angular; DevOps and cloud engineers running AWS and Azure infrastructure; QA engineers and data engineers keeping releases reliable and data pipelines clean; and IT project managers who can actually read a Gantt chart and a stand-up. We also place more specialized roles as they come up: cybersecurity analysts, machine learning and AI engineers, database administrators, and ServiceNow specialists. Whether you need one contract developer to cover parental leave or a five-person pod to stand up a new platform, the same screening bar applies.",
    vettingProcess:
      "Every technical candidate goes through a structured screen before you ever see a resume: we verify hands-on experience with the specific stack you're hiring for, not just keyword-matching a LinkedIn profile, confirm delivery history on real production systems, and check communication skill, because the best engineer on paper is useless if they can't work with your team. For contract and contract-to-hire roles, we also confirm availability and notice-period realism up front, so you're not three weeks into a search only to find out your top candidate can't start for two months.",
    marketContext:
      "Demand for cloud-native, AI/ML, and cybersecurity talent continues to outpace the available supply, and that gap shows up fastest in time-to-fill: teams that wait on a \"perfect on paper\" candidate often lose them to a faster-moving offer. Our average time to hire is 9 days across the roles we staff, which is only possible because our active technical talent network is pre-screened before your req even opens, not after.",
    engagementModels:
      "We staff IT roles as contract, contract-to-hire, or direct permanent placements, so the engagement model fits the actual shape of the work, not a one-size-fits-all default. A short-term migration project doesn't need a full-time hire; a core platform team lead usually does. Many of our contract placements convert to permanent once both sides confirm it's the right long-term fit, with no separate re-hiring process required.",
  },
  {
    slug: "healthcare-staffing",
    name: "Healthcare Staffing",
    heroTitle: "Hire Top Healthcare Talent",
    seoSubheading:
      "Credentialed nurses, allied health professionals, and healthcare administrators, matched fast without compromising compliance.",
    intro:
      "We handle license verification, credentialing, and compliance checks up front so your clinical teams can focus on patient care. Headquartered in Edison, NJ, we support healthcare facilities across New Jersey.",
    sectorInsight: {
      title: "Staffing shortages remain the top operational risk in healthcare",
      body: "Facilities that build a reliable pool of pre-credentialed contract and per-diem staff are avoiding costly agency premiums and last-minute shift gaps. A proactive staffing partner is now table stakes, not a nice-to-have.",
    },
    workStyle:
      "Our clinical recruiting team understands shift patterns, credentialing timelines, and facility compliance requirements inside and out.",
    jobKeywords: [
      "nurse", " rn ", "rn -", "rn –", "registered nurse", "clinical", "medical", "healthcare", "hospital",
      "patient", "pharmacy", "physician", "therapist", "clinician", "cna", "lpn", "dialysis",
      "radiology", "lab technologist", "phlebotomist", "home health", "behavior analyst", "bcba",
    ],
    faqs: [
      {
        question: "How do you handle license verification and credentialing?",
        answer: "We handle license verification, credentialing, and compliance checks up front so your clinical teams can focus on patient care.",
      },
      {
        question: "What healthcare roles do you staff?",
        answer: "Credentialed nurses, allied health professionals, and healthcare administrators, matched for both compliance and cultural fit.",
      },
      {
        question: "Can you support last-minute or shift-based staffing needs?",
        answer: "Our clinical recruiting team understands shift patterns, credentialing timelines, and facility compliance requirements, so we can move quickly when coverage gaps come up.",
      },
      {
        question: "What's your average time to fill a healthcare role?",
        answer: "Our average time to hire is 11 days, built on a pool of pre-credentialed contract and per-diem staff.",
      },
    ],
    typicalRoles:
      "Our healthcare staffing bench covers the full clinical and allied health spectrum: registered nurses and CNAs, licensed practical nurses, dialysis and radiology technicians, lab technologists and phlebotomists, physical and behavioral therapists (including BCBA-credentialed behavior analysts), home health aides, and healthcare administrators who keep the operational side running. We staff for acute care, outpatient, home health, and behavioral health settings, matched to your facility's actual patient-care model, not a generic hospital template.",
    vettingProcess:
      "License verification, credentialing, and compliance checks happen before a candidate profile ever reaches you, not after you've already extended an offer. We confirm active licensure in your state, check credentialing timelines against your start-date needs, and screen for facility-specific compliance requirements (background checks, immunization records, certifications) up front, so onboarding isn't held up by paperwork surprises.",
    marketContext:
      "Staffing shortages remain the top operational risk healthcare facilities report, and the cost of an unfilled shift compounds fast: agency premiums, overtime strain on existing staff, and patient-care risk. Facilities that build a reliable pool of pre-credentialed contract and per-diem staff avoid that spiral. Our average time to hire for this industry is 11 days, built on an active clinical network that's already screened before your shift gap opens.",
    engagementModels:
      "We staff healthcare roles as per-diem, contract, contract-to-hire, or direct permanent placements, matched to whether you're covering a single shift gap or building out a permanent unit. Many contract clinical placements convert to permanent once both the facility and the candidate confirm long-term fit.",
  },
  {
    slug: "engineering-staffing",
    name: "Engineering Staffing",
    heroTitle: "Hire Top Engineering Talent",
    seoSubheading:
      "Mechanical, civil, electrical, and industrial engineers with the hands-on project experience your builds demand.",
    intro:
      "We source engineers who've shipped real projects in your discipline, not just candidates who look good on paper. Our Edison, NJ team places engineering talent across New Jersey and nationally.",
    sectorInsight: {
      title: "Infrastructure investment is driving a multi-year engineering talent crunch",
      body: "Public and private infrastructure spending has outpaced the engineering graduate pipeline. Firms that offer clear project ownership and modern tooling are winning the recruiting conversation with senior engineers weighing multiple offers.",
    },
    workStyle:
      "We work alongside your project managers to map staffing needs against your project timeline, not just a generic job spec.",
    jobKeywords: [
      "mechanical engineer", "civil engineer", "electrical engineer", "structural engineer",
      "industrial engineer", "surveyor", "cost estimator", "field service engineer",
    ],
    faqs: [
      {
        question: "What engineering disciplines do you cover?",
        answer: "Mechanical, civil, electrical, structural, and industrial engineering, across contract, contract-to-hire, and permanent placements.",
      },
      {
        question: "Do your engineering candidates have real project experience?",
        answer: "Yes. We source engineers who've shipped real projects in your discipline, not just candidates who look good on paper.",
      },
      {
        question: "Can you staff around a specific project timeline?",
        answer: "We work alongside your project managers to map staffing needs against your actual project timeline, not a generic job spec.",
      },
      {
        question: "What's your average time to fill an engineering role?",
        answer: "Our average time to hire is 14 days, drawn from a talent pool that spans New Jersey and nationally.",
      },
    ],
    typicalRoles:
      "We place mechanical, civil, electrical, structural, and industrial engineers, along with surveyors, cost estimators, and field service engineers. Our engineering bench covers everything from a single specialized hire, such as a structural engineer for a permitting push, to full project teams standing up a new build from design through commissioning.",
    vettingProcess:
      "We source engineers who've shipped real projects in your discipline, verifying hands-on project experience and outcomes, not just degrees and certifications on paper. Candidates are screened against the specific tools, codes, and project types your team actually works in, so the first resume you see is already a realistic fit.",
    marketContext:
      "Public and private infrastructure investment has outpaced the engineering graduate pipeline, creating a multi-year talent crunch, especially for senior engineers weighing multiple offers. Firms that can offer clear project ownership and modern tooling are winning that conversation faster. Our average time to hire for this industry is 14 days, drawn from a talent pool spanning New Jersey and nationally.",
    engagementModels:
      "Engineering roles are staffed as contract, contract-to-hire, or permanent placements, mapped against your actual project timeline rather than a generic hiring calendar. A project with a hard delivery date needs a different staffing approach than a permanent plant-leadership hire, and we scope for that difference up front.",
  },
  {
    slug: "manufacturing-staffing",
    name: "Manufacturing Staffing",
    heroTitle: "Hire Top Manufacturing Talent",
    seoSubheading:
      "Production leads, quality engineers, and skilled trades who keep your lines running and your output on spec.",
    intro:
      "Our manufacturing talent pool spans shop floor to plant leadership, with a focus on safety record and process discipline. We staff plants across New Jersey from our Edison, NJ home base.",
    sectorInsight: {
      title: "Reshoring is reshaping manufacturing hiring",
      body: "As production moves closer to home, plants are competing hard for experienced operators and quality engineers. A staffing partner with a pre-vetted regional talent pool is the difference between hitting a launch date and missing it.",
    },
    workStyle:
      "We staff around your shift schedule and ramp curve, from a single skilled hire to a full line launch team.",
    jobKeywords: [
      "production supervisor", "production operator", "manufacturing engineer", "quality engineer",
      "quality control", "machinist", "cnc", "plant manager", "plant engineer",
      "maintenance technician", "maintenance supervisor", "maintenance superintendent", "assembly",
      "packaging",
    ],
    faqs: [
      {
        question: "What manufacturing roles do you staff?",
        answer: "Production leads, quality engineers, and skilled trades, from shop floor to plant leadership.",
      },
      {
        question: "Can you staff around our shift schedule?",
        answer: "Yes. We staff around your shift schedule and ramp curve, from a single skilled hire to a full line launch team.",
      },
      {
        question: "Do you screen for safety record?",
        answer: "Yes, our manufacturing talent pool is screened with a focus on safety record and process discipline.",
      },
      {
        question: "What's your coverage area for manufacturing staffing?",
        answer: "We staff plants across New Jersey from our Edison, NJ home base.",
      },
    ],
    typicalRoles:
      "Our manufacturing bench spans shop floor to plant leadership: production supervisors and operators, CNC machinists, quality engineers and quality control staff, maintenance technicians through maintenance superintendents, plant engineers and plant managers, plus assembly and packaging roles. We staff single skilled hires and full line-launch teams alike.",
    vettingProcess:
      "Every candidate is screened with a focus on safety record and process discipline, since one weak link on a production line affects everyone around them. We verify hands-on experience with your specific equipment and production environment, not just a generic manufacturing resume.",
    marketContext:
      "As production moves closer to home, plants are competing hard for experienced operators and quality engineers, and a pre-vetted regional talent pool has become the difference between hitting a launch date and missing it. Our average time to hire for this industry is 8 days, and we staff plants across New Jersey from our Edison, NJ home base.",
    engagementModels:
      "We staff around your shift schedule and ramp curve, whether that's a single skilled maintenance hire or a full line-launch team brought on together. Contract, contract-to-hire, and permanent placements are all available depending on how long-term the need is.",
  },
  {
    slug: "finance-staffing",
    name: "Finance Staffing",
    heroTitle: "Hire Top Finance Talent",
    seoSubheading:
      "Accountants, FP&A analysts, controllers, and finance leaders vetted for accuracy, compliance, and business impact.",
    intro:
      "Every finance candidate we present has been screened for technical accounting skill and the judgment to communicate it to leadership. As a New Jersey-based staffing partner, we know the local finance talent market well.",
    sectorInsight: {
      title: "Finance teams are being asked to do more strategic work with leaner headcount",
      body: "Automation is absorbing transactional accounting work, and companies now want FP&A and controllership hires who can also partner with the business. Candidates with both technical and communication skills are commanding a premium.",
    },
    workStyle:
      "We scope your reporting stack and stakeholder expectations up front, so every candidate we send can hit the ground running.",
    jobKeywords: [
      "accountant", "accounting", "financial accountant", "finance", "financial controller",
      "controller", "cpa", "underwriter", "fp&a", "bookkeeper", "payroll", "reconciliation",
      "settlements",
    ],
    faqs: [
      {
        question: "What finance roles do you staff?",
        answer: "Accountants, FP&A analysts, controllers, and finance leaders, vetted for accuracy, compliance, and business impact.",
      },
      {
        question: "How are finance candidates screened?",
        answer: "Every candidate is screened for technical accounting skill and the judgment to communicate it to leadership, not just certifications.",
      },
      {
        question: "Do you understand the local finance talent market?",
        answer: "Yes, as a New Jersey-based staffing partner, we know the local finance talent market well.",
      },
      {
        question: "What's your average time to fill a finance role?",
        answer: "Our average time to hire is 10 days across the roles we staff.",
      },
    ],
    typicalRoles:
      "We place accountants and bookkeepers, payroll and reconciliation specialists, FP&A analysts, financial controllers, CPAs, and underwriters, matched not just on technical accounting skill but on the ability to communicate that work to leadership.",
    vettingProcess:
      "Every finance candidate is screened for technical accuracy first, then for the judgment to explain a number to a non-finance stakeholder, since that combination is what actually makes a finance hire valuable to a growing team, not just a compliant one.",
    marketContext:
      "Automation is absorbing transactional accounting work, and companies increasingly want FP&A and controllership hires who can also partner with the business, not just close the books. Candidates with both technical and communication skills are commanding a premium, and our average time to hire of 10 days depends on already knowing which candidates in our network have both.",
    engagementModels:
      "Finance roles are staffed as contract, contract-to-hire, or permanent placements. A close-cycle crunch or an audit-prep sprint often calls for a different engagement model than a permanent controller hire, and we scope for that difference before sourcing begins.",
  },
  {
    slug: "administrative-staffing",
    name: "Administrative Staffing",
    heroTitle: "Hire Top Administrative Talent",
    seoSubheading:
      "Executive assistants, office managers, and administrative support professionals who keep your operations running smoothly.",
    intro:
      "We match on organizational skill, discretion, and tooling fluency, not just years of generic office experience. We're proud to be based in Edison, New Jersey, supporting employers throughout the region.",
    sectorInsight: {
      title: "Hybrid work has raised the bar for administrative talent",
      body: "Modern administrative professionals are expected to manage distributed calendars, digital workflows, and cross-office coordination. Employers are prioritizing candidates who are fluent in modern collaboration tooling, not just traditional office admin.",
    },
    workStyle:
      "We ask about your tools, your leadership team's working style, and your pace before we shortlist a single candidate.",
    jobKeywords: [
      "administrative assistant", "executive assistant", "office manager", "receptionist",
      "data entry", "administrative", "legal assistant", "paralegal",
    ],
    faqs: [
      {
        question: "What administrative roles do you staff?",
        answer: "Executive assistants, office managers, and administrative support professionals, matched on organizational skill and discretion.",
      },
      {
        question: "What do you screen for in administrative candidates?",
        answer: "Organizational skill, discretion, and tooling fluency, not just years of generic office experience.",
      },
      {
        question: "Do you understand hybrid and remote administrative work?",
        answer: "We ask about your tools, your leadership team's working style, and your pace before we shortlist a single candidate.",
      },
      {
        question: "Where are you based and who do you serve?",
        answer: "We're based in Edison, New Jersey, supporting employers throughout the region.",
      },
    ],
    typicalRoles:
      "We place executive assistants, office managers, receptionists, data entry and administrative support staff, plus legal assistants and paralegals for firms that need admin support with legal-process fluency.",
    vettingProcess:
      "We screen for organizational skill, discretion, and tooling fluency, not just years of generic office experience. For executive assistant roles specifically, we also confirm comfort managing distributed calendars and cross-office coordination, since that's now the baseline expectation, not a bonus skill.",
    marketContext:
      "Hybrid work has raised the bar for administrative talent: modern professionals are expected to manage digital workflows and cross-office coordination fluently, not just traditional in-office admin tasks. Our average time to hire for this industry is 6 days, built on a network already screened for these modern-workplace skills.",
    engagementModels:
      "Administrative roles are staffed as contract, contract-to-hire, or permanent placements, whether you need short-term coverage for a leave or a long-term executive assistant hire.",
  },
  {
    slug: "sales-staffing",
    name: "Sales Staffing",
    heroTitle: "Hire Top Sales Talent",
    seoSubheading:
      "Quota-carrying reps, sales engineers, and sales leadership who can prove pipeline impact, not just charisma.",
    intro:
      "We validate track record against real quota attainment data before a sales candidate ever reaches your interview loop. Our team works out of Edison, NJ, placing sales talent across New Jersey and beyond.",
    sectorInsight: {
      title: "Buyers have changed, and sales hiring has to catch up",
      body: "Longer, more technical buying cycles mean sales teams need reps who can navigate multiple stakeholders and technical evaluations, not just relationship-driven closers. We screen for consultative selling skill, not just charisma.",
    },
    workStyle:
      "We benchmark candidates against your actual comp plan and quota structure, not a generic sales persona.",
    jobKeywords: [
      "sales executive", "account executive", "business development", "account manager",
      "sales manager", "sales representative", "director of sales", "regional business development",
    ],
    faqs: [
      {
        question: "What sales roles do you staff?",
        answer: "Quota-carrying reps, sales engineers, and sales leadership, who can prove pipeline impact, not just charisma.",
      },
      {
        question: "How do you validate sales candidates?",
        answer: "We validate track record against real quota attainment data before a candidate ever reaches your interview loop.",
      },
      {
        question: "Do you benchmark against our specific comp plan?",
        answer: "Yes. We benchmark candidates against your actual comp plan and quota structure, not a generic sales persona.",
      },
      {
        question: "What's your coverage area for sales staffing?",
        answer: "We're based in Edison, NJ, placing sales talent across New Jersey and beyond.",
      },
    ],
    typicalRoles:
      "We place account executives and account managers, business development reps, sales managers and directors of sales, and sales engineers, screened for quota-carrying track record rather than interview charisma alone.",
    vettingProcess:
      "We validate track record against real quota attainment data before a candidate ever reaches your interview loop, and we benchmark every candidate against your actual comp plan and quota structure rather than a generic sales persona.",
    marketContext:
      "Longer, more technical buying cycles mean sales teams need reps who can navigate multiple stakeholders and technical evaluations, not just relationship-driven closers. We screen for consultative selling skill specifically, and our average time to hire for this industry is 12 days across the roles we staff.",
    engagementModels:
      "Sales roles are staffed as contract, contract-to-hire, or permanent placements, from a single account executive hire to a full outbound team build-out.",
  },
  {
    slug: "customer-service-staffing",
    name: "Customer Service Staffing",
    heroTitle: "Hire Top Customer Service Talent",
    seoSubheading:
      "Support agents, customer success managers, and CX leaders who protect your retention and your brand reputation.",
    intro:
      "We screen for communication skill, product-learning speed, and composure under pressure, the traits that actually predict CX performance. Based in Edison, New Jersey, we support CX teams statewide.",
    sectorInsight: {
      title: "Customer service is now a retention function, not a cost center",
      body: "As acquisition costs rise, companies are investing in support and success teams that can prevent churn, not just close tickets. That's shifted hiring criteria toward proactive communicators who can spot risk signals early.",
    },
    workStyle:
      "We staff around your support channels, SLAs, and escalation process so new hires ramp faster.",
    jobKeywords: [
      "customer service", "customer support", "call center", "customer success", "client relations",
      "customer relationship",
    ],
    faqs: [
      {
        question: "What customer service roles do you staff?",
        answer: "Support agents, customer success managers, and CX leaders, who protect your retention and brand reputation.",
      },
      {
        question: "What do you screen for in customer service candidates?",
        answer: "Communication skill, product-learning speed, and composure under pressure, the traits that actually predict CX performance.",
      },
      {
        question: "Can you staff around our support channels and SLAs?",
        answer: "Yes. We staff around your support channels, SLAs, and escalation process so new hires ramp faster.",
      },
      {
        question: "Where do you support customer service teams?",
        answer: "We're based in Edison, New Jersey, and support CX teams statewide.",
      },
    ],
    typicalRoles:
      "We place support agents, customer success managers, call center staff, and CX leaders, screened for communication skill and composure under pressure rather than just call-volume experience.",
    vettingProcess:
      "We screen for communication skill, product-learning speed, and composure under pressure, the traits that actually predict CX performance, and we staff around your specific support channels, SLAs, and escalation process rather than a generic support-desk template.",
    marketContext:
      "As acquisition costs rise, companies are investing in support and success teams that can prevent churn, not just close tickets, shifting hiring criteria toward proactive communicators who spot risk signals early. Our average time to hire for this industry is 7 days, and we support CX teams statewide from our Edison, NJ base.",
    engagementModels:
      "Customer service roles are staffed as contract, contract-to-hire, or permanent placements, matched to whether you're covering a seasonal support spike or building a permanent success team.",
  },
  {
    slug: "logistics-staffing",
    name: "Logistics Staffing",
    heroTitle: "Hire Top Logistics Talent",
    seoSubheading:
      "Supply chain planners, warehouse leads, and logistics coordinators who keep freight, inventory, and delivery on schedule.",
    intro:
      "Our logistics talent pool is built for volume and speed, from a single warehouse supervisor to a multi-site staffing ramp. We're headquartered in Edison, NJ, with deep reach across New Jersey's logistics corridor.",
    sectorInsight: {
      title: "Supply chain volatility has made staffing agility a competitive advantage",
      body: "Companies that can flex headcount up and down with demand swings are outperforming those locked into rigid staffing models. A responsive staffing partner with a pre-screened regional talent pool is now a core part of supply chain resilience.",
    },
    workStyle:
      "We plan around your peak seasons and shipping windows, so you're never short-staffed when volume spikes.",
    jobKeywords: [
      "logistics", "supply chain", "warehouse", "distribution", "dispatcher", "freight", "sourcing",
      "purchasing manager",
    ],
    faqs: [
      {
        question: "What logistics roles do you staff?",
        answer: "Supply chain planners, warehouse leads, and logistics coordinators, who keep freight, inventory, and delivery on schedule.",
      },
      {
        question: "Can you handle seasonal or peak-volume staffing?",
        answer: "Yes. We plan around your peak seasons and shipping windows, so you're never short-staffed when volume spikes.",
      },
      {
        question: "What's your coverage area for logistics staffing?",
        answer: "We're headquartered in Edison, NJ, with deep reach across New Jersey's logistics corridor.",
      },
      {
        question: "What size staffing ramps can you support?",
        answer: "Our logistics talent pool is built for volume and speed, from a single warehouse supervisor to a multi-site staffing ramp.",
      },
    ],
    typicalRoles:
      "We place supply chain planners, warehouse leads and supervisors, logistics coordinators, dispatchers, and purchasing managers, built for both steady-state operations and peak-season ramps.",
    vettingProcess:
      "We screen for hands-on experience in your specific logistics environment, whether that's warehouse, distribution, freight, or supply-chain planning, rather than generic operations experience, and we plan around your peak seasons and shipping windows from the first conversation.",
    marketContext:
      "Supply chain volatility has made staffing agility a competitive advantage: companies that can flex headcount up and down with demand swings are outperforming those locked into rigid staffing models. Our average time to hire for this industry is 5 days, and we're headquartered in Edison, NJ, with deep reach across New Jersey's logistics corridor.",
    engagementModels:
      "Logistics roles are staffed as contract, contract-to-hire, or permanent placements, from a single warehouse supervisor hire to a full multi-site staffing ramp for a new distribution center.",
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}

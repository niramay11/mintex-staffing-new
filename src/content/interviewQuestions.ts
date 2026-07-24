import type { InterviewQuestionSet } from "./types";

const commonQuestions = {
  Entry: [
    "Tell me about a time you had to learn something new quickly on the job.",
    "How do you prioritize tasks when everything feels urgent?",
    "What made you interested in this field?",
    "What do you know about this role, and why does it interest you?",
  ],
  Mid: [
    "Describe a project you owned end-to-end. What would you do differently?",
    "Tell me about a time you disagreed with a manager's decision. How did you handle it?",
    "How do you stay current in your field?",
    "How do you handle receiving critical feedback?",
  ],
  Senior: [
    "How do you decide what to delegate versus what to own directly?",
    "Tell me about a time you had to influence a decision without formal authority.",
    "How do you mentor more junior team members?",
    "How do you set and track goals for the people you lead?",
  ],
} as const;

const industryQuestions: Record<string, Record<keyof typeof commonQuestions, string[]>> = {
  "it-staffing": {
    Entry: [
      "Walk me through how you'd debug a failing API request.",
      "What's the difference between a GET and a POST request?",
      "Describe your experience with version control workflows.",
      "What's the difference between an array and a linked list, and when would you use each?",
      "How would you explain what an API is to a non-technical stakeholder?",
      "What's the purpose of a code review, and what do you look for in one?",
    ],
    Mid: [
      "Tell me about a production incident you helped resolve. What was the root cause?",
      "How do you approach writing tests for a new feature?",
      "Describe a time you had to balance technical debt against a deadline.",
      "How do you decide when a feature needs a caching layer?",
      "Walk me through how you'd design a basic rate limiter.",
      "What's your approach to tracking down a memory leak in production?",
    ],
    Senior: [
      "How do you evaluate a build-vs-buy decision for a new system?",
      "Tell me about a time you led an architecture decision with long-term tradeoffs.",
      "How do you approach scaling a team's engineering practices as headcount grows?",
      "How do you approach designing a system for horizontal scalability?",
      "Walk me through a time you evaluated a microservices vs. monolith tradeoff.",
      "How do you think about database indexing strategy for a high-write system?",
    ],
  },
  "healthcare-staffing": {
    Entry: [
      "How do you stay calm during a high-pressure patient situation?",
      "Describe your experience with electronic health record systems.",
      "How do you handle a disagreement with a colleague about patient care?",
      "What steps do you take to verify the 'five rights' before administering medication?",
      "How do you ensure your documentation in a patient's chart is accurate and timely?",
      "What's your understanding of HIPAA and patient confidentiality requirements?",
    ],
    Mid: [
      "Tell me about a time you caught a potential error before it reached a patient.",
      "How do you manage a high patient load without compromising care quality?",
      "Describe how you've handled a difficult conversation with a patient's family.",
      "How do you triage multiple patients with competing acute needs?",
      "Walk me through how you recognize early signs of patient deterioration.",
      "How do you ensure infection control protocols are followed under time pressure?",
    ],
    Senior: [
      "How do you approach training new staff on unit protocols?",
      "Tell me about a time you improved a clinical process or workflow.",
      "How do you balance compliance requirements with day-to-day operational pressure?",
      "How do you evaluate and update a unit's clinical protocols based on new evidence?",
      "Walk me through how you'd lead a root-cause analysis after a near-miss incident.",
      "How do you balance staffing ratios against patient acuity levels?",
    ],
  },
  "engineering-staffing": {
    Entry: [
      "Walk me through a design calculation you're comfortable performing independently.",
      "What CAD or design software are you proficient in?",
      "How do you approach a project requirement you don't fully understand yet?",
      "What's the difference between tolerance and clearance in a mechanical design?",
      "How do you validate a design against relevant industry codes or standards?",
      "What simulation or FEA (finite element analysis) tools have you used?",
    ],
    Mid: [
      "Tell me about a time a design had to change mid-project. How did you adapt?",
      "Describe your experience coordinating with contractors or field teams.",
      "How do you verify your work meets code and safety requirements?",
      "Walk me through how you'd perform a failure mode analysis (FMEA) on a component.",
      "How do you approach a load or stress calculation for a structural element?",
      "What's your process for managing design revisions across a multidisciplinary team?",
    ],
    Senior: [
      "How do you approach sign-off responsibility on a design you didn't originate?",
      "Tell me about a time you had to push back on a client's requested change.",
      "How do you develop junior engineers on your team?",
      "How do you weigh cost, manufacturability, and performance tradeoffs in a design?",
      "Walk me through how you'd validate a system against a regulatory compliance standard.",
      "How do you decide whether a change needs a full engineering review versus a minor change order?",
    ],
  },
  "manufacturing-staffing": {
    Entry: [
      "Describe your experience working on a production line or in a plant environment.",
      "How do you approach following a standard operating procedure exactly?",
      "What would you do if you noticed a safety issue on the floor?",
      "What's your experience reading blueprints or work instructions?",
      "How do you use calipers or other precision measurement tools?",
      "What's your understanding of a basic quality control checkpoint?",
    ],
    Mid: [
      "Tell me about a time you identified a quality issue before it became a bigger problem.",
      "How do you handle a production target that's at risk of being missed?",
      "Describe your experience with continuous improvement or lean processes.",
      "Walk me through how you'd run a root-cause analysis using the 5 Whys or a fishbone diagram.",
      "How do you calculate OEE (Overall Equipment Effectiveness), and what does it tell you?",
      "What's your experience with SPC (statistical process control) charts?",
    ],
    Senior: [
      "How do you approach root-cause analysis for a recurring defect?",
      "Tell me about a time you led a shift through an unplanned downtime event.",
      "How do you balance throughput targets against safety and quality standards?",
      "How do you approach running a Kaizen event to improve a bottleneck process?",
      "Walk me through how you'd validate a new piece of equipment before full production.",
      "How do you balance Six Sigma rigor against the pace needed on the floor?",
    ],
  },
  "finance-staffing": {
    Entry: [
      "Walk me through how you'd reconcile a discrepancy in an account.",
      "What accounting or ERP systems have you used?",
      "How do you double-check your work before submitting it?",
      "What's the difference between accounts payable and accounts receivable?",
      "Walk me through how you'd reconcile a bank statement.",
      "What's your experience with Excel functions like VLOOKUP or pivot tables?",
    ],
    Mid: [
      "Tell me about a time you found an error in a report before it went out.",
      "How do you approach a tight month-end close deadline?",
      "Describe a time you had to explain a financial concept to a non-finance stakeholder.",
      "How would you build a basic three-statement financial model?",
      "Walk me through how you'd calculate variance between actual and budgeted spend.",
      "What's your understanding of GAAP revenue recognition principles?",
    ],
    Senior: [
      "How do you approach building a forecast model under real uncertainty?",
      "Tell me about a time you influenced a business decision with financial analysis.",
      "How do you manage a close process across multiple entities or teams?",
      "How do you approach a discounted cash flow valuation?",
      "Walk me through how you'd structure a rolling forecast model.",
      "How do you evaluate internal controls for a close process across multiple entities?",
    ],
  },
  "administrative-staffing": {
    Entry: [
      "How do you keep track of multiple deadlines and priorities?",
      "What scheduling or office tools are you comfortable using?",
      "Describe a time you had to handle a sensitive piece of information.",
      "How do you schedule across multiple time zones without double-booking someone?",
      "How do you set up an efficient filing or document management system?",
      "What's your experience with expense reporting tools?",
    ],
    Mid: [
      "Tell me about a time you managed a complex calendar across multiple time zones.",
      "How do you handle a last-minute change to travel or meeting plans?",
      "Describe how you've supported more than one executive at once.",
      "Walk me through how you'd coordinate logistics for a multi-city executive trip.",
      "How do you manage confidential documents and access permissions?",
      "What's your experience with project management tools like Asana or Trello?",
    ],
    Senior: [
      "How do you approach building a process that other admin staff can follow?",
      "Tell me about a time you managed a confidential or high-stakes project.",
      "How do you train and delegate to junior administrative staff?",
      "How do you design an onboarding process for new administrative staff?",
      "Walk me through how you'd manage a budget for office operations.",
      "How do you evaluate and select a new office management software system?",
    ],
  },
  "sales-staffing": {
    Entry: [
      "Walk me through how you'd research a prospect before a first call.",
      "How do you handle rejection over the course of a day of cold outreach?",
      "What CRM tools have you used to track your pipeline?",
      "What's your understanding of a sales funnel and where prospecting fits into it?",
      "How do you use a CRM to log and track activity day-to-day?",
      "What's your approach to writing a cold outreach message that gets a response?",
    ],
    Mid: [
      "Tell me about your most complex deal and how you navigated it to close.",
      "How do you manage a pipeline of accounts at different stages simultaneously?",
      "Describe a time you lost a deal. What did you learn from it?",
      "Walk me through how you'd build a business case for a prospect's economic buyer.",
      "How do you calculate and track your quota attainment?",
      "What's your experience with sales methodologies like MEDDIC or SPIN selling?",
    ],
    Senior: [
      "How do you approach forecasting your pipeline for leadership?",
      "Tell me about a time you had to rebuild trust with a churned account.",
      "How do you coach a rep who is missing quota?",
      "How do you build a territory or account segmentation plan?",
      "Walk me through how you'd forecast quarterly revenue with confidence intervals.",
      "How do you decide whether to discount a deal to close it versus holding firm?",
    ],
  },
  "customer-service-staffing": {
    Entry: [
      "How would you handle an upset customer on your first week?",
      "What do you do when you don't know the answer to a customer's question?",
      "Describe a time you had to follow a process exactly, even under pressure.",
      "What's your experience with helpdesk or ticketing software like Zendesk?",
      "How do you document a customer interaction for handoff to another team?",
      "What's your typical process for verifying a customer's account or identity?",
    ],
    Mid: [
      "Tell me about a time you turned around a frustrated customer relationship.",
      "How do you balance speed and quality when handling a high ticket volume?",
      "Describe a time you identified a product issue from a pattern in customer feedback.",
      "How do you use customer data to identify a recurring root-cause issue?",
      "Walk me through how you'd handle a support conversation that spans chat, email, and phone.",
      "What metrics (CSAT, NPS, AHT) do you track, and how do they shape your work?",
    ],
    Senior: [
      "How do you coach a team member through a difficult customer escalation?",
      "Tell me about a time you improved a support process or policy.",
      "How do you balance retention goals against what's actually right for the customer?",
      "How do you design a support workflow that reduces handle time without hurting quality?",
      "Walk me through how you'd build a knowledge base to reduce repeat tickets.",
      "How do you evaluate a support team's staffing needs against forecasted ticket volume?",
    ],
  },
  "logistics-staffing": {
    Entry: [
      "Describe your experience with warehouse management or inventory systems.",
      "How do you stay accurate when processing a high volume of orders?",
      "What would you do if you noticed a discrepancy in a shipment count?",
      "What's your experience with a WMS (warehouse management system) or barcode scanning?",
      "How do you verify inventory accuracy during a cycle count?",
      "What's your understanding of FIFO versus LIFO inventory methods?",
    ],
    Mid: [
      "Tell me about a time you had to solve an unexpected shipping delay.",
      "How do you manage competing priorities during a peak volume period?",
      "Describe your experience coordinating across multiple carriers or vendors.",
      "How do you approach optimizing a pick path in a warehouse?",
      "Walk me through how you'd resolve a discrepancy between a carrier's manifest and received goods.",
      "What's your experience with routing or TMS (transportation management system) software?",
    ],
    Senior: [
      "How do you approach demand planning under significant uncertainty?",
      "Tell me about a time you led a team through a peak-season ramp.",
      "How do you balance cost efficiency against service-level commitments?",
      "How do you approach network design decisions like hub placement or cross-docking?",
      "Walk me through how you'd build a demand forecast model to plan seasonal staffing.",
      "How do you evaluate a carrier's performance and negotiate rate or service terms?",
    ],
  },
};

export function getInterviewQuestionSet(
  industrySlug: string,
  roleLevel: InterviewQuestionSet["roleLevel"]
): InterviewQuestionSet {
  const specific = industryQuestions[industrySlug]?.[roleLevel] ?? [];
  return {
    industrySlug,
    roleLevel,
    questions: [...specific, ...commonQuestions[roleLevel]],
  };
}

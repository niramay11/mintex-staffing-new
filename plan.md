# Mintex Staffing Website — Build Plan

Sources: visual/design reference = uploaded "Ascend Staffing Homepage.html"; content structure = uploaded "Mintex Staffing Website Map.pdf".

## 1. Design System (from the homepage reference file)

- **Primary navy:** #003060 (headers, nav, footer, buttons) — matches the Mintex logo
- **Secondary navy:** #013d79 / #01376d
- **Steel blue accent:** #4A738C, #8FA6B8, #AFC0CE
- **Tan/beige accent:** #BFAE99, #D8CBB6
- **Backgrounds:** #EDEAE4 (cream), #F2F2F2, #e9e7e2
- **Font:** Inter (all weights)

## 2. Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS — mobile-first, responsive by default
- **Backend:** Next.js API routes
- **Database:** PostgreSQL via Prisma ORM
- **File storage:** S3-compatible bucket / Supabase Storage (resumes, videos, images)
- **Auth:** NextAuth/JWT for admin login
- **Hosting:** Vercel + managed Postgres (Neon/Supabase/Railway)

## 3. Full Site Map (from your Website Map PDF)

### Home (`/`)
- Sec 1 — Hero: H1 "Possibilities are endless for those who dare to dream beyond limits", H2 "Connecting exceptional talent with leading employers", CTA buttons: **Hire a Talent** / **Get Hired**
- Sec 2 — "You need to see it to believe it": client testimonial video section
- Sec 3 — "Why Us?": achievements, insights, guides
- Sec 4 — Industries we served (grid linking into industry pages)

### Get Hired (`/get-hired`)
- Apply to Jobs
- Share Your Resume
- New Job Alerts (email signup)
- Interview Preparation Guide

### Seek Talent (`/seek-talent`)
- Contract Talent
- Permanent Talent
- Executive Search
- How We Work / Our Work Style

### Industries (`/industries/[slug]`) — 9 landing pages, same 4-section template
IT Staffing, Healthcare Staffing, Engineering Staffing, Manufacturing Staffing, Finance Staffing, Administrative Staffing, Sales Staffing, Customer Service Staffing, Logistics Staffing.

Each page:
1. H1 "Hire Top [Industry] Talent" + SEO-rich subheading
2. Open roles in that industry (job tiles)
3. Sector insights (SEO blog content)
4. Why Us — achievements + work style in that industry

### Resources (`/resources`)
- Hiring Cost Calculator (interactive)
- Recruitment ROI Calculator (interactive)
- AI Interview Question Generator (needs an AI API)
- Hiring Checklist
- Salary Guide

### Insights (`/insights`) — blog/CMS-driven
- Career Insights
- Job Market Insights
- Ongoing Hiring Trends
- Blogs (index + individual post pages)

### About Us (`/about`)
- How We Started
- Know Our Leadership
- Our Work Style

### Case Studies (`/case-studies`)
- Client Testimonials
- Candidate Testimonials
- Other Case Studies

### Contact Us (`/contact`)
- Office address
- Phone, email, fax, contact form

## 4. Navigation

Top mega-menu: **Get Hired | Seek Talent | Industries | Resources | Insights | About Us | Case Studies | Contact Us**

Given 9 industry pages share one template, they'll be built as a single dynamic route (`/industries/[slug]`) driven by database content — not 9 hardcoded files. Same approach for Insights/blog posts and Case Studies, so new entries can be added without new code.

## 5. Database Schema (Prisma)

- `Job` — title, description, location, industry, type, salary range, status, postedAt
- `Application` — jobId, applicant info, resume file URL, status
- `EmployerRequest` — company, contact info, staffing need
- `ContactMessage` — name, email, subject, message
- `Industry` — slug, name, heroTitle, seoSubheading, achievements, workStyle
- `InsightPost` — slug, category (career/market/trends), title, body, publishedAt
- `CaseStudy` — type (client/candidate/other), title, quote, author, media
- `JobAlertSubscriber` — email, preferences
- `AdminUser` — email, hashed password, role

## 6. Functional Pieces That Need Extra Input From You

- **Hiring Cost Calculator / Recruitment ROI Calculator** — need the formulas/logic you want used
- **AI Interview Question Generator** — live AI API call (e.g. Claude API, needs a key) vs. a static question bank — your call
- **Client testimonial videos** — hosted where? (YouTube/Vimeo embed is simplest, or self-hosted via storage bucket)
- **New Job Alerts** — email capture + notification sending (e.g. via Resend/SendGrid) when matching jobs are posted

## 7. Responsive & Cross-Platform Support

- Mobile-first Tailwind breakpoints, tested at 320–1440px+
- Hamburger nav on mobile, mega-menu on desktop
- Cross-browser: Chrome, Firefox, Safari, Edge; cross-OS: Windows, macOS, Linux, iOS, Android
- Accessibility: semantic HTML, alt text, keyboard nav, contrast-checked against the navy/tan palette

## 8. SEO & Performance

- Per-page metadata, Open Graph tags, sitemap.xml, robots.txt
- `JobPosting` structured data on job pages
- Image/video optimization, Lighthouse 90+ target

## 9. Build Phases

1. Setup — Next.js + Tailwind scaffold, design tokens, shared layout (mega nav + footer)
2. Home page (4 hero sections)
3. Database + API routes (Jobs, Applications, Industries, Insights, Case Studies, Contact)
4. Templated Industry pages (dynamic route, 9 entries)
5. Get Hired + Seek Talent pages
6. Resources tools (2 calculators, AI generator, checklist, salary guide)
7. Insights/blog system
8. Case Studies + About Us + Contact Us
9. Admin dashboard (manage jobs/industries/posts/case studies/leads, behind login)
10. Responsive + cross-browser/OS QA, accessibility, performance pass
11. Deploy (Vercel + DB + storage bucket + domain/SSL)

## 10. Still Needed From You

- Formulas for both calculators
- Decision on AI generator approach (live API vs. static bank)
- Logo, brand photos/videos, and final copy for every page above
- Office address and contact details
- About Us content (history, leadership bios) and testimonials for Case Studies
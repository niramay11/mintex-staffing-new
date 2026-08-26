import nodemailer from 'nodemailer';
import path from 'path';
import { SITE_URL } from './site';

// Referenced as `cid:${LOGO_CID}` in email HTML and attached inline below —
// mail clients block/can't reach the localhost dev URL a plain <img src>
// would point at, so the logo has to travel with the email itself.
const LOGO_CID = 'mintex-logo';
const LOGO_PATH = path.join(process.cwd(), 'public', 'logo-navy.png');

// ─── Brand shell ──────────────────────────────────────────────────────────────
// Every transactional email shares one branded wrapper — logo header, cream
// body, tan footer — matching the site's navy/steel/tan/cream palette
// (src/app/globals.css @theme) instead of ad-hoc per-email colors.
const BRAND = {
  navy: '#003060',
  navySecondary: '#013d79',
  steel: '#4a738c',
  tan: '#bfae99',
  tanLight: '#d8cbb6',
  cream: '#edeae4',
};

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function siteUrl(): string {
  return SITE_URL;
}

// Every branded email goes through here so the logo attachment is never forgotten.
async function sendBrandedMail(options: Parameters<nodemailer.Transporter['sendMail']>[0]) {
  const transporter = createTransporter();
  await transporter.verify();
  await transporter.sendMail({
    ...options,
    attachments: [
      { filename: 'logo-navy.png', path: LOGO_PATH, cid: LOGO_CID },
      ...(options.attachments ?? []),
    ],
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

// Pill-shaped call-to-action button matching the site's rounded-full buttons.
function button(label: string, href: string): string {
  return `
    <a href="${href}" style="display:inline-block;background:${BRAND.navy};color:#ffffff;text-decoration:none;
      font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;padding:14px 28px;border-radius:999px;">
      ${escapeHtml(label)}
    </a>
  `;
}

// Wraps arbitrary body HTML in the shared logo header / cream card / footer shell.
function wrapEmail(bodyHtml: string, footerNote?: string): string {
  const url = siteUrl();
  const year = new Date().getFullYear();

  return `
    <div style="margin:0;padding:32px 16px;background:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.tanLight};">
        <div style="padding:28px 32px;border-bottom:3px solid ${BRAND.navy};">
          <img src="cid:${LOGO_CID}" alt="Mintex Staffing" width="160" height="22" style="display:block;border:0;height:auto;max-width:160px;" />
        </div>
        <div style="padding:32px;color:${BRAND.navy};font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </div>
        <div style="padding:20px 32px;background:${BRAND.cream};border-top:1px solid ${BRAND.tanLight};">
          ${footerNote ? `<p style="margin:0 0 8px;font-size:12px;color:${BRAND.steel};">${footerNote}</p>` : ''}
          <p style="margin:0;font-size:12px;color:${BRAND.steel};">© ${year} Mintex Staffing. All rights reserved.</p>
          <p style="margin:6px 0 0;font-size:12px;"><a href="${url}" style="color:${BRAND.steel};">mintexstaffing.com</a></p>
        </div>
      </div>
    </div>
  `;
}

// ─── Portal credentials ───────────────────────────────────────────────────────
export async function sendPortalCredentials(to: string, username: string, password: string) {
  const portalUrl = `${siteUrl()}/clients/portal`;
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND.navy};">Welcome to the Mintex Client Portal</h2>
    <p style="margin:0 0 24px;color:${BRAND.steel};">Your portal access is ready. Use the credentials below to sign in.</p>
    <div style="background:${BRAND.cream};border-radius:10px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;"><strong>Username:</strong> <span style="font-family:monospace;">${escapeHtml(username)}</span></p>
      <p style="margin:0;"><strong>Password:</strong> <span style="font-family:monospace;">${escapeHtml(password)}</span></p>
    </div>
    <p style="margin:0 0 24px;">${button('Sign in to the portal', portalUrl)}</p>
    <p style="margin:0;font-size:13px;color:${BRAND.steel};">If you have any questions, contact your Mintex account manager.</p>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Your Mintex Client Portal Access',
    html: wrapEmail(body),
  });
}

// ─── Job alerts ───────────────────────────────────────────────────────────────
export async function sendJobAlertConfirmation(to: string, unsubscribeUrl: string) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND.navy};">Job alert created</h2>
    <p style="margin:0 0 24px;color:${BRAND.steel};">We'll email you as soon as a matching role goes live on the Mintex job board.</p>
    <p style="margin:0;">${button('Browse open roles', `${siteUrl()}/get-hired`)}</p>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: "You're subscribed to Mintex job alerts",
    html: wrapEmail(body, `<a href="${unsubscribeUrl}" style="color:${BRAND.steel};">Unsubscribe</a> from this alert at any time.`),
  });
}

export async function sendJobAlertDigest(
  to: string,
  jobs: { job_title: string; location?: string; job_code: string }[],
  unsubscribeUrl: string
) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const rows = jobs.map((job) => `
    <div style="padding:14px 0;border-bottom:1px solid ${BRAND.tanLight};">
      <p style="margin:0;font-weight:700;color:${BRAND.navy};">${escapeHtml(job.job_title)}</p>
      ${job.location ? `<p style="margin:4px 0 0;font-size:13px;color:${BRAND.steel};">${escapeHtml(job.location)}</p>` : ''}
    </div>
  `).join('');

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND.navy};">New roles matching your alert</h2>
    <p style="margin:0 0 20px;color:${BRAND.steel};">${jobs.length} new ${jobs.length === 1 ? 'role' : 'roles'} just went live that match what you're looking for.</p>
    <div style="background:${BRAND.cream};border-radius:10px;padding:8px 20px;margin-bottom:24px;">
      ${rows}
    </div>
    <p style="margin:0;">${button('View all jobs', `${siteUrl()}/get-hired`)}</p>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: jobs.length === 1 ? `New job match: ${jobs[0].job_title}` : `${jobs.length} new job matches for your alert`,
    html: wrapEmail(body, `<a href="${unsubscribeUrl}" style="color:${BRAND.steel};">Unsubscribe</a> from this alert.`),
  });
}

// ─── Shared resume ────────────────────────────────────────────────────────────
export async function sendResumeConfirmation(to: string, name: string) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND.navy};">Thanks for sharing your resume${name ? `, ${escapeHtml(name.split(' ')[0])}` : ''}!</h2>
    <p style="margin:0 0 24px;color:${BRAND.steel};">Our recruiters have received your resume and will keep you in mind as matching roles open up across every industry we staff.</p>
    <p style="margin:0;">${button('Browse open roles', `${siteUrl()}/get-hired`)}</p>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: "We've received your resume — Mintex Staffing",
    html: wrapEmail(body),
  });
}

export async function sendResumeNotification(fields: { name: string; email: string; industry?: string; resumeFilename: string }) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const to = (process.env.CONTACT_NOTIFY_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);
  if (to.length === 0) return;

  const name = escapeHtml(fields.name);
  const email = escapeHtml(fields.email);
  const industry = fields.industry ? escapeHtml(fields.industry) : '';
  const filename = escapeHtml(fields.resumeFilename);

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND.navy};">New Resume Shared</h2>
    <div style="background:${BRAND.cream};border-radius:10px;padding:20px;margin-bottom:8px;">
      <p style="margin:0 0 10px;"><strong>Name:</strong> ${name}</p>
      <p style="margin:0 0 10px;"><strong>Email:</strong> ${email}</p>
      ${industry ? `<p style="margin:0 0 10px;"><strong>Industry of interest:</strong> ${industry}</p>` : ''}
      <p style="margin:0;"><strong>Resume file:</strong> ${filename}</p>
    </div>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    replyTo: fields.email,
    subject: `New Resume Shared: ${fields.name}`,
    html: wrapEmail(body, 'View and download the resume from the admin panel.'),
  });
}

// ─── Hiring inquiries ─────────────────────────────────────────────────────────
export async function sendHiringInquiryNotification(fields: {
  name: string; email: string; phone: string; company: string; position: string;
  jobTitle: string; zipCode: string; preferredContact: string;
}) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const to = (process.env.CONTACT_NOTIFY_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);
  if (to.length === 0) return;

  const name = escapeHtml(fields.name);
  const email = escapeHtml(fields.email);
  const phone = escapeHtml(fields.phone);
  const company = escapeHtml(fields.company);
  const position = escapeHtml(fields.position);
  const jobTitle = escapeHtml(fields.jobTitle);
  const zipCode = escapeHtml(fields.zipCode);
  const preferredContact = fields.preferredContact === 'email' ? 'Email' : 'Phone';

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND.navy};">New Hiring Inquiry</h2>
    <div style="background:${BRAND.cream};border-radius:10px;padding:20px;margin-bottom:8px;">
      <p style="margin:0 0 10px;"><strong>Name:</strong> ${name}</p>
      <p style="margin:0 0 10px;"><strong>Email:</strong> ${email}</p>
      <p style="margin:0 0 10px;"><strong>Phone:</strong> ${phone}</p>
      <p style="margin:0 0 10px;"><strong>Company:</strong> ${company}</p>
      <p style="margin:0 0 10px;"><strong>Position:</strong> ${position}</p>
      <p style="margin:0 0 10px;"><strong>Job title to fill:</strong> ${jobTitle}</p>
      <p style="margin:0 0 10px;"><strong>Zip code:</strong> ${zipCode}</p>
      <p style="margin:0;"><strong>Preferred way of contacting:</strong> ${preferredContact}</p>
    </div>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    replyTo: fields.email,
    subject: `New Hiring Inquiry: ${fields.name} — ${fields.jobTitle}`,
    html: wrapEmail(body, 'View and manage all inquiries in the admin panel.'),
  });
}

export async function sendInquiryAccepted(fields: { name: string; email: string }) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const firstName = escapeHtml(fields.name.split(' ')[0]);

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND.navy};">Your conversation request has been accepted</h2>
    <p style="margin:0 0 24px;color:${BRAND.steel};">Hi ${firstName}, great news — one of our recruiters has accepted your request and will reach out to you shortly.</p>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: fields.email,
    subject: 'Your conversation request has been accepted — Mintex Staffing',
    html: wrapEmail(body),
  });
}

// ─── Contact form ─────────────────────────────────────────────────────────────
export async function sendContactNotification(fields: {
  name: string; email: string; company?: string; phone?: string; subject: string; message: string;
}) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const to = (process.env.CONTACT_NOTIFY_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);
  if (to.length === 0) return;

  const name = escapeHtml(fields.name);
  const email = escapeHtml(fields.email);
  const company = fields.company ? escapeHtml(fields.company) : '';
  const phone = fields.phone ? escapeHtml(fields.phone) : '';
  const subject = escapeHtml(fields.subject);
  const message = escapeHtml(fields.message);

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND.navy};">New Contact Us Submission</h2>
    <div style="background:${BRAND.cream};border-radius:10px;padding:20px;margin-bottom:8px;">
      <p style="margin:0 0 10px;"><strong>Name:</strong> ${name}</p>
      <p style="margin:0 0 10px;"><strong>Email:</strong> ${email}</p>
      ${company ? `<p style="margin:0 0 10px;"><strong>Company:</strong> ${company}</p>` : ''}
      ${phone ? `<p style="margin:0 0 10px;"><strong>Phone:</strong> ${phone}</p>` : ''}
      <p style="margin:0 0 10px;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin:0;white-space:pre-wrap;"><strong>Message:</strong><br/>${message}</p>
    </div>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    replyTo: fields.email,
    subject: `New Contact Form Message: ${fields.subject}`,
    html: wrapEmail(body, 'View and manage all messages in the admin panel.'),
  });
}

// ─── Hiring calculator breakdown ──────────────────────────────────────────────
export async function sendHiringCalculatorBreakdown(fields: {
  to: string;
  heading: string;
  headlineLabel: string;
  headlineValue: string;
  lines: { label: string; value: string; strong?: boolean; accent?: boolean }[];
}) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const rows = fields.lines.map((line) => `
    <div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid ${BRAND.tanLight};">
      <span style="${line.strong ? 'font-weight:700;' : ''}color:${BRAND.navy};">${escapeHtml(line.label)}</span>
      <span style="${line.strong ? 'font-weight:700;' : 'font-weight:600;'}color:${line.accent ? '#0f7a52' : BRAND.navy};white-space:nowrap;">${escapeHtml(line.value)}</span>
    </div>
  `).join('');

  const body = `
    <h2 style="margin:0 0 4px;color:${BRAND.navy};">${escapeHtml(fields.heading)}</h2>
    <p style="margin:0 0 20px;color:${BRAND.steel};">Here's the full breakdown from your Mintex Hiring Cost Calculator session.</p>
    <div style="background:${BRAND.cream};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.steel};">${escapeHtml(fields.headlineLabel)}</p>
      <p style="margin:6px 0 0;font-size:26px;font-weight:700;color:${BRAND.navy};">${escapeHtml(fields.headlineValue)}</p>
    </div>
    <div style="border-radius:10px;overflow:hidden;">
      ${rows}
    </div>
    <p style="margin:24px 0 0;">${button('Talk to Mintex about your numbers', `${siteUrl()}/seek-talent/get-started`)}</p>
    <p style="margin:16px 0 0;font-size:12px;color:${BRAND.steel};">These are planning estimates based on the numbers you entered, not a quote.</p>
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: fields.to,
    subject: 'Your Hiring Cost Breakdown — Mintex Staffing',
    html: wrapEmail(body),
  });
}

// ─── Interview kit ─────────────────────────────────────────────────────────────
// Unlike the calculator (client-computed, no stable URL to revisit), an
// interview kit is deterministic from its slug — the email's job is mostly
// to hand back a durable link, with the competency map and question counts
// as a preview of what's behind it.
export async function sendInterviewKitEmail(fields: {
  to: string;
  roleTitle: string;
  state: string;
  competencies: string[];
  sections: { label: string; count: number }[];
  // null for the JD-paste/resume flow, which has no server-side page to
  // link back to (the kit only ever lived in that browser tab) — the email
  // stays the same compact summary either way, just without the "view kit"
  // button, since there's nowhere for it to point.
  kitUrl: string | null;
}) {
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const totalQuestions = fields.sections.reduce((sum, s) => sum + s.count, 0);

  const competencyPills = fields.competencies.map((c) => `
    <span style="display:inline-block;background:${BRAND.cream};color:${BRAND.navy};font-size:12px;font-weight:600;padding:6px 12px;border-radius:999px;margin:0 6px 6px 0;">${escapeHtml(c)}</span>
  `).join('');

  const sectionRows = fields.sections.map((s) => `
    <div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid ${BRAND.tanLight};">
      <span style="color:${BRAND.navy};">${escapeHtml(s.label)}</span>
      <span style="font-weight:600;color:${BRAND.navy};white-space:nowrap;">${s.count} question${s.count === 1 ? '' : 's'}</span>
    </div>
  `).join('');

  const ctaOrNote = fields.kitUrl
    ? `
      <p style="margin:24px 0 0;">${button('View your interview kit', fields.kitUrl)}</p>
      <p style="margin:16px 0 0;font-size:12px;color:${BRAND.steel};">Bookmark this link — it stays up to date and works on any device.</p>
    `
    : `
      <p style="margin:24px 0 0;font-size:12px;color:${BRAND.steel};">This kit was generated from a pasted job posting and isn't saved anywhere on our end — this email is the only copy, so hang onto it.</p>
    `;

  const body = `
    <h2 style="margin:0 0 4px;color:${BRAND.navy};">${escapeHtml(fields.roleTitle)} Interview Kit</h2>
    <p style="margin:0 0 20px;color:${BRAND.steel};">Here's your competency map and question breakdown — plus your rights in ${escapeHtml(fields.state)}.</p>
    <div style="background:${BRAND.cream};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.steel};">Total practice questions</p>
      <p style="margin:6px 0 0;font-size:26px;font-weight:700;color:${BRAND.navy};">${totalQuestions}</p>
    </div>
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.steel};">Competencies covered</p>
    <div style="margin:0 0 20px;">${competencyPills}</div>
    <div style="border-radius:10px;overflow:hidden;margin-bottom:20px;">${sectionRows}</div>
    ${ctaOrNote}
  `;

  await sendBrandedMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: fields.to,
    subject: `Your ${fields.roleTitle} Interview Kit — Mintex Staffing`,
    html: wrapEmail(body),
  });
}

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const fullNameRaw      = formData.get('fullName') as string;
        const email            = formData.get('email') as string;
        const mobileNumber     = formData.get('mobileNumber') as string;
        const workAuthorization= formData.get('workAuthorization') as string;
        const country          = formData.get('country') as string;
        const state            = formData.get('state') as string || '';
        const city             = formData.get('city') as string;
        const address          = formData.get('address') as string || '';
        const zipCode          = formData.get('zipCode') as string || '';
        const jobTitle         = formData.get('jobTitle') as string;
        const availability     = formData.get('availability') as string;
        const comments         = formData.get('comments') as string || '';
        const relocation       = formData.get('relocation') as string || 'No';
        const videoLink        = formData.get('videoLink') as string || '';
        const signatureText    = formData.get('signatureText') as string;
        const jobsStr          = formData.get('jobs') as string;
        const resume           = formData.get('resume') as File | null;

        const fullName = fullNameRaw || '';
        const location = [city, state, country, zipCode].filter(Boolean).join(', ');

        if (!fullName || !email || !mobileNumber || !jobsStr) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const jobs = JSON.parse(jobsStr);

        const jobRows = jobs.map((j: { job_code: string; job_title: string; location: string; pay_rate: string }) =>
            `<tr>
                <td style="padding:8px 12px;border:1px solid #e5e7eb;font-family:monospace;color:#0762AF;">${j.job_code}</td>
                <td style="padding:8px 12px;border:1px solid #e5e7eb;">${j.job_title}</td>
                <td style="padding:8px 12px;border:1px solid #e5e7eb;">${j.location}</td>
                <td style="padding:8px 12px;border:1px solid #e5e7eb;">${j.pay_rate}</td>
            </tr>`
        ).join('');

        const row = (label: string, value: string) => value
            ? `<tr><td style="padding:5px 0;color:#666;width:180px;font-size:13px;font-weight:600;">${label}</td><td style="padding:5px 0;color:#333;font-size:13px;">${value}</td></tr>`
            : '';

        const htmlContent = `
            <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
                <div style="background:#06091e;padding:24px 32px;border-radius:12px 12px 0 0;">
                    <h2 style="color:#57EEFF;margin:0;font-size:20px;">New Job Application</h2>
                    <p style="color:#888;margin:4px 0 0;font-size:13px;">Mintex Staffing — Career Portal</p>
                </div>

                <div style="background:#fff;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;">

                    <h3 style="color:#111;margin:0 0 14px;font-size:15px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">Applicant Details</h3>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
                        ${row('Full Name', fullName)}
                        ${row('Email', `<a href="mailto:${email}" style="color:#0762AF;">${email}</a>`)}
                        ${row('Mobile Number', mobileNumber)}
                        ${row('Work Authorization', workAuthorization)}
                        ${row('Location', location)}
                        ${address ? row('Address', address) : ''}
                        ${row('Current Job Title', jobTitle)}
                        ${row('Availability', availability)}
                        ${row('Relocation', relocation)}
                        ${row('Signature', signatureText)}
                        ${videoLink ? row('Video Link', `<a href="${videoLink}" style="color:#0762AF;">${videoLink}</a>`) : ''}
                        ${comments ? row('Comments', comments) : ''}
                    </table>

                    <h3 style="color:#111;margin:0 0 12px;font-size:15px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">Applied Position${jobs.length > 1 ? 's' : ''} (${jobs.length})</h3>
                    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px;">
                        <thead>
                            <tr style="background:#f3f4f6;">
                                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;">Job Code</th>
                                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;">Title</th>
                                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;">Location</th>
                                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;">Pay Rate</th>
                            </tr>
                        </thead>
                        <tbody>${jobRows}</tbody>
                    </table>
                </div>

                <div style="background:#f9fafb;padding:14px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
                    <p style="color:#999;font-size:11px;margin:0;">Submitted via the Mintex Staffing career portal.</p>
                </div>
            </div>
        `;

        const textContent = `
New Job Application — Mintex Staffing

Applicant:
  Name:              ${fullName}
  Email:             ${email}
  Mobile:            ${mobileNumber}
  Work Authorization:${workAuthorization}
  Location:          ${location}
${address ? `  Address:           ${address}\n` : ''}  Current Job Title: ${jobTitle}
  Availability:      ${availability}
  Relocation:        ${relocation}
  Signature:         ${signatureText}
${videoLink ? `  Video Link:        ${videoLink}\n` : ''}${comments ? `  Comments:          ${comments}\n` : ''}
Applied Positions:
${jobs.map((j: { job_code: string; job_title: string; location: string }) => `  - ${j.job_code}: ${j.job_title} (${j.location})`).join('\n')}
        `.trim();

        const attachments: { filename: string; content: Buffer }[] = [];
        if (resume) {
            attachments.push({ filename: resume.name, content: Buffer.from(await resume.arrayBuffer()) });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
            from:    process.env.SMTP_USER,
            to:      ['Sanjay@mintextech.com', 'Niramay@mintextech.com'].join(', '),
            replyTo: email,
            subject: `New Application: ${fullName} — ${jobs.map((j: { job_title: string }) => j.job_title).join(', ')}`,
            text:    textContent,
            html:    htmlContent,
            attachments,
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Application submit error:', error);
        return NextResponse.json({ error: 'Failed to submit application. Please try again later.' }, { status: 500 });
    }
}

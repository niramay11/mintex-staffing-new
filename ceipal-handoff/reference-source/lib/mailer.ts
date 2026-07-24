import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPortalCredentials(to: string, username: string, password: string) {
  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mintexstaffing.com'}/clients/portal`;
  const fromName  = process.env.SMTP_FROM_NAME  || 'Mintex Staffing';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const transporter = createTransporter();

  // Verify connection before sending
  await transporter.verify();

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Your Mintex Client Portal Access',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">
        <h2 style="color:#f97316;margin:0 0 8px;">Welcome to the Mintex Client Portal</h2>
        <p style="color:#94a3b8;margin:0 0 24px;">Your portal access is ready. Use the credentials below to sign in.</p>
        <div style="background:#1e293b;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;"><strong>Portal URL:</strong> <a href="${portalUrl}" style="color:#f97316;">${portalUrl}</a></p>
          <p style="margin:0 0 10px;"><strong>Username:</strong> <span style="font-family:monospace;color:#f97316;">${username}</span></p>
          <p style="margin:0;"><strong>Password:</strong> <span style="font-family:monospace;">${password}</span></p>
        </div>
        <p style="color:#64748b;font-size:13px;">If you have any questions, contact your Mintex account manager.</p>
      </div>
    `,
  });
}

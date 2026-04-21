type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<{ error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { error: "Missing RESEND_API_KEY or EMAIL_FROM" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { error: `Email send failed: ${response.status} ${body}` };
  }

  return { error: null };
}

type TripRegistrationEmailInput = {
  to: string;
  tripTitle: string;
  tripId: string;
  // Optional magic-link URL that lets a guest convert their RSVP into a
  // real account. Included in the email body when present.
  claimUrl?: string | null;
  // Controls the call-to-action URL. Day events link to /day-events/<id>,
  // overnight trips link to /trips/<id>.
  detailPath?: "trips" | "day-events";
};

export async function sendTripRegistrationConfirmation({
  to,
  tripTitle,
  tripId,
  claimUrl,
  detailPath = "trips",
}: TripRegistrationEmailInput): Promise<{ error: string | null }> {
  const subject = `You're registered for ${tripTitle}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const detailUrl = `${site}/${detailPath}/${tripId}`;

  const claimHtml = claimUrl
    ? `
      <div style="margin-top:24px;padding:16px;background:#f0f8f4;border:1px solid #d6eadf;border-radius:10px;">
        <p style="margin:0 0 8px;font-size:14px;color:#111827;font-weight:600;">
          Want to manage your trips?
        </p>
        <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.5;">
          Create an optional account and your RSVP history will follow you.
          No re-signup — just pick a password.
        </p>
        <a href="${claimUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;font-size:14px;">
          Create account
        </a>
      </div>
    `
    : "";

  const claimText = claimUrl
    ? `\n\nWant to manage your trips? Create an optional account: ${claimUrl}`
    : "";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f7f5;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;color:#15803d;font-weight:700;">SAKINA</p>
        <h2 style="margin:0 0 12px;color:#111827;">You're registered!</h2>
        <p style="margin:0 0 12px;color:#374151;">
          Confirmed for <strong>${tripTitle}</strong>.
        </p>
        <p style="margin:0 0 20px;color:#374151;">
          View details any time:
        </p>
        <a href="${detailUrl}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">
          View event
        </a>
        ${claimHtml}
      </div>
    </div>
  `;

  const text = `You're registered for ${tripTitle}. View details: ${detailUrl}${claimText}`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

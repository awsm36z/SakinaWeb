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
};

export async function sendTripRegistrationConfirmation({
  to,
  tripTitle,
  tripId,
}: TripRegistrationEmailInput): Promise<{ error: string | null }> {
  const subject = `You're registered for ${tripTitle}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f7f5;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;color:#15803d;font-weight:700;">SAKINA</p>
        <h2 style="margin:0 0 12px;color:#111827;">Trip Registration Confirmed</h2>
        <p style="margin:0 0 12px;color:#374151;">
          You're confirmed for <strong>${tripTitle}</strong>.
        </p>
        <p style="margin:0 0 20px;color:#374151;">
          You can view trip details anytime:
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/trips/${tripId}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">
          View Trip
        </a>
      </div>
    </div>
  `;

  const text = `Trip registration confirmed: ${tripTitle}. View details: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/trips/${tripId}`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

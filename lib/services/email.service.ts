/**
 * Transactional email via Resend free tier.
 * Without RESEND_API_KEY, links are logged (local/dev).
 */
import { ExternalServiceError } from "@/lib/errors";

const FROM =
  process.env.EMAIL_FROM?.trim() || "HouseMe <onboarding@resend.dev>";

function hasResend() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info(`[email] ${params.subject} → ${params.to}\n${params.text}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[email] Resend failed:", response.status, body);
    throw new ExternalServiceError("Could not send email right now.");
  }
}

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
  <p style="font-size:20px;font-weight:700">HouseMe</p>
  <h1 style="font-size:18px">${title}</h1>
  ${bodyHtml}
  <p style="color:#666;font-size:12px;margin-top:24px">HouseMe · verified housing in Nigeria</p>
</body></html>`;
}

export const emailService = {
  isConfigured: hasResend,

  async sendVerification(to: string, url: string): Promise<void> {
    await sendEmail({
      to,
      subject: "Verify your HouseMe email",
      text: `Verify your email: ${url}`,
      html: layout(
        "Verify your email",
        `<p>Confirm this address to activate your HouseMe account.</p>
         <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#A6904A;color:#fff;text-decoration:none;border-radius:999px">Verify email</a></p>
         <p style="font-size:12px;color:#666">Or open: ${url}</p>`,
      ),
    });
  },

  async sendPasswordReset(to: string, url: string): Promise<void> {
    await sendEmail({
      to,
      subject: "Reset your HouseMe password",
      text: `Reset your password: ${url}`,
      html: layout(
        "Reset your password",
        `<p>We received a request to reset your password.</p>
         <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#A6904A;color:#fff;text-decoration:none;border-radius:999px">Choose a new password</a></p>
         <p style="font-size:12px;color:#666">Or open: ${url}</p>`,
      ),
    });
  },

  async sendListingApproved(to: string, listingId: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://houseme.vercel.app"}/listings/${listingId}`;
    await sendEmail({
      to,
      subject: "Your listing is live on HouseMe",
      text: `Your listing is live: ${url}`,
      html: layout(
        "Listing approved",
        `<p>Your listing passed review and is now visible to tenants.</p>
         <p><a href="${url}">View listing</a></p>`,
      ),
    });
  },

  async sendListingRejected(
    to: string,
    listingId: string,
    reason: string,
  ): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://houseme.vercel.app"}/dashboard/landlord/listings/${listingId}/edit`;
    await sendEmail({
      to,
      subject: "Your HouseMe listing needs changes",
      text: `Rejected: ${reason}\nFix here: ${url}`,
      html: layout(
        "Listing needs changes",
        `<p>We couldn't publish this listing yet.</p>
         <p><strong>Reason:</strong> ${reason}</p>
         <p><a href="${url}">Edit listing</a></p>`,
      ),
    });
  },
};

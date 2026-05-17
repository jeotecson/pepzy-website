// Example Vercel serverless function for sending the confirmation email.
// This replaces the PHP email.php endpoint.
//
// NOTE: You must install `resend` and configure Vercel environment variables.
// - RESEND_API_KEY
// - RESEND_FROM_EMAIL (sender email)
//
// Install: npm i resend
// Deploy: in Vercel, place this file under /api/send-order-email.js (or .ts)
// with proper name matching your route.

import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Invalid method" });
  }

  try {
    const { orderId, name, email, productNames } = req.body || {};

    if (!orderId || !name || !email || !productNames) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const subject = `Order Request Received! ${orderId}`;

    const body = `Hi ${name},\n\n` +
      `We have received your order request for ${productNames}.\n` +
      `We are currently checking our warehouse inventory to secure your batch.\n` +
      `Once confirmed, we will send over your GoTyme QR code for payment.\n` +
      `Expect an update soon!\n`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      return res.status(500).json({ ok: false, error: "Missing RESEND_FROM_EMAIL" });
    }

    // Resend text email
    const result = await resend.emails.send({
      from,
      to: email,
      subject,
      text: body
    });

    return res.status(200).json({ ok: true, sent: true, messageId: result?.data?.id || null });
  } catch (e) {
    // Never block checkout redirect; just return ok:false.
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}


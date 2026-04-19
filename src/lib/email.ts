import { Resend } from "resend";

export async function sendPaymentFailedNotice(params: {
  to: string;
  invoiceId?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) return;

  const resend = new Resend(key);
  await resend.emails.send({
    from,
    to: params.to,
    subject: "Qarar: payment failed — action needed",
    html: `<p>We could not process your latest Qarar subscription payment.</p>
      <p>Please update your payment method to avoid losing Pro/Elite access.</p>
      ${params.invoiceId ? `<p>Invoice reference: ${params.invoiceId}</p>` : ""}`,
  });
}

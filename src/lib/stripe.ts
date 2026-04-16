import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

/** Free-tier-first: checkout returns null if Stripe is not configured. */
export async function createCheckoutSession(params: {
  priceId: string;
  customerId?: string | null;
  successUrl: string;
  cancelUrl: string;
  clientReferenceId: string;
}) {
  const s = getStripe();
  if (!s) return null;

  return s.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.clientReferenceId,
    ...(params.customerId ? { customer: params.customerId } : {}),
  });
}

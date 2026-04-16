import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="font-heading text-4xl text-text-primary">Pricing</h1>
      <p className="mt-4 text-text-secondary">
        See full comparison on the home page pricing section.
      </p>
      <Link
        href="/#pricing"
        className="mt-8 inline-block rounded-lg bg-accent-primary px-6 py-3 text-sm font-medium text-bg-primary"
      >
        View pricing
      </Link>
      <div className="mt-12 text-sm text-text-tertiary">
        <Link href="/" className="text-accent-primary hover:underline">
          ← Back home
        </Link>
      </div>
    </div>
  );
}

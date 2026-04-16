import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl text-text-primary">Privacy & terms</h1>
      <p className="mt-6 text-sm leading-relaxed text-text-secondary">
        Qarar is built for forensic clarity. This placeholder page routes marketing footer links. Replace
        with your counsel-reviewed policies before launch.
      </p>
      <p className="mt-4 text-sm text-text-secondary">
        Contact:{" "}
        <a href="mailto:hello@qarar.app" className="text-accent-primary hover:underline">
          hello@qarar.app
        </a>
      </p>
      <Link href="/" className="mt-10 inline-block text-accent-primary hover:underline">
        ← Back home
      </Link>
    </div>
  );
}

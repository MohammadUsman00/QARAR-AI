"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AutopsyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-20 text-center">
      <h1 className="font-heading text-2xl text-text-primary">Autopsy engine paused</h1>
      <p className="text-sm text-text-secondary">
        {error.message || "Something went wrong while generating your report."}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={reset}>Try again</Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

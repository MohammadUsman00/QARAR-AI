"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="font-display text-lg italic text-accent-primary">Something went wrong</p>
      <h1 className="mt-4 font-heading text-2xl text-text-primary">We couldn&apos;t load this page</h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        {error.message || "An unexpected error occurred. Try again or return to your dashboard."}
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/dashboard">Dashboard</a>
        </Button>
      </div>
    </div>
  );
}

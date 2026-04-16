import { Suspense } from "react";
import { AutopsyClient } from "./autopsy-client";

export default function AutopsyPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl animate-pulse pb-24">
          <div className="mb-8 h-10 w-64 rounded bg-bg-tertiary" />
          <div className="h-64 rounded-xl bg-bg-tertiary" />
        </div>
      }
    >
      <AutopsyClient />
    </Suspense>
  );
}

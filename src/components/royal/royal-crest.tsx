import { cn } from "@/lib/utils";

export function RoyalCrest({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-accent-primary", className)}
      aria-hidden
    >
      <circle
        cx="32"
        cy="32"
        r="30"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.35"
      />
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.2"
      />
      <path
        d="M32 8 L36 22 L50 22 L39 30 L43 44 L32 36 L21 44 L25 30 L14 22 L28 22 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M32 48 C28 52 24 54 20 54 C24 50 26 46 26 42"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
        fill="none"
      />
      <path
        d="M32 48 C36 52 40 54 44 54 C40 50 38 46 38 42"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
        fill="none"
      />
    </svg>
  );
}

import { cn } from "@/lib/utils";

export default function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-800 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
        className
      )}
    >
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils";

export default function Section({
  id,
  title,
  subtitle,
  children,
  className,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-12", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

import type { CommunityStat } from "@/lib/site-data";
import { cn } from "@/lib/utils";

interface StatCardProps {
  stat: CommunityStat;
}

/**
 * Single headline number, rendered as a `dt`/`dd` pair so a list of these can
 * form a valid `dl`. Values live in `lib/site-data.ts` so the section can be
 * updated without touching the markup.
 */
export function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;

  return (
    <div className="rounded-lg border bg-card p-5">
      <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        {stat.label}
      </dt>
      <dd className="mt-3">
        <span className="block text-3xl font-semibold tracking-tight text-card-foreground">
          {stat.value}
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
          {stat.description}
        </span>
      </dd>
    </div>
  );
}

interface StatListProps {
  stats: CommunityStat[];
  /** Merged onto the default responsive grid, so callers can add spacing. */
  className?: string;
}

export function StatList({
  stats,
  className,
}: StatListProps) {
  return (
    <dl className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </dl>
  );
}
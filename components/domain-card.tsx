import type { Domain } from "@/lib/site-data";

interface DomainCardProps {
  domain: Domain;
  /** Also renders the slug as an `id` so the card can be linked to directly. */
  anchorable?: boolean;
}

/**
 * One card per technical domain. Used on both the home and about pages.
 */
export function DomainCard({ domain, anchorable = false }: DomainCardProps) {
  const Icon = domain.icon;

  return (
    <div
      id={anchorable ? domain.slug : undefined}
      className="rounded-lg border bg-card p-5"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-card-foreground">
        {domain.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {domain.description}
      </p>
    </div>
  );
}
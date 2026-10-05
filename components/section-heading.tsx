import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Keeps headings readable when they sit on a tinted band. */
  size?: "default" | "page";
  /** Use 1 for the page's primary heading, 2 for section headings. */
  level?: 1 | 2;
}

/**
 * Shared heading block so every section on the site shares one hierarchy.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  size = "default",
  level = 2,
}: SectionHeadingProps) {
  const Heading = `h${level}` as const;

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={cn(
          "text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl",
          size === "page" && "text-3xl sm:text-4xl"
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
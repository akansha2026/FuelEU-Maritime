import { cn } from "../primitives/cn";

interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  variant?: "default" | "success" | "danger";
}

const borderColors = {
  default: "border-l-primary",
  success: "border-l-success",
  danger: "border-l-destructive",
};

const valueColors = {
  default: "text-foreground",
  success: "text-success",
  danger: "text-destructive",
};

export function KpiCard({
  label,
  value,
  sublabel,
  variant = "default",
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5",
        "border-l-[3px]",
        borderColors[variant],
      )}
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "text-xl font-bold tracking-tight tabular-nums sm:text-2xl",
            valueColors[variant],
          )}
        >
          {value}
        </p>
        {sublabel && (
          <p className="text-[12px] leading-snug text-muted-foreground">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

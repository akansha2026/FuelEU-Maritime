import type { ReactNode } from "react";
import { cn } from "./cn";

interface FieldGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FieldGroup({ label, children, className }: FieldGroupProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Kinetic: borderless surface style — background defines the field, not a border
        "flex w-full min-w-0 rounded-lg bg-input px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted-foreground/60",
        "transition-colors duration-200",
        "focus:outline-none focus:bg-accent",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "aria-invalid:ring-2 aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
}

export { Input };

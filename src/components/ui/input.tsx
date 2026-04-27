import * as React from "react"

import { cn } from "@/lib/utils"
import { formPrimitiveFieldBaseClass } from "@/components/ui/form-styles"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        formPrimitiveFieldBaseClass,
        "h-9 md:text-sm",
        "file:text-foreground selection:bg-primary selection:text-primary-foreground",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }

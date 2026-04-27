import * as React from "react"

import { cn } from "@/lib/utils"
import { formPrimitiveFieldBaseClass } from "@/components/ui/form-styles"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        formPrimitiveFieldBaseClass,
        "flex field-sizing-content min-h-16 h-auto md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

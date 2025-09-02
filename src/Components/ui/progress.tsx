import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/utils/ui"

function Progress({
  className,
  value,
  offsetValue = 0,
  ...props
}: {offsetValue: number | undefined} & React.ComponentProps<typeof ProgressPrimitive.Root>) {
  offsetValue = offsetValue ? offsetValue < 100 ? offsetValue : 0 : 0
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full w-full flex-1 transition-all", 
          value && value >= 50
          ?   value >= 80
              ?   'bg-green-500'
              :   'bg-yellow-500'
          :   'bg-red-500',
        )}
        style={{ transform: `translateX(-${100 - (((value ?? 0) * (1 - offsetValue / 100)) + offsetValue) 
        }%)`}}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

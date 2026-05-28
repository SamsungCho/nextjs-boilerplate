import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center bg-clip-padding text-[17px] font-normal whitespace-nowrap transition-all outline-none select-none focus-visible:outline-2 focus-visible:outline-[var(--primary-focus)] focus-visible:outline-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 aria-invalid:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Primary - Apple Action Blue pill */
        default:
          "bg-primary text-primary-foreground rounded-full hover:bg-[#0071e3]",
        /* Secondary pill - ghost outline */
        outline:
          "border border-primary bg-transparent text-primary rounded-full hover:bg-primary/5",
        /* Pearl Button - capsule style */
        secondary:
          "bg-[#fafafc] text-[#333333] rounded-[11px] border-[3px] border-[rgba(0,0,0,0.04)] hover:bg-[#f0f0f0]",
        /* Dark utility button */
        ghost:
          "bg-[#1d1d1f] text-white rounded-[8px] hover:bg-[#333333]",
        /* Destructive */
        destructive:
          "bg-destructive/10 text-destructive rounded-full hover:bg-destructive/20",
        /* Text link style */
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-[44px] gap-2 px-[22px] py-[11px]",
        xs: "h-[32px] gap-1 px-[12px] py-[6px] text-[12px]",
        sm: "h-[36px] gap-1.5 px-[15px] py-[8px] text-[14px] tracking-[-0.224px]",
        lg: "h-[52px] gap-2 px-[28px] py-[14px] text-[18px] font-light",
        icon: "size-[44px] rounded-full",
        "icon-xs": "size-[32px] rounded-full",
        "icon-sm": "size-[36px] rounded-full",
        "icon-lg": "size-[52px] rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

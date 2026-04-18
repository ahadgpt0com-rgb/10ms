import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-[13px] font-semibold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nat-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-nat-accent text-white hover:bg-nat-accent-hover shadow-sm": variant === "default",
            "bg-red-500 text-white hover:bg-red-600 shadow-sm": variant === "destructive",
            "border border-nat-border bg-white hover:bg-nat-input hover:text-nat-text": variant === "outline",
            "bg-nat-input text-nat-text hover:bg-nat-sidebar": variant === "secondary",
            "hover:bg-nat-input hover:text-nat-text": variant === "ghost",
            "text-nat-accent underline-offset-4 hover:underline": variant === "link",
            "h-[36px] px-[20px] py-[8px]": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-lg px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

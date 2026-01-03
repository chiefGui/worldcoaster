import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@ui/lib/cn'

export const buttonVariants = tv({
  base: [
    'inline-flex items-center justify-center',
    'font-medium transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  variants: {
    variant: {
      primary: 'bg-accent text-white hover:bg-accent-hover',
      secondary: 'bg-bg-tertiary text-text-primary hover:bg-border',
      ghost: 'bg-transparent text-text-primary hover:bg-bg-tertiary',
      outline: 'border border-border bg-transparent text-text-primary hover:bg-bg-tertiary',
    },
    size: {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-sm rounded-lg',
      lg: 'h-12 px-6 text-base rounded-lg',
      icon: 'h-10 w-10 rounded-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    className?: string
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

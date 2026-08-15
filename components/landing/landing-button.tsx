import { cva } from 'class-variance-authority'

export const landingButtonVariants = cva(
  'font-display inline-flex cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--radius)+2px)] border font-semibold touch-manipulation tap-highlight-transparent transition duration-[180ms] ease-out select-none hover:-translate-y-0.5 hover:-rotate-[0.5deg] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        outline: 'border-border bg-transparent text-foreground hover:bg-muted',
      },
      size: {
        md: 'px-5.5 py-3 text-base',
        lg: 'px-[30px] py-3.5 text-[1.1rem]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

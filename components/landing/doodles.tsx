import { cn } from '@/lib/utils'

export function Tape({
  color = 'var(--primary)',
  className,
}: {
  color?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'absolute z-5 h-[26px] w-[118px] rounded-[2px] opacity-85 shadow-[0_1px_3px_rgba(0,0,0,0.35)] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.28)_0_8px,rgba(255,255,255,0.1)_8px_16px),var(--tape-color)]',
        className
      )}
      style={{ '--tape-color': color } as React.CSSProperties}
    />
  )
}

export function Sparkle({
  width = 24,
  height = 24,
  style,
}: {
  width?: number
  height?: number
  style?: React.CSSProperties
}) {
  return (
    <svg
      className="pointer-events-none absolute text-primary"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      style={style}
      aria-hidden="true"
    >
      <path d="M12 2c.6 4.8 2.4 7.4 10 10-7.6 2.6-9.4 5.2-10 10-.6-4.8-2.4-7.4-10-10 7.6-2.6 9.4-5.2 10-10z" />
    </svg>
  )
}

export function Squiggle({
  stroke = 'var(--secondary)',
  className,
}: {
  stroke?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 8 C 45 2, 70 12, 110 6 S 175 3, 197 7"
        stroke={stroke}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HandArrow({
  width = 54,
  height = 30,
  className = '',
  style,
}: {
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 24"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M4 12c10-5 20 5 30 1s16 3 22-1"
        stroke="currentColor"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M52 5l7 7-8 6"
        stroke="currentColor"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

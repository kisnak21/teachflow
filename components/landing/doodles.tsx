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
      className="sparkle"
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

export function Squiggle({ stroke = 'var(--secondary)' }: { stroke?: string }) {
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
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

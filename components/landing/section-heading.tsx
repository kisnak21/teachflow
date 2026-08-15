export function SectionHeading({
  label,
  color = 'text-primary',
}: {
  label: string
  color?: string
}) {
  return (
    <span
      className={`font-hand mb-4 inline-flex -rotate-1 items-center gap-2.5 text-[1.35rem] font-bold ${color}`}
    >
      {label}
      <span className="h-0.5 w-[42px] rounded-full bg-current opacity-50" />
    </span>
  )
}

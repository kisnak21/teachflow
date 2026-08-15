import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AuthCta({
  isAuthenticated,
  dashboardHref,
  label,
  size,
  className,
}: {
  isAuthenticated: boolean
  dashboardHref: string
  label: string
  size?: 'lg'
  className?: string
}) {
  return (
    <Link
      className={cn('btn btn-primary', size === 'lg' && 'btn-lg', className)}
      href={isAuthenticated ? dashboardHref : '/register'}
    >
      {isAuthenticated && <LayoutDashboard className="h-4 w-4" />}
      {isAuthenticated ? 'Buka Dashboard' : label}
    </Link>
  )
}

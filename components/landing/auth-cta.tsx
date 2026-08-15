import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { landingButtonVariants } from './landing-button'

export function AuthCta({
  isAuthenticated,
  dashboardHref,
  label,
  size = 'md',
  className,
}: {
  isAuthenticated: boolean
  dashboardHref: string
  label: string
  size?: 'md' | 'lg'
  className?: string
}) {
  return (
    <Link
      className={cn(landingButtonVariants({ size }), className)}
      href={isAuthenticated ? dashboardHref : '/register'}
    >
      {isAuthenticated && (
        <LayoutDashboard className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      )}
      {isAuthenticated ? 'Buka Dashboard' : label}
    </Link>
  )
}

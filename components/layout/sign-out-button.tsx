'use client'

import { LogOut } from 'lucide-react'
import { signOutAction } from '@/lib/actions/auth.actions'

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign out
      </button>
    </form>
  )
}

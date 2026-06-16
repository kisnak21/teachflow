"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/lib/actions/user.actions"

interface Props {
  initialName: string
  email: string
}

export function SettingsForm({ initialName, email }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      await updateProfile({ name })
      setSuccess(true)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSuccess(false)
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <div className="space-y-1">
              <p className="text-sm text-green-600">Profile updated</p>
              <p className="text-xs text-muted-foreground">
                Name change will reflect after your next login
              </p>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
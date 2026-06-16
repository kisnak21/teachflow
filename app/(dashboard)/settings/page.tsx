import { auth } from "@/auth"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const session = await auth()
  const user = session?.user

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information
        </p>
      </div>

      <SettingsForm
        initialName={user?.name ?? ""}
        email={user?.email ?? ""}
      />
    </div>
  )
}
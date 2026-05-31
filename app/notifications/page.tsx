"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { getNotifications, markAllNotificationsRead, markNotificationRead, type VitaCareNotification } from "@/lib/vitacare-store"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<VitaCareNotification[]>([])

  useEffect(() => {
    if (user) {
      setNotifications(getNotifications().filter((notification) => notification.userId === user.id))
    }
  }, [user])

  const refresh = () => {
    if (user) {
      setNotifications(getNotifications().filter((notification) => notification.userId === user.id))
    }
  }

  if (!isAuthenticated || !user) {
    if (typeof window !== "undefined") {
      router.push("/login")
    }
    return null
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Notifications</h1>
        <p className="mt-2 text-slate-600">Vous recevrez ici les reponses des intervenants et les informations importantes.</p>
        {notifications.length > 0 && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              markAllNotificationsRead(user.id)
              refresh()
            }}
          >
            Tout marquer comme lu
          </Button>
        )}

        <div className="mt-6 space-y-3">
          {notifications.length === 0 ? (
            <Card className="border-dashed bg-white">
              <CardContent className="p-10 text-center">
                <Bell className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <p className="text-slate-500">Aucune notification pour le moment.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-semibold">{notification.title}</p>
                    <span className={`rounded-full px-2 py-1 text-xs ${notification.read ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                      {notification.read ? "Lue" : "Non lue"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-3 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString("fr-FR")}</p>
                  {!notification.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        markNotificationRead(notification.id)
                        refresh()
                      }}
                    >
                      Marquer comme lue
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </AppShell>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { getActivityRegistrations, getAppointments, getNotifications, type ActivityRegistration, type VitaCareAppointment, type VitaCareNotification } from "@/lib/vitacare-store"
import { Activity, Bell, Calendar, History, ShoppingCart, type LucideIcon } from "lucide-react"

export default function DashboardPage() {
  const { user, isAuthenticated, cart } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<VitaCareAppointment[]>([])
  const [notifications, setNotifications] = useState<VitaCareNotification[]>([])
  const [activities, setActivities] = useState<ActivityRegistration[]>([])
  const stats: Array<[string, number, LucideIcon]> = [
    ["Reservations", appointments.length, Calendar],
    ["Panier", cart.length, ShoppingCart],
    ["Historique", appointments.filter((appointment) => appointment.status === "accepted" || appointment.status === "cancelled").length, History],
    ["Notifications", notifications.length, Bell],
    ["Activites reservees", activities.length, Activity],
  ]

  useEffect(() => {
    if (user?.role === "client") {
      setAppointments(getAppointments().filter((appointment) => appointment.patientId === user.id))
      setNotifications(getNotifications().filter((notification) => notification.userId === user.id))
      setActivities(getActivityRegistrations().filter((registration) => registration.userId === user.id && registration.status === "registered"))
    }
  }, [user])

  if (!isAuthenticated || !user) {
    if (typeof window !== "undefined") router.push("/login")
    return null
  }

  if (user.role === "admin") {
    if (typeof window !== "undefined") router.push("/admin")
    return null
  }

  if (user.role === "practitioner") {
    if (typeof window !== "undefined") router.push("/intervenant")
    return null
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-700">Interface patient</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Bonjour, {user.first_name}</h1>
          <p className="mt-2 text-slate-600">Votre espace sert a utiliser les services : catalogue, reservations, panier, historique et notifications.</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value, Icon]) => (
            <Card key={String(label)} className="border-slate-200 bg-white">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{String(value)}</p>
                  <p className="text-sm text-slate-500">{String(label)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Mes rendez-vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                  Aucun rendez-vous pour le moment.
                </p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                    <div>
                      <p className="font-semibold">{appointment.serviceName}</p>
                      <p className="text-sm text-slate-500">{appointment.practitionerName} · {appointment.date} · {appointment.time}</p>
                    </div>
                    <Badge variant="secondary">{appointment.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Mes activites reservees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">Aucune activite reservee.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-100 p-4">
                    <p className="font-semibold">{activity.activityName}</p>
                    <p className="text-sm text-slate-500">Inscrit le {new Date(activity.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button asChild className="w-full bg-emerald-700 hover:bg-emerald-800">
              <Link href="/services">Voir le catalogue</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/bookings">Reserver un creneau</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/cart">Voir mon panier</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/notifications">Voir mes notifications</Link>
            </Button>
          </div>
        </div>
      </main>
    </AppShell>
  )
}

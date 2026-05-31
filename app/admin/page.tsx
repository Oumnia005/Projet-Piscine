"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { practitionerAccounts } from "@/lib/practitioner-services"
import {
  getActivityRegistrations,
  getAppointments,
  getAuditEvents,
  getContactMessages,
  getNotifications,
  getSlots,
  getStoredUsers,
  updateStoredUserRole,
  type ActivityRegistration,
  type AuditEvent,
  type ContactMessage,
  type StoredAccount,
  type VitaCareAppointment,
  type VitaCareNotification,
  type VitaCareSlot,
} from "@/lib/vitacare-store"
import { Activity, Bell, Calendar, ShieldCheck, Users, type LucideIcon } from "lucide-react"

const sections = [
  { id: "dashboard", label: "Dashboard global" },
  { id: "users", label: "Utilisateurs" },
  { id: "contacts", label: "Messages contact" },
  { id: "stats", label: "Statistiques" },
  { id: "supervision", label: "Supervision plateforme" },
  { id: "moderation", label: "Moderation" },
]

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [slots, setSlots] = useState<VitaCareSlot[]>([])
  const [appointments, setAppointments] = useState<VitaCareAppointment[]>([])
  const [notifications, setNotifications] = useState<VitaCareNotification[]>([])
  const [users, setUsers] = useState<StoredAccount[]>([])
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [activityRegistrations, setActivityRegistrations] = useState<ActivityRegistration[]>([])
  const [audit, setAudit] = useState<AuditEvent[]>([])
  const stats: Array<[string, number, LucideIcon]> = [
    ["Creneaux crees", slots.length, Calendar],
    ["Demandes de reservation", appointments.length, Users],
    ["Prestations avec disponibilite", new Set(slots.map((slot) => slot.serviceId)).size, Activity],
    ["Messages contact", contacts.length, Bell],
  ]

  const refresh = () => {
    setSlots(getSlots())
    setAppointments(getAppointments())
    setNotifications(getNotifications())
    setUsers(Object.values(getStoredUsers()))
    setContacts(getContactMessages())
    setActivityRegistrations(getActivityRegistrations())
    setAudit(getAuditEvents())
  }

  useEffect(() => {
    refresh()
  }, [])

  if (!isAuthenticated || user?.role !== "admin") {
    if (typeof window !== "undefined") router.push("/login")
    return null
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-emerald-700">Interface administrateur</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Gestion et supervision</h1>
          <p className="mt-2 text-slate-600">Les chiffres viennent uniquement des actions faites sur le site.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              variant={activeSection === section.id ? "default" : "outline"}
              className={activeSection === section.id ? "bg-emerald-700 hover:bg-emerald-800" : "bg-white"}
            >
              {section.label}
            </Button>
          ))}
        </div>

        {activeSection === "dashboard" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        )}

        {activeSection === "users" && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="font-semibold">Comptes demo</p>
                <p className="text-sm text-slate-500">admin@vitacare.fr, client@vitacare.fr et comptes intervenants</p>
              </div>
              {practitionerAccounts.map((account) => (
                <div key={account.userId} className="rounded-lg border border-slate-100 p-4">
                  <p className="font-semibold">{account.name}</p>
                  <p className="text-sm text-slate-500">{account.email} · {account.specialty}</p>
                </div>
              ))}
              {users.map((account) => (
                <div key={account.user.email} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{account.user.first_name} {account.user.last_name}</p>
                      <p className="text-sm text-slate-500">{account.user.email} · {account.user.role}</p>
                      <p className="text-xs text-slate-400">Inscrit le {new Date(account.user.created_at).toLocaleString("fr-FR")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => { updateStoredUserRole(account.user.email, "client"); refresh() }}>Patient</Button>
                      <Button size="sm" variant="outline" onClick={() => { updateStoredUserRole(account.user.email, "practitioner"); refresh() }}>Intervenant</Button>
                      <Button size="sm" variant="outline" onClick={() => { updateStoredUserRole(account.user.email, "admin"); refresh() }}>Admin</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "contacts" && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Messages contact recus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">Aucun message contact recu.</p>
              ) : (
                contacts.map((message) => (
                  <div key={message.id} className="rounded-lg border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{message.subject}</p>
                      <Badge>{message.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{message.message}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Envoye par {message.name} · {message.email}
                      {message.userRole ? ` · role: ${message.userRole}` : ""}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === "stats" && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["En attente", appointments.filter((appointment) => appointment.status === "pending").length],
                ["Acceptes", appointments.filter((appointment) => appointment.status === "accepted").length],
                ["Refuses", appointments.filter((appointment) => appointment.status === "refused").length],
                ["Annules", appointments.filter((appointment) => appointment.status === "cancelled").length],
                ["Inscriptions activites", activityRegistrations.filter((item) => item.status === "registered").length],
                ["Notifications non lues", notifications.filter((item) => !item.read).length],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                  <span>{String(label)}</span>
                  <Badge>{String(value)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "supervision" && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Supervision plateforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">Aucune reservation a superviser.</p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{appointment.serviceName}</p>
                      <Badge variant="secondary">{appointment.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Patient : {appointment.patientName} · Intervenant : {appointment.practitionerName}</p>
                  </div>
                ))
              )}
              {activityRegistrations.map((registration) => (
                <div key={registration.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{registration.activityName}</p>
                    <Badge variant="secondary">{registration.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Participant : {registration.userName}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "moderation" && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Moderation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                Aucun signalement ni contenu a moderer pour le moment.
              </p>
              <div className="mt-4 space-y-2">
                {audit.slice(0, 8).map((event) => (
                  <div key={event.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                    <p className="font-medium">{event.label}</p>
                    <p className="text-xs text-slate-500">{event.userName || "Systeme"} · {new Date(event.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={refresh} variant="outline" className="mt-6">Actualiser</Button>
      </main>
    </AppShell>
  )
}

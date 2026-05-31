"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { getPractitionerByUserId, getServicesForPractitioner } from "@/lib/practitioner-services"
import {
  getAppointments,
  getSlots,
  saveSlot,
  updateAppointmentStatus,
  type VitaCareAppointment,
  type VitaCareSlot,
} from "@/lib/vitacare-store"
import { Calendar, CheckCircle2, Clock, ListChecks, Plus, XCircle } from "lucide-react"

const sections = [
  { id: "prestations", label: "Mes prestations" },
  { id: "disponibilites", label: "Disponibilites" },
  { id: "rdv", label: "Rendez-vous" },
  { id: "planning", label: "Planning" },
]

export default function IntervenantPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("prestations")
  const [slots, setSlots] = useState<VitaCareSlot[]>([])
  const [appointments, setAppointments] = useState<VitaCareAppointment[]>([])
  const services = useMemo(() => (user ? getServicesForPractitioner(user.id) : []), [user])
  const profile = user ? getPractitionerByUserId(user.id) : null
  const [form, setForm] = useState({
    serviceId: "",
    date: "",
    time: "",
    capacity: "1",
    location: "",
  })

  const refresh = () => {
    if (!user) return
    setSlots(getSlots().filter((slot) => slot.practitionerId === user.id))
    setAppointments(getAppointments().filter((appointment) => appointment.practitionerId === user.id))
  }

  useEffect(() => {
    refresh()
  }, [user])

  if (!isAuthenticated || user?.role !== "practitioner") {
    if (typeof window !== "undefined") router.push("/login")
    return null
  }

  const createAvailability = (event: React.FormEvent) => {
    event.preventDefault()
    const service = services.find((item) => item.id === Number(form.serviceId))
    if (!service) return

    saveSlot({
      serviceId: service.id,
      serviceName: service.name,
      practitionerId: user.id,
      practitionerName: profile?.name || `${user.first_name} ${user.last_name}`,
      date: form.date,
      time: form.time,
      capacity: Number(form.capacity),
      location: form.location,
    })

    setForm({ serviceId: "", date: "", time: "", capacity: "1", location: "" })
    refresh()
    setActiveSection("planning")
  }

  const changeStatus = (appointment: VitaCareAppointment, status: "accepted" | "refused") => {
    updateAppointmentStatus(appointment.id, status)
    refresh()
  }

  const acceptedAppointments = appointments.filter((appointment) => appointment.status === "accepted")

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-emerald-700">Interface intervenant</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Bonjour, {user.first_name}</h1>
          <p className="mt-2 text-slate-600">Vos prestations sont deja definies. Vous ajoutez seulement vos disponibilites.</p>
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

        {activeSection === "prestations" && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Mes prestations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <div key={service.id} className="rounded-lg border border-slate-100 p-4">
                  <h2 className="font-semibold">{service.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{service.short_description}</p>
                  <div className="mt-3 flex gap-2 text-sm text-slate-500">
                    <Badge variant="secondary">{service.duration} min</Badge>
                    <Badge variant="secondary">{service.price} €</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "disponibilites" && (
          <Card className="max-w-xl border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ajouter une disponibilite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createAvailability} className="space-y-4">
                <div className="space-y-2">
                  <Label>Prestation</Label>
                  <Select value={form.serviceId} onValueChange={(value) => setForm({ ...form, serviceId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une de mes prestations" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Heure</Label>
                    <Input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nombre de personnes</Label>
                  <Input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Lieu</Label>
                  <Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Ex: Salle Zen" required />
                </div>
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800">Enregistrer la disponibilite</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeSection === "rdv" && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Demandes de rendez-vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">Aucune demande pour le moment.</p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border border-slate-100 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{appointment.serviceName}</p>
                        <p className="text-sm text-slate-500">{appointment.patientName} · {appointment.date} · {appointment.time}</p>
                        <p className="text-sm text-slate-500">
                          Paiement : {appointment.paymentStatus === "paid" ? "debite" : appointment.paymentStatus === "released" ? "annule" : "en attente d'acceptation"}
                        </p>
                      </div>
                      <Badge variant="secondary">{appointment.status}</Badge>
                    </div>
                    {appointment.status === "pending" && (
                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => changeStatus(appointment, "accepted")} className="bg-emerald-700 hover:bg-emerald-800">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Accepter
                        </Button>
                        <Button onClick={() => changeStatus(appointment, "refused")} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          <XCircle className="mr-2 h-4 w-4" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === "planning" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Disponibilites publiees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {slots.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">Aucune disponibilite publiee.</p>
                ) : (
                  slots.map((slot) => (
                    <div key={slot.id} className="rounded-lg border border-slate-100 p-4">
                      <p className="font-semibold">{slot.serviceName}</p>
                      <p className="text-sm text-slate-500">{slot.date} · {slot.time} · {slot.capacity} place{slot.capacity > 1 ? "s" : ""} · {slot.location}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Planning confirme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {acceptedAppointments.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">Aucun rendez-vous accepte pour le moment.</p>
                ) : (
                  acceptedAppointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border border-slate-100 p-4">
                      <p className="font-semibold">{appointment.serviceName}</p>
                      <p className="text-sm text-slate-500">{appointment.patientName} · {appointment.date} · {appointment.time}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </AppShell>
  )
}

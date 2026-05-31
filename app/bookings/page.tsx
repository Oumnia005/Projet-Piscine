"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { mockServices } from "@/lib/mock-data"
import { getPractitionerForService } from "@/lib/practitioner-services"
import { getAppointments, getSlots, updateAppointment, updateAppointmentStatus, type VitaCareAppointment, type VitaCareSlot } from "@/lib/vitacare-store"
import { Calendar, Clock, ShoppingCart, UserRound } from "lucide-react"
import { toast } from "sonner"

function BookingsContent() {
  const { user, isAuthenticated, cart, addToCart } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = Number(searchParams.get("service") || 0)
  const selectedService = mockServices.find((service) => service.id === serviceId)
  const selectedPractitioner = selectedService ? getPractitionerForService(selectedService.id) : null
  const [slots, setSlots] = useState<VitaCareSlot[]>([])
  const [appointments, setAppointments] = useState<VitaCareAppointment[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState("")
  const [editTime, setEditTime] = useState("")

  const visibleSlots = useMemo(() => {
    if (!selectedService) return []
    return slots.filter((slot) => slot.serviceId === selectedService.id)
  }, [selectedService, slots])

  const refresh = () => {
    setSlots(getSlots())
    if (user) {
      setAppointments(getAppointments().filter((appointment) => appointment.patientId === user.id))
    }
  }

  useEffect(() => {
    refresh()
  }, [user])

  if (!isAuthenticated || !user || user.role !== "client") {
    if (typeof window !== "undefined") router.push("/login")
    return null
  }

  const addSlotToCart = (slot: VitaCareSlot) => {
    if (!selectedService) return
    addToCart({
      slot_id: slot.id,
      service_id: slot.serviceId,
      service_name: slot.serviceName,
      date: slot.date,
      time: slot.time,
      practitioner_id: slot.practitionerId,
      practitioner_name: slot.practitionerName,
      location: slot.location,
      price: selectedService.price,
      duration: selectedService.duration,
    })
    toast.success("Prestation ajoutee au panier.")
  }

  const cancelAppointment = (id: string) => {
    updateAppointmentStatus(id, "cancelled")
    refresh()
  }

  const submitEdit = (appointment: VitaCareAppointment, slot?: VitaCareSlot) => {
    if (slot) {
      updateAppointment(appointment.id, {
        slotId: slot.id,
        date: slot.date,
        time: slot.time,
        practitionerId: slot.practitionerId,
        practitionerName: slot.practitionerName,
      })
      toast.success("Modification envoyee a l'intervenant.")
      setEditingId(null)
      refresh()
      return
    }

    const proposedDate = new Date(`${editDate}T${editTime}`)
    if (Number.isNaN(proposedDate.getTime()) || proposedDate <= new Date()) {
      toast.error("Choisissez un creneau futur.")
      return
    }

    updateAppointment(appointment.id, {
      slotId: `proposal_${Date.now()}`,
      date: editDate,
      time: editTime,
    })
    toast.success("Votre proposition de creneau a ete envoyee.")
    setEditingId(null)
    setEditDate("")
    setEditTime("")
    refresh()
  }

  return (
    <AppShell>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Prendre un rendez-vous</h1>
          {!selectedService ? (
            <Card className="mt-6 border-dashed bg-white">
              <CardContent className="p-10 text-center">
                <p className="text-slate-600">Choisissez d'abord une prestation dans le catalogue.</p>
                <Button asChild className="mt-4 bg-emerald-700 hover:bg-emerald-800">
                  <Link href="/services">Voir les prestations</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mt-6 border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedService.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">{selectedService.short_description}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Intervenant : {selectedPractitioner?.name || "Non assigne"}
                      </p>
                    </div>
                    <Badge variant="secondary">{selectedService.duration} min</Badge>
                  </div>
                </CardContent>
              </Card>

              <h2 className="mt-8 text-xl font-semibold">Disponibilites proposees par l'intervenant</h2>
              <div className="mt-4 space-y-3">
                {visibleSlots.length === 0 ? (
                  <Card className="border-dashed bg-white">
                    <CardContent className="p-10 text-center text-slate-500">
                      Aucun creneau disponible pour cette prestation. L'intervenant doit d'abord ajouter ses disponibilites.
                    </CardContent>
                  </Card>
                ) : (
                  visibleSlots.map((slot) => {
                    const existing = appointments.some((appointment) => appointment.slotId === slot.id && appointment.status !== "cancelled")
                    const inCart = cart.some((item) => item.slot_id === slot.id)
                    const taken = getAppointments().filter(
                      (appointment) => appointment.slotId === slot.id && appointment.status !== "cancelled" && appointment.status !== "refused"
                    ).length
                    const full = taken >= slot.capacity
                    return (
                      <Card key={slot.id} className="border-slate-200 bg-white">
                        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{slot.serviceName}</h3>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{slot.date}</span>
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{slot.time}</span>
                              <span className="flex items-center gap-1"><UserRound className="h-4 w-4" />{slot.practitionerName}</span>
                              <span>{slot.capacity} place{slot.capacity > 1 ? "s" : ""}</span>
                              <span>{slot.location}</span>
                            </div>
                          </div>
                          <Button disabled={existing || full || inCart} onClick={() => addSlotToCart(slot)} className="bg-emerald-700 hover:bg-emerald-800">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {full ? "Complet" : existing ? "Demande envoyee" : inCart ? "Dans le panier" : "Ajouter au panier"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </>
          )}
        </section>

        <aside>
          <Card className="sticky top-24 border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Mes demandes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                  Vous n'avez encore aucune demande.
                </p>
              ) : (
                appointments.map((appointment) => {
                  const alternativeSlots = slots.filter((slot) => slot.serviceId === appointment.serviceId && slot.id !== appointment.slotId)

                  return (
                  <div key={appointment.id} className="rounded-lg border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{appointment.serviceName}</p>
                        <p className="text-sm text-slate-500">{appointment.practitionerName}</p>
                        <p className="text-sm text-slate-500">{appointment.date} · {appointment.time}</p>
                      </div>
                      <Badge variant="secondary">{appointment.status}</Badge>
                    </div>
                    {editingId === appointment.id ? (
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="mb-2 text-sm font-medium">Autres creneaux disponibles</p>
                          {alternativeSlots.length === 0 ? (
                            <p className="rounded-md border border-dashed p-3 text-sm text-slate-500">Aucun autre creneau publie pour ce service.</p>
                          ) : (
                            <div className="grid gap-2">
                              {alternativeSlots.map((slot) => {
                                const taken = getAppointments().filter(
                                  (item) => item.slotId === slot.id && item.status !== "cancelled" && item.status !== "refused"
                                ).length
                                const full = taken >= slot.capacity

                                return (
                                  <Button
                                    key={slot.id}
                                    variant="outline"
                                    className="h-auto justify-between gap-3 px-3 py-2 text-left"
                                    disabled={full}
                                    onClick={() => submitEdit(appointment, slot)}
                                  >
                                    <span>{slot.date} · {slot.time}</span>
                                    <span className="text-xs text-muted-foreground">{full ? "Complet" : slot.location}</span>
                                  </Button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="mb-2 text-sm font-medium">Proposer un autre creneau</p>
                          <div className="grid gap-2">
                            <input className="rounded-md border px-3 py-2 text-sm" type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} />
                            <input className="rounded-md border px-3 py-2 text-sm" type="time" value={editTime} onChange={(event) => setEditTime(event.target.value)} />
                            <Button onClick={() => submitEdit(appointment)} disabled={!editDate || !editTime}>Envoyer ma proposition</Button>
                          </div>
                        </div>
                        <Button variant="ghost" onClick={() => setEditingId(null)}>Annuler la modification</Button>
                      </div>
                    ) : appointment.status !== "cancelled" ? (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingId(appointment.id)
                            setEditDate(appointment.date)
                            setEditTime(appointment.time)
                          }}
                        >
                          Modifier
                        </Button>
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => cancelAppointment(appointment.id)}>
                          Annuler
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </AppShell>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <BookingsContent />
    </Suspense>
  )
}

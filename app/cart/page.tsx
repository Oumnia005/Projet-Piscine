"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { getAppointments, saveAppointment } from "@/lib/vitacare-store"
import { ArrowLeft, Calendar, CheckCircle, Clock, CreditCard, MapPin, ShieldCheck, ShoppingCart, Trash2, UserRound } from "lucide-react"
import { toast } from "sonner"

export default function CartPage() {
  const { user, isAuthenticated, cart, removeFromCart, clearCart } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"cart" | "payment" | "success">("cart")
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  })

  if (!isAuthenticated || !user || user.role !== "client") {
    if (typeof window !== "undefined") router.push("/login")
    return null
  }

  const total = cart.reduce((acc, item) => acc + item.price, 0)
  const formattedTotal = total.toFixed(2).replace(".", ",")

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault()
    if (cart.length === 0) return

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 600))

    const cardLast4 = paymentInfo.cardNumber.replace(/\D/g, "").slice(-4) || "0000"
    const existingAppointments = getAppointments()
    const alreadyRequestedSlots = new Set(
      existingAppointments
        .filter((appointment) => appointment.patientId === user.id && appointment.status !== "cancelled")
        .map((appointment) => appointment.slotId)
    )

    let blockedItems = 0

    cart.forEach((item) => {
      if (!item.slot_id || alreadyRequestedSlots.has(item.slot_id)) return

      try {
        saveAppointment({
          slotId: item.slot_id,
          serviceId: item.service_id,
          serviceName: item.service_name,
          patientId: user.id,
          patientName: `${user.first_name} ${user.last_name}`,
          practitionerId: item.practitioner_id || 0,
          practitionerName: item.practitioner_name || "Intervenant",
          date: item.date,
          time: item.time,
          price: item.price,
          paymentStatus: "preauthorized",
          paymentCardName: paymentInfo.cardName,
          paymentCardLast4: cardLast4,
        })
      } catch {
        blockedItems += 1
      }
    })

    clearCart()
    setIsProcessing(false)
    setPaymentStep("success")
    if (blockedItems > 0) {
      toast.error(`${blockedItems} creneau${blockedItems > 1 ? "x" : ""} expire${blockedItems > 1 ? "s" : ""} ignore${blockedItems > 1 ? "s" : ""}.`)
    } else {
      toast.success("Demandes envoyees aux intervenants.")
    }
  }

  if (paymentStep === "success") {
    return (
      <AppShell>
        <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
          <Card className="w-full border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="pt-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-700" />
              </div>
              <h1 className="text-2xl font-bold text-slate-950 dark:text-slate-50">Demandes envoyees</h1>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Votre carte fictive est seulement enregistree pour la demo. Le montant sera considere comme debite uniquement quand l'intervenant accepte le rendez-vous.
              </p>
              <div className="mt-6 grid gap-2">
                <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                  <Link href="/dashboard">Voir mes demandes</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/services">Retour au catalogue</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/services" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Continuer mes recherches
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
            {paymentStep === "cart" ? "Mon panier" : "Validation du panier"}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            La demande est envoyee a l'intervenant seulement apres validation de ce panier.
          </p>
        </div>

        {cart.length === 0 && paymentStep === "cart" ? (
          <Card className="border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="mx-auto mb-4 h-14 w-14 text-slate-300" />
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Votre panier est vide</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Choisissez une prestation puis un creneau disponible.</p>
              <Button asChild className="mt-6 bg-emerald-700 hover:bg-emerald-800">
                <Link href="/services">Voir les services</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <section>
              {paymentStep === "cart" ? (
                <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle>Prestations selectionnees</CardTitle>
                    <CardDescription>{cart.length} element{cart.length > 1 ? "s" : ""} en attente de validation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={`${item.slot_id || item.service_id}-${index}`} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="font-semibold text-slate-950 dark:text-slate-50">{item.service_name}</h2>
                              <Badge variant="secondary">Demande non envoyee</Badge>
                            </div>
                            <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {item.item_type === "program" ? "Programme complet" : item.date}
                              </span>
                              <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {item.item_type === "program" ? item.time : `${item.time} · ${item.duration} min`}
                              </span>
                              <span className="flex items-center gap-2"><UserRound className="h-4 w-4" />{item.practitioner_name || "Intervenant"}</span>
                              {item.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{item.location}</span>}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <span className="text-lg font-bold">{item.price.toFixed(2).replace(".", ",")} €</span>
                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(index)} aria-label="Retirer du panier">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Carte bancaire fictive
                    </CardTitle>
                    <CardDescription>
                      Entrez n'importe quelles informations pour la demo. Aucun vrai paiement n'est effectue.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCheckout} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nom sur la carte</Label>
                        <Input
                          id="cardName"
                          placeholder="Sarah Martin"
                          value={paymentInfo.cardName}
                          onChange={(event) => setPaymentInfo({ ...paymentInfo, cardName: event.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Numero de carte</Label>
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          value={paymentInfo.cardNumber}
                          onChange={(event) => setPaymentInfo({ ...paymentInfo, cardNumber: event.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiration</Label>
                          <Input
                            id="expiry"
                            placeholder="12/29"
                            value={paymentInfo.expiry}
                            onChange={(event) => setPaymentInfo({ ...paymentInfo, expiry: event.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            type="password"
                            value={paymentInfo.cvv}
                            onChange={(event) => setPaymentInfo({ ...paymentInfo, cvv: event.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={isProcessing} className="w-full bg-emerald-700 hover:bg-emerald-800" size="lg">
                        {isProcessing ? "Envoi des demandes..." : "Valider le panier et envoyer les demandes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </section>

            <aside>
              <Card className="sticky top-24 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle>Recapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={`${item.service_id}-${index}`} className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-600 dark:text-slate-300">{item.service_name}</span>
                      <span className="font-medium">{item.price.toFixed(2).replace(".", ",")} €</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Total potentiel</span>
                    <span className="font-bold">{formattedTotal} €</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                    <ShieldCheck className="mb-2 h-4 w-4" />
                    La carte est verifiee maintenant, mais le debit de demo passe seulement quand l'intervenant accepte.
                  </div>
                </CardContent>
                <CardFooter>
                  {paymentStep === "cart" ? (
                    <Button className="w-full bg-emerald-700 hover:bg-emerald-800" size="lg" onClick={() => setPaymentStep("payment")} disabled={cart.length === 0}>
                      Valider mon panier
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => setPaymentStep("cart")}>
                      Retour au panier
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </aside>
          </div>
        )}
      </main>
    </AppShell>
  )
}

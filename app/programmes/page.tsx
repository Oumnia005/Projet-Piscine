"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { mockPrograms } from "@/lib/mock-data"
import { getPractitionerForProgram } from "@/lib/practitioner-services"
import { Calendar, ShoppingCart, Users } from "lucide-react"
import { toast } from "sonner"

export default function ProgrammesPage() {
  const { user, isAuthenticated, cart, addToCart } = useAuth()
  const [selectedProgram, setSelectedProgram] = useState<(typeof mockPrograms)[number] | null>(null)

  const addProgramToCart = (program: (typeof mockPrograms)[number]) => {
    if (!isAuthenticated || !user || user.role !== "client") {
      toast.error("Connectez-vous avec un compte patient pour ajouter au panier.")
      return
    }

    const slotId = `program_${program.id}`
    if (cart.some((item) => item.slot_id === slotId)) {
      toast.info("Ce programme est deja dans votre panier.")
      return
    }

    const practitioner = getPractitionerForProgram(program.id)
    addToCart({
      slot_id: slotId,
      item_type: "program",
      service_id: 3000 + program.id,
      service_name: program.name,
      date: program.start_date || "Date a definir",
      time: `${program.sessions_count} seances`,
      practitioner_id: practitioner?.userId,
      practitioner_name: practitioner?.name,
      location: "VitaCare Centre",
      price: program.price,
      duration: program.duration_weeks * 7 * 24 * 60,
    })
    setSelectedProgram(null)
    toast.success("Programme ajoute au panier.")
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Programmes bien-etre</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Chaque programme a un intervenant responsable. Le patient l'ajoute au panier, puis l'intervenant accepte ou refuse la demande.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mockPrograms.map((program) => {
            const practitioner = getPractitionerForProgram(program.id)
            const inCart = cart.some((item) => item.slot_id === `program_${program.id}`)
            return (
              <Card key={program.id} className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="relative h-48">
                  <Image src={program.image || "/placeholder.svg"} alt={program.name} fill className="object-cover" />
                  <Badge className="absolute left-3 top-3">{program.duration_weeks} semaines</Badge>
                </div>
                <CardHeader>
                  <CardTitle>{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p className="line-clamp-3">{program.description}</p>
                  <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{program.sessions_count} seances</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4" />{practitioner?.name || "Intervenant a assigner"}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-3">
                  <span className="text-xl font-bold">{program.price} €</span>
                  <Button onClick={() => setSelectedProgram(program)} variant={inCart ? "outline" : "default"} className={inCart ? "" : "bg-emerald-700 hover:bg-emerald-800"}>
                    {inCart ? "Dans le panier" : "Voir le detail"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <Dialog open={!!selectedProgram} onOpenChange={(open) => !open && setSelectedProgram(null)}>
          {selectedProgram && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedProgram.name}</DialogTitle>
                <DialogDescription>Detail du programme avant ajout au panier.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative h-56 overflow-hidden rounded-lg">
                  <Image src={selectedProgram.image || "/placeholder.svg"} alt={selectedProgram.name} fill className="object-cover" />
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedProgram.description}</p>
                <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                  <p>Duree : {selectedProgram.duration_weeks} semaines</p>
                  <p>Seances : {selectedProgram.sessions_count}</p>
                  <p>Prix : {selectedProgram.price} €</p>
                  <p>Intervenant : {getPractitionerForProgram(selectedProgram.id)?.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProgram.benefits?.map((benefit) => (
                    <Badge key={benefit} variant="outline">{benefit}</Badge>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button asChild variant="outline">
                  <Link href="/cart">Voir le panier</Link>
                </Button>
                <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => addProgramToCart(selectedProgram)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ajouter au panier
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </main>
    </AppShell>
  )
}

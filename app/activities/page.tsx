"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { mockActivities, mockPrograms } from "@/lib/mock-data"
import { getPractitionerForActivity, getPractitionerForProgram } from "@/lib/practitioner-services"
import { Calendar, Clock, Dumbbell, MapPin, Search, ShoppingCart, Users } from "lucide-react"
import { toast } from "sonner"

type SelectedItem =
  | { type: "activity"; item: (typeof mockActivities)[number] }
  | { type: "program"; item: (typeof mockPrograms)[number] }
  | null

function isUpcomingActivity(activity: (typeof mockActivities)[number]) {
  if (!activity.date || !activity.start_time) return false
  return new Date(`${activity.date}T${activity.start_time.slice(0, 5)}`) > new Date()
}

export default function ActivitiesPage() {
  const { user, isAuthenticated, cart, addToCart } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("activities")
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return mockActivities.filter((activity) => {
      if (!activity.is_active || !isUpcomingActivity(activity) || (activity.places_remaining ?? 0) <= 0) return false
      if (!query) return true
      return [activity.name, activity.description, activity.location, activity.category_name]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [searchQuery])

  const filteredPrograms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return mockPrograms.filter((program) => {
      if (!program.is_active) return false
      if (!query) return true
      return [program.name, program.description, program.benefits?.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [searchQuery])

  const addActivityToCart = (activity: (typeof mockActivities)[number]) => {
    if (!isAuthenticated || !user || user.role !== "client") {
      toast.error("Connectez-vous avec un compte patient pour ajouter au panier.")
      return
    }

    if (!isUpcomingActivity(activity) || (activity.places_remaining ?? 0) <= 0) {
      toast.error("Cette activite n'est plus disponible.")
      return
    }

    const practitioner = getPractitionerForActivity(activity.id)
    const slotId = `activity_${activity.id}`
    if (cart.some((item) => item.slot_id === slotId)) {
      toast.info("Cette activite est deja dans votre panier.")
      return
    }

    addToCart({
      slot_id: slotId,
      item_type: "activity",
      service_id: 2000 + activity.id,
      service_name: activity.name,
      date: activity.date,
      time: activity.start_time?.slice(0, 5) || activity.schedule || "A definir",
      practitioner_id: practitioner?.userId,
      practitioner_name: practitioner?.name,
      location: activity.location,
      price: activity.price,
      duration: activity.duration || 60,
    })
    setSelectedItem(null)
    toast.success("Activite ajoutee au panier.")
  }

  const addProgramToCart = (program: (typeof mockPrograms)[number]) => {
    if (!isAuthenticated || !user || user.role !== "client") {
      toast.error("Connectez-vous avec un compte patient pour ajouter au panier.")
      return
    }

    const practitioner = getPractitionerForProgram(program.id)
    const slotId = `program_${program.id}`
    if (cart.some((item) => item.slot_id === slotId)) {
      toast.info("Ce programme est deja dans votre panier.")
      return
    }

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
    setSelectedItem(null)
    toast.success("Programme ajoute au panier.")
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Activites et programmes</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Consultez le detail, ajoutez au panier, puis l'intervenant accepte ou refuse apres validation.
          </p>
        </div>

        <div className="mb-6 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher une activite ou un programme..."
              className="h-12 rounded-lg bg-white pl-11 dark:bg-slate-900"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="activities" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              Activites
            </TabsTrigger>
            <TabsTrigger value="programs" className="gap-2">
              <Calendar className="h-4 w-4" />
              Programmes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredActivities.map((activity) => {
                const practitioner = getPractitionerForActivity(activity.id)
                const inCart = cart.some((item) => item.slot_id === `activity_${activity.id}`)
                return (
                  <Card key={activity.id} className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative h-44">
                      <Image src={activity.image || "/placeholder.svg"} alt={activity.name} fill className="object-cover" />
                      <Badge className="absolute left-3 top-3">{activity.level}</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{activity.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <p className="line-clamp-2">{activity.description}</p>
                      <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{activity.schedule}</p>
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{activity.duration} min</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{activity.location}</p>
                      <p className="flex items-center gap-2"><Users className="h-4 w-4" />Intervenant : {practitioner?.name || "A assigner"}</p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between gap-3">
                      <span className="text-xl font-bold">{activity.price} €</span>
                      <Button onClick={() => setSelectedItem({ type: "activity", item: activity })} variant={inCart ? "outline" : "default"} className={inCart ? "" : "bg-emerald-700 hover:bg-emerald-800"}>
                        {inCart ? "Dans le panier" : "Voir le detail"}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="programs">
            <div className="grid gap-5 lg:grid-cols-3">
              {filteredPrograms.map((program) => {
                const practitioner = getPractitionerForProgram(program.id)
                const inCart = cart.some((item) => item.slot_id === `program_${program.id}`)
                return (
                  <Card key={program.id} className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative h-44">
                      <Image src={program.image || "/placeholder.svg"} alt={program.name} fill className="object-cover" />
                      <Badge className="absolute left-3 top-3">{program.duration_weeks} semaines</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <p className="line-clamp-3">{program.description}</p>
                      <p>{program.sessions_count} seances accompagnees</p>
                      <p>Intervenant : {practitioner?.name || "A assigner"}</p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between gap-3">
                      <span className="text-xl font-bold">{program.price} €</span>
                      <Button onClick={() => setSelectedItem({ type: "program", item: program })} variant={inCart ? "outline" : "default"} className={inCart ? "" : "bg-emerald-700 hover:bg-emerald-800"}>
                        {inCart ? "Dans le panier" : "Voir le detail"}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          {selectedItem && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedItem.item.name}</DialogTitle>
                <DialogDescription>
                  {selectedItem.type === "activity" ? "Detail de l'activite avant ajout au panier." : "Detail du programme avant ajout au panier."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative h-56 overflow-hidden rounded-lg">
                  <Image src={selectedItem.item.image || "/placeholder.svg"} alt={selectedItem.item.name} fill className="object-cover" />
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedItem.item.description}</p>
                {selectedItem.type === "activity" ? (
                  <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                    <p>Horaire : {selectedItem.item.schedule}</p>
                    <p>Duree : {selectedItem.item.duration} min</p>
                    <p>Lieu : {selectedItem.item.location}</p>
                    <p>Intervenant : {getPractitionerForActivity(selectedItem.item.id)?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <p>Duree : {selectedItem.item.duration_weeks} semaines</p>
                    <p>Seances : {selectedItem.item.sessions_count}</p>
                    <p>Intervenant : {getPractitionerForProgram(selectedItem.item.id)?.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.item.benefits?.map((benefit) => (
                        <Badge key={benefit} variant="outline">{benefit}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button asChild variant="outline">
                  <Link href="/cart">Voir le panier</Link>
                </Button>
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800"
                  onClick={() => selectedItem.type === "activity" ? addActivityToCart(selectedItem.item) : addProgramToCart(selectedItem.item)}
                >
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

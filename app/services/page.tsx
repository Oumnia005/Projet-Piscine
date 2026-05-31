"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/lib/auth-context"
import { mockCategories, mockPrograms, mockServices } from "@/lib/mock-data"
import { getFavoriteServices, toggleFavoriteService } from "@/lib/vitacare-store"
import { Apple, Brain, Clock, Heart, Leaf, Search, ShieldCheck, Star, Stethoscope } from "lucide-react"
import { toast } from "sonner"

const icons = [Search, Stethoscope, ShieldCheck, Leaf, Apple, Brain]

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesContent />
    </Suspense>
  )
}

function ServicesContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [duration, setDuration] = useState([120])
  const [sortBy, setSortBy] = useState("popularite")
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  useEffect(() => {
    if (!user) {
      setFavoriteIds([])
      return
    }
    setFavoriteIds(getFavoriteServices().filter((favorite) => favorite.userId === user.id).map((favorite) => favorite.serviceId))
  }, [user])

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return mockServices
      .filter((service) => {
        if (!normalizedSearch) return true
        const category = mockCategories.find((item) => item.id === service.category_id)?.name || ""
        return [service.name, service.short_description, service.description, category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      })
      .filter((service) => selectedCategory === "all" || service.category_id === Number(selectedCategory))
      .filter((service) => service.duration <= duration[0])
      .sort((a, b) => (sortBy === "prix" ? a.price - b.price : Number(b.is_featured) - Number(a.is_featured)))
  }, [duration, searchQuery, selectedCategory, sortBy])

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setDuration([120])
    setSortBy("popularite")
  }

  const handleFavorite = (serviceId: number) => {
    if (!user || user.role !== "client") {
      toast.error("Connectez-vous avec un compte patient pour ajouter un favori.")
      return
    }

    const added = toggleFavoriteService(user.id, serviceId)
    setFavoriteIds(getFavoriteServices().filter((favorite) => favorite.userId === user.id).map((favorite) => favorite.serviceId))
    toast.success(added ? "Service ajoute aux favoris." : "Service retire des favoris.")
  }

  return (
    <AppShell>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Catalogue des services</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Trouvez les services et activites qui repondent a vos besoins</p>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 bg-white dark:bg-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularite">Popularite</SelectItem>
                <SelectItem value="prix">Prix croissant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-12 rounded-lg border-slate-200 bg-white pl-11 dark:border-slate-700 dark:bg-slate-900"
                placeholder="Rechercher des services, une categorie, une prestation..."
              />
            </div>
          </div>

          <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
            <Button
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-emerald-700 hover:bg-emerald-800" : ""}
              variant={selectedCategory === "all" ? "default" : "outline"}
            >
              Toutes
            </Button>
            {mockCategories.map((category, index) => {
              const Icon = icons[index + 1] || Leaf
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(String(category.id))}
                  variant={selectedCategory === String(category.id) ? "default" : "outline"}
                  className={selectedCategory === String(category.id) ? "bg-emerald-700 hover:bg-emerald-800" : "bg-white dark:bg-slate-900"}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {category.name}
                </Button>
              )
            })}
          </div>

          <p className="mb-5 text-sm font-medium text-slate-600 dark:text-slate-300">{filteredServices.length} services disponibles</p>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service, index) => (
              <Card key={service.id} className="overflow-hidden border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="relative h-40">
                  <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
                  {service.is_featured && (
                    <Badge className="absolute left-3 top-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Populaire</Badge>
                  )}
                  {index === 1 && (
                    <Badge className="absolute left-3 top-3 bg-orange-100 text-orange-800 hover:bg-orange-100">Nouveau</Badge>
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/90"
                    onClick={() => handleFavorite(service.id)}
                    aria-label={favoriteIds.includes(service.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart className={`h-4 w-4 ${favoriteIds.includes(service.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h2 className="font-semibold text-slate-950 dark:text-slate-50">{service.name}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{service.short_description}</p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {service.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      4.{index % 3 === 0 ? "9" : "8"} ({84 + index * 7})
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold">{service.price.toFixed(2).replace(".", ",")} €</span>
                  </div>
                  <Button asChild variant="outline" className="mt-4 w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50">
                    <Link href={`/bookings?service=${service.id}`}>Voir les disponibilites</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredServices.length === 0 && (
            <Card className="border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-8 text-center">
                <p className="font-semibold text-slate-950 dark:text-slate-50">Aucun service trouve</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Essayez une autre recherche ou reinitialisez les filtres.</p>
                <Button onClick={resetFilters} className="mt-5 bg-emerald-700 hover:bg-emerald-800">
                  Reinitialiser
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="space-y-5">
          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Filtres</h2>
                <button onClick={resetFilters} className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Reinitialiser
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Type de service</p>
                  <div className="space-y-2">
                    {mockCategories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Checkbox
                          checked={selectedCategory === String(category.id)}
                          onCheckedChange={() => setSelectedCategory(selectedCategory === String(category.id) ? "all" : String(category.id))}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium">Duree</p>
                  <Slider value={duration} onValueChange={setDuration} min={15} max={120} step={15} />
                  <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>15 min</span>
                    <span>{duration[0]} min et +</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Recommande pour vous</h2>
                <Link href="/activities" className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-3">
                {mockPrograms.slice(0, 3).map((program) => (
                  <div key={program.id} className="flex gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                      <Image src={program.image || "/placeholder.svg"} alt={program.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{program.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{program.duration_weeks} semaines</p>
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-xs text-amber-600">
                      <Star className="h-3 w-3 fill-amber-400" /> 4.8
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </AppShell>
  )
}

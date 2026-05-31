"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { mockServices } from "@/lib/mock-data"
import { getFavoriteServices, toggleFavoriteService } from "@/lib/vitacare-store"
import { Clock, Heart } from "lucide-react"
import { toast } from "sonner"

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  useEffect(() => {
    if (!user) {
      setFavoriteIds([])
      return
    }
    setFavoriteIds(getFavoriteServices().filter((favorite) => favorite.userId === user.id).map((favorite) => favorite.serviceId))
  }, [user])

  const favoriteServices = useMemo(
    () => mockServices.filter((service) => favoriteIds.includes(service.id)),
    [favoriteIds]
  )

  const removeFavorite = (serviceId: number) => {
    if (!user) return
    toggleFavoriteService(user.id, serviceId)
    setFavoriteIds(getFavoriteServices().filter((favorite) => favorite.userId === user.id).map((favorite) => favorite.serviceId))
    toast.success("Service retire des favoris.")
  }

  if (!isAuthenticated || user?.role !== "client") {
    return (
      <AppShell>
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-slate-950 dark:text-slate-50">Favoris patient</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Connectez-vous avec un compte patient pour retrouver vos services aimes.</p>
              <Button asChild className="mt-6 bg-emerald-700 hover:bg-emerald-800">
                <Link href="/login">Se connecter</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Services aimes</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Retrouvez les prestations que vous avez ajoutees avec le coeur du catalogue.</p>
        </div>

        {favoriteServices.length === 0 ? (
          <Card className="border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-8 text-center">
              <Heart className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 font-semibold text-slate-950 dark:text-slate-50">Aucun service aime pour le moment</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Allez dans le catalogue et cliquez sur le coeur d'une prestation.</p>
              <Button asChild className="mt-5 bg-emerald-700 hover:bg-emerald-800">
                <Link href="/services">Voir le catalogue</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteServices.map((service) => (
              <Card key={service.id} className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="relative h-44">
                  <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/90"
                    onClick={() => removeFavorite(service.id)}
                    aria-label="Retirer des favoris"
                  >
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h2 className="font-semibold text-slate-950 dark:text-slate-50">{service.name}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{service.short_description}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    {service.duration} min
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold">{service.price.toFixed(2).replace(".", ",")} €</span>
                  </div>
                  <Button asChild className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800">
                    <Link href={`/bookings?service=${service.id}`}>Prendre rendez-vous</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  )
}

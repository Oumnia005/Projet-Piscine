"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { getNotifications } from "@/lib/vitacare-store"
import {
  Activity,
  Bell,
  Calendar,
  Heart,
  HelpCircle,
  Home,
  Inbox,
  Leaf,
  LayoutDashboard,
  Search,
  Settings,
  ShoppingCart,
  Users,
  User,
} from "lucide-react"

const patientNavItems = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Services", href: "/services", icon: Leaf },
  { label: "Rendez-vous", href: "/bookings", icon: Calendar },
  { label: "Activites & programmes", href: "/activities", icon: Activity },
  { label: "Suivi & historique", href: "/dashboard", icon: Inbox },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Mon dossier", href: "/profile", icon: User },
  { label: "Favoris", href: "/favorites", icon: Heart },
]

const practitionerNavItems = [
  { label: "Vue d'ensemble", href: "/intervenant", icon: LayoutDashboard },
  { label: "Mes services", href: "/intervenant#services", icon: Leaf },
  { label: "Planning", href: "/intervenant#planning", icon: Calendar },
  { label: "Disponibilites", href: "/intervenant#disponibilites", icon: Settings },
  { label: "Rendez-vous", href: "/intervenant#rendez-vous", icon: Inbox },
  { label: "Activites", href: "/intervenant#activites", icon: Activity },
]

const adminNavItems = [
  { label: "Dashboard global", href: "/admin", icon: LayoutDashboard },
  { label: "Utilisateurs", href: "/admin", icon: Users },
  { label: "Statistiques", href: "/admin", icon: Activity },
  { label: "Supervision", href: "/admin", icon: Inbox },
  { label: "Moderation", href: "/admin", icon: ShieldIcon },
]

function ShieldIcon(props: any) {
  return <Settings {...props} />
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, cart } = useAuth()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const navItems = user?.role === "practitioner" ? practitionerNavItems : user?.role === "admin" ? adminNavItems : patientNavItems

  useEffect(() => {
    const refreshNotifications = () => {
      if (!user) {
        setUnreadNotifications(0)
        return
      }

      setUnreadNotifications(
        getNotifications().filter((notification) => notification.userId === user.id && !notification.read).length
      )
    }

    refreshNotifications()
    window.addEventListener("storage", refreshNotifications)
    const interval = window.setInterval(refreshNotifications, 1000)

    return () => {
      window.removeEventListener("storage", refreshNotifications)
      window.clearInterval(interval)
    }
  }, [user])

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-emerald-100 bg-white px-5 py-6 lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-800">VitaCare</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Votre sante, notre priorite</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-slate-800">
          <HelpCircle className="mb-3 h-5 w-5 text-emerald-700" />
          <p className="font-semibold text-slate-900 dark:text-slate-50">Besoin d'aide ?</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Notre equipe est la pour vous aider.</p>
          <Button asChild className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800">
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <Heart className="h-7 w-7 text-emerald-700" />
              <span className="font-bold text-emerald-800">VitaCare</span>
            </Link>
            <form
              className="relative hidden flex-1 md:block"
              onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.currentTarget)
                const query = String(formData.get("search") || "").trim()
                router.push(query ? `/services?search=${encodeURIComponent(query)}` : "/services")
              }}
            >
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="search"
                className="h-11 rounded-lg border-slate-200 bg-white pl-11 dark:border-slate-700 dark:bg-slate-950"
                placeholder="Rechercher un service, un professionnel, une activite..."
              />
            </form>
            <Button asChild variant="outline" size="icon" className="relative ml-auto border-slate-200 dark:border-slate-700">
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-900" />
                )}
              </Link>
            </Button>
            {user?.role === "client" && (
              <Button asChild variant="outline" size="icon" className="relative border-slate-200 dark:border-slate-700">
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-xs font-bold text-white">
                      {cart.length}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href={user?.role === "admin" ? "/admin" : user?.role === "practitioner" ? "/intervenant" : "/dashboard"} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-emerald-700 text-white">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-sm sm:block">
                  <p className="font-semibold">Bonjour, {user?.first_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.role === "admin" ? "Espace admin" : user?.role === "practitioner" ? "Espace intervenant" : "Voir mon profil"}
                  </p>
                </div>
              </Link>
            ) : (
              <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                <Link href="/login">Connexion</Link>
              </Button>
            )}
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}

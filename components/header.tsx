'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { getNotifications } from '@/lib/vitacare-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, User, LogOut, Calendar, ShoppingCart, Bell, LayoutDashboard, Leaf } from 'lucide-react'

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Rendez-vous', href: '/bookings' },
  { name: 'Activites', href: '/activities' },
  { name: 'Programmes', href: '/programmes' },
  { name: 'Contact', href: '/contact' },
]

export function Header() {
  const { user, isAuthenticated, logout, cart } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

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
    window.addEventListener('storage', refreshNotifications)
    const interval = window.setInterval(refreshNotifications, 1000)

    return () => {
      window.removeEventListener('storage', refreshNotifications)
      window.clearInterval(interval)
    }
  }, [user])

  const cartCount = cart.length

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">VitaCare</span>
        </Link>

        
        <div className="hidden md:flex md:items-center md:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              
              <Button variant="ghost" size="icon" asChild className="relative hidden sm:flex">
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                  <span className="sr-only">Panier</span>
                </Link>
              </Button>

              
              <Button variant="ghost" size="icon" asChild className="relative hidden sm:flex">
                <Link href="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
                  )}
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>

              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {user?.first_name?.charAt(0) || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Tableau de bord
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/bookings" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Mes reservations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Deconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Inscription</Link>
              </Button>
            </div>
          )}

          <ThemeToggle />

          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <Leaf className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-serif text-xl font-semibold">VitaCare</span>
                </Link>

                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {isAuthenticated ? (
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-foreground"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Tableau de bord
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-foreground"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Panier {cartCount > 0 && <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{cartCount}</span>}
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-foreground"
                    >
                      <Bell className="h-5 w-5" />
                      Notifications {unreadNotifications > 0 && <span className="ml-auto h-2.5 w-2.5 rounded-full bg-destructive" />}
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-2 py-2 text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      Deconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">Mode sombre</span>
                      <ThemeToggle />
                    </div>
                    <Button asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Connexion
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        Inscription
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

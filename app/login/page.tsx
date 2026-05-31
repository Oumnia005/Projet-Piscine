'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Eye, EyeOff, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { toast } from 'sonner'

type LoginRole = 'client' | 'practitioner' | 'admin'

const roleOptions = [
  {
    value: 'client',
    label: 'Patient',
    description: 'Je veux utiliser les services',
    icon: UserRound,
  },
  {
    value: 'practitioner',
    label: 'Intervenant',
    description: 'Je propose et organise des services',
    icon: Stethoscope,
  },
  {
    value: 'admin',
    label: 'Administrateur',
    description: 'Je gere et supervise la plateforme',
    icon: ShieldCheck,
  },
] as const

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<LoginRole>('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password, selectedRole)
      toast.success('Connexion reussie!')
      router.push(selectedRole === 'admin' ? '/admin' : selectedRole === 'practitioner' ? '/intervenant' : '/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-serif text-2xl font-semibold">VitaCare</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Connexion</CardTitle>
            <CardDescription>
              Selectionnez votre espace puis connectez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 grid gap-2">
              {roleOptions.map((role) => {
                const Icon = role.icon
                const active = selectedRole === role.value
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.value)
                    }}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                      active ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Mot de passe oublie?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Comptes de demo</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium">Patient</p>
                  <p className="text-muted-foreground">client@vitacare.fr / password</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium">Intervenant</p>
                  <p className="text-muted-foreground">intervenant@vitacare.fr / password</p>
                  <p className="text-muted-foreground">nutrition@vitacare.fr / password</p>
                  <p className="text-muted-foreground">coach@vitacare.fr / password</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium">Administrateur</p>
                  <p className="text-muted-foreground">admin@vitacare.fr / password</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Pas encore de compte?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Inscrivez-vous
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

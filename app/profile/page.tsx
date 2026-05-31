"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { User, Mail, Phone, Lock, Camera, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, updatePassword } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.push("/login")
    }
    return null
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile(profileData)
      toast.success("Profil mis a jour avec succes")
    } catch {
      toast.error("Erreur lors de la mise a jour")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (passwordData.new.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      await updatePassword(passwordData.current, passwordData.new)
      toast.success("Mot de passe modifie avec succes")
      setPasswordData({ current: "", new: "", confirm: "" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du changement de mot de passe")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-serif text-3xl font-bold mb-8">Mon Profil</h1>

          <div className="grid md:grid-cols-3 gap-8">
            
            <Card className="md:col-span-1 h-fit">
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="font-semibold text-xl mt-4">{user?.first_name} {user?.last_name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Membre depuis</p>
                  <p className="font-medium">Janvier 2024</p>
                </div>
              </CardContent>
            </Card>

            
            <div className="md:col-span-2">
              <Tabs defaultValue="profile">
                <TabsList className="mb-6">
                  <TabsTrigger value="profile">Informations</TabsTrigger>
                  <TabsTrigger value="security">Securite</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informations personnelles
                      </CardTitle>
                      <CardDescription>
                        Mettez a jour vos informations de contact
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first_name">Prenom</Label>
                            <Input 
                              id="first_name"
                              value={profileData.first_name}
                              onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last_name">Nom</Label>
                            <Input 
                              id="last_name"
                              value={profileData.last_name}
                              onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            <Mail className="h-4 w-4 inline mr-2" />
                            Email
                          </Label>
                          <Input 
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            <Phone className="h-4 w-4 inline mr-2" />
                            Telephone
                          </Label>
                          <Input 
                            id="phone"
                            type="tel"
                            placeholder="06 12 34 56 78"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Changer le mot de passe
                      </CardTitle>
                      <CardDescription>
                        Assurez-vous d&apos;utiliser un mot de passe fort
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current">Mot de passe actuel</Label>
                          <Input 
                            id="current"
                            type="password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new">Nouveau mot de passe</Label>
                          <Input 
                            id="new"
                            type="password"
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                          <Input 
                            id="confirm"
                            type="password"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Mise a jour..." : "Mettre a jour le mot de passe"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                
                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences de notification</CardTitle>
                      <CardDescription>
                        Gerez comment vous souhaitez etre contacte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Rappels de rendez-vous</p>
                          <p className="text-sm text-muted-foreground">
                            Recevoir un rappel 24h avant chaque rendez-vous
                          </p>
                        </div>
                        <Input type="checkbox" className="h-5 w-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Offres speciales</p>
                          <p className="text-sm text-muted-foreground">
                            Recevoir nos promotions et offres exclusives
                          </p>
                        </div>
                        <Input type="checkbox" className="h-5 w-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Newsletter</p>
                          <p className="text-sm text-muted-foreground">
                            Recevoir notre newsletter mensuelle
                          </p>
                        </div>
                        <Input type="checkbox" className="h-5 w-5" />
                      </div>
                      <Button>Enregistrer les preferences</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

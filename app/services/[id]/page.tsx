"use client"

import { useState, use } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockServices, mockCategories, mockPractitioners } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { Clock, Euro, Star, ArrowLeft, User, Calendar as CalendarIcon, CheckCircle, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
]

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const service = mockServices.find(s => s.id === parseInt(resolvedParams.id))
  const category = mockCategories.find(c => c.id === service?.category_id)
  const { user, addToCart } = useAuth()
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>("")
  const [isBooking, setIsBooking] = useState(false)

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Service non trouve</h1>
            <Link href="/services">
              <Button>Retour aux services</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const availablePractitioners = mockPractitioners.filter(p => 
    p.services.includes(service.id) && p.is_active
  )

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour reserver")
      router.push("/login")
      return
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Veuillez selectionner une date et un horaire")
      return
    }

    setIsBooking(true)

    
    const cartItem = {
      service_id: service.id,
      service_name: service.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      practitioner_id: selectedPractitioner ? parseInt(selectedPractitioner) : undefined,
      price: service.price,
      duration: service.duration
    }

    addToCart(cartItem)
    
    setTimeout(() => {
      setIsBooking(false)
      toast.success("Service ajoute au panier!", {
        action: {
          label: "Voir le panier",
          onClick: () => router.push("/cart")
        }
      })
    }, 500)
  }

  const handleBookNow = () => {
    handleAddToCart()
    setTimeout(() => {
      router.push("/cart")
    }, 600)
  }

  const disabledDays = (date: Date) => {
    return isBefore(date, startOfDay(new Date())) || date.getDay() === 0
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          
          <Link href="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            
            <div className="space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  fill
                  className="object-cover"
                  priority
                />
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  {category?.name}
                </Badge>
              </div>

              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {service.name}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">{service.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  <span className="font-medium">{service.price}€</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-medium">4.8 (124 avis)</span>
                </div>
              </div>

              
              <Card>
                <CardHeader>
                  <CardTitle>Bienfaits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>Relaxation profonde du corps et de l&apos;esprit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>Reduction du stress et de l&apos;anxiete</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>Amelioration de la circulation sanguine</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>Soulagement des tensions musculaires</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              
              {availablePractitioners.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nos praticiens pour ce soin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {availablePractitioners.map((practitioner) => (
                        <div key={practitioner.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                            <Image
                              src={practitioner.avatar || "/placeholder.svg"}
                              alt={practitioner.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{practitioner.name}</p>
                            <p className="text-sm text-muted-foreground">{practitioner.specialty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Reserver ce soin
                  </CardTitle>
                  <CardDescription>
                    Selectionnez une date et un horaire disponible
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date</label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={disabledDays}
                      locale={fr}
                      className="rounded-md border"
                      fromDate={new Date()}
                      toDate={addDays(new Date(), 60)}
                    />
                  </div>

                  
                  {selectedDate && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Horaire</label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className="text-sm"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  
                  {availablePractitioners.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Praticien (optionnel)</label>
                      <Select value={selectedPractitioner} onValueChange={setSelectedPractitioner}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pas de preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Pas de preference</SelectItem>
                          {availablePractitioners.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  
                  {selectedDate && selectedTime && (
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <h4 className="font-medium">Recapitulatif</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Service:</span> {service.name}</p>
                        <p><span className="text-muted-foreground">Date:</span> {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
                        <p><span className="text-muted-foreground">Horaire:</span> {selectedTime}</p>
                        <p><span className="text-muted-foreground">Duree:</span> {service.duration} min</p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-lg font-bold text-primary">Total: {service.price}€</p>
                      </div>
                    </div>
                  )}

                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBookNow}
                      disabled={!selectedDate || !selectedTime || isBooking}
                    >
                      {isBooking ? "Ajout en cours..." : "Reserver maintenant"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={!selectedDate || !selectedTime || isBooking}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ajouter au panier
                    </Button>
                  </div>

                  {!user && (
                    <p className="text-sm text-center text-muted-foreground">
                      <Link href="/login" className="text-primary hover:underline">Connectez-vous</Link> pour reserver
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

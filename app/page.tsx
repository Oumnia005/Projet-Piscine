import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { mockServices, mockCategories, mockActivities } from '@/lib/mock-data'
import { 
  ArrowRight, 
  Clock, 
  Star, 
  Users, 
  Calendar, 
  Sparkles,
  Heart,
  Shield,
  Award
} from 'lucide-react'

export default function HomePage() {
  const featuredServices = mockServices.filter(s => s.is_featured).slice(0, 4)
  const upcomingActivities = mockActivities
    .filter((activity) => {
      if (!activity.is_active || !activity.date || !activity.start_time) return false
      return new Date(`${activity.date}T${activity.start_time.slice(0, 5)}`) > new Date()
    })
    .slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>Plateforme de sante et bien-etre</span>
                </div>
                <h1 className="font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  <span className="text-balance">Votre sante, notre priorite</span>
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                  Recherchez un service, consultez les disponibilites, prenez rendez-vous et suivez vos
                  activites de sante dans un espace personnel simple.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link href="/services">
                      Voir le catalogue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/bookings">Prendre rendez-vous</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 border-background bg-muted"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">+2000 clients satisfaits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <span className="font-medium">4.9</span>
                    <span className="text-sm text-muted-foreground">(324 avis)</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
                <Image
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800"
                alt="Consultation VitaCare"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Nos parcours de soin
              </h2>
              <p className="mt-4 text-muted-foreground">
                Explorez les consultations, therapies, activites et programmes proposes par VitaCare
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {mockCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/services?category=${category.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:border-primary hover:shadow-lg">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {category.services_count} services
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        
        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                  Services populaires
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Les services les plus reserves par les utilisateurs
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/services">
                  Voir tous les services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredServices.map((service) => (
                  <Link key={service.id} href={`/services/${service.id}`} className="group">
                  <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={service.image || '/placeholder.jpg'}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      {service.price_promo && (
                        <Badge className="absolute left-3 top-3 bg-destructive">Promo</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {service.category_name}
                      </p>
                      <h3 className="mt-1 font-medium text-foreground group-hover:text-primary">
                        {service.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {service.short_description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration} min</span>
                        </div>
                        <div className="text-right">
                          {service.price_promo ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground line-through">
                                {service.price}€
                              </span>
                              <span className="font-semibold text-primary">
                                {service.price_promo}€
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-foreground">{service.price}€</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/services">
                  Voir tous les services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Pourquoi choisir VitaCare?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Une plateforme complete pour reserver, suivre et administrer les soins
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Award,
                  title: 'Professionnels verifies',
                  description: 'Medecins, praticiens et intervenants sont presentes avec leurs specialites',
                },
                {
                  icon: Heart,
                  title: 'Reservations dynamiques',
                  description: 'Choix du service, du creneau, recapitulatif et suivi dans votre espace',
                },
                {
                  icon: Shield,
                  title: 'Suivi utilisateur',
                  description: 'Historique, notifications, profil et inscriptions aux programmes',
                },
                {
                  icon: Calendar,
                  title: 'Administration dediee',
                  description: 'L admin gere les utilisateurs, services, reservations et activites',
                },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        
        <section className="bg-primary/5 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                  Activites a venir
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Rejoignez nos ateliers et seances collectives
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/activities">
                  Toutes les activites
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingActivities.map((activity) => (
                <Link key={activity.id} href={`/activities/${activity.id}`}>
                  <Card className="h-full transition-all hover:border-primary hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <Badge variant="secondary">{activity.category_name}</Badge>
                        <Badge variant={activity.places_remaining! < 5 ? 'destructive' : 'outline'}>
                          {activity.places_remaining} places
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground">{activity.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(activity.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{activity.start_time.slice(0, 5)}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {activity.instructor_first_name} {activity.instructor_last_name}
                          </span>
                        </div>
                        <span className="font-semibold text-primary">{activity.price}€</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/activities">
                  Toutes les activites
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center sm:px-16">
              <div className="relative z-10">
                <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
                  Pret a organiser votre suivi?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                  Creez votre compte et accedez au catalogue, aux rendez-vous et a votre espace personnel.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/register">
                      Creer mon compte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <Link href="/contact">Nous contacter</Link>
                  </Button>
                </div>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

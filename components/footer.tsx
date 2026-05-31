import Link from 'next/link'
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

const footerLinks = {
  services: [
    { name: 'Massages', href: '/services?category=massages' },
    { name: 'Soins du visage', href: '/services?category=soins-visage' },
    { name: 'Yoga & Meditation', href: '/services?category=yoga-meditation' },
    { name: 'Relaxation', href: '/services?category=relaxation' },
  ],
  company: [
    { name: 'A propos', href: '/about' },
    { name: 'Notre equipe', href: '/team' },
    { name: 'Programmes', href: '/programmes' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Mentions legales', href: '/legal' },
    { name: 'Politique de confidentialite', href: '/privacy' },
    { name: 'CGV', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-semibold">VitaCare</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Votre oasis de serenite au coeur de la ville. Decouvrez nos soins de bien-etre et 
              laissez-vous porter vers la relaxation.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Nos services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">VitaCare</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>123 Avenue du Bien-etre<br />75001 Paris, France</span>
              </li>
              <li>
                <a href="tel:+33123456789" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Phone className="h-4 w-4" />
                  01 23 45 67 89
                </a>
              </li>
              <li>
                <a href="mailto:contact@vitacare.fr" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Mail className="h-4 w-4" />
                  contact@vitacare.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} VitaCare. Tous droits reserves.
          </p>
          <ul className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { Ticket, Instagram, Twitter, Facebook, Youtube, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Event<span className="text-primary">Access</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu plataforma de confianza para descubrir y comprar entradas a los mejores eventos. 
              Tickets seguros con codigo QR y acceso instantaneo.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20 hover:text-primary">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20 hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20 hover:text-primary">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20 hover:text-primary">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Explorar</h3>
            <ul className="space-y-2">
              {['Todos los Eventos', 'Conciertos', 'Festivales', 'Teatro', 'Deportes', 'Conferencias'].map((item) => (
                <li key={item}>
                  <Link href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              {[
                { label: 'Sobre Nosotros', href: '/about' },
                { label: 'Organiza tu Evento', href: '/organizer' },
                { label: 'Contacto', href: '/contact' },
                { label: 'Trabaja con Nosotros', href: '/careers' },
                { label: 'Prensa', href: '/press' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Suscribete para recibir las mejores ofertas y eventos exclusivos.
            </p>
            <form className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="tu@email.com" 
                  className="bg-background"
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EventAccess. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terminos y Condiciones
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Politica de Privacidad
            </Link>
            <Link href="/refunds" className="hover:text-primary transition-colors">
              Politica de Reembolsos
            </Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

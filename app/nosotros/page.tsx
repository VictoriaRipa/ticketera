import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Ticket, Shield, Zap, Users, Heart, Award } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nosotros | Ticketera',
  description: 'Conoce mas sobre Ticketera, la plataforma de venta de entradas mas confiable',
}

const values = [
  {
    icon: Shield,
    title: 'Seguridad',
    description: 'Transacciones protegidas y tickets con codigos QR unicos para evitar fraudes.',
  },
  {
    icon: Zap,
    title: 'Rapidez',
    description: 'Compra tus entradas en segundos y recibelas al instante en tu correo.',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description: 'Conectamos a miles de personas con los mejores eventos de la region.',
  },
  {
    icon: Heart,
    title: 'Pasion',
    description: 'Amamos lo que hacemos y nos esforzamos por brindarte la mejor experiencia.',
  },
]

const stats = [
  { value: '10K+', label: 'Usuarios activos' },
  { value: '500+', label: 'Eventos realizados' },
  { value: '50K+', label: 'Tickets vendidos' },
  { value: '99%', label: 'Satisfaccion' },
]

export default function NosotrosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Conectamos personas con{' '}
                <span className="text-primary">experiencias inolvidables</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Ticketera nacio con la mision de simplificar la forma en que compras y vendes 
                entradas para eventos. Somos la plataforma que hace posible que no te pierdas 
                ningun momento especial.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Nuestra Mision</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Democratizar el acceso a eventos y entretenimiento, brindando una plataforma 
                  segura, facil de usar y accesible para todos.
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  Creemos que cada persona merece vivir experiencias memorables. Por eso trabajamos 
                  dia a dia para conectar a organizadores de eventos con audiencias apasionadas.
                </p>
                <Button asChild size="lg">
                  <Link href="/eventos">Explorar Eventos</Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                  <Award className="w-32 h-32 text-primary/50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Nuestros Valores</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estos son los principios que guian cada decision que tomamos
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <Card key={value.title} className="border-none shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Eres organizador de eventos?
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                  Unite a Ticketera y comienza a vender entradas para tus eventos. 
                  Te ofrecemos las herramientas que necesitas para gestionar tus ventas de forma simple.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/auth/sign-up?role=organizer">
                      Registrarme como organizador
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <Link href="/contacto">Contactar ventas</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

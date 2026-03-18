import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { TicketSelector } from './ticket-selector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, Share2, Heart, Ticket, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: event } = await supabase
    .from('events')
    .select('title, short_description, image_url')
    .eq('slug', slug)
    .single()

  if (!event) return { title: 'Evento no encontrado' }

  return {
    title: event.title,
    description: event.short_description || `Compra tickets para ${event.title}`,
    openGraph: {
      title: event.title,
      description: event.short_description || undefined,
      images: event.image_url ? [event.image_url] : undefined,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      organizer:profiles!events_organizer_id_fkey(*),
      ticket_types(*)
    `)
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const startDate = new Date(event.start_date)
  const endDate = event.end_date ? new Date(event.end_date) : null
  const doorsOpen = event.doors_open ? new Date(event.doors_open) : null

  // Check if event is in the past
  const isPast = startDate < new Date()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
              <Ticket className="w-32 h-32 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Category Badge */}
          {event.category && (
            <div className="absolute top-20 left-4 md:left-8">
              <Badge variant="secondary" className="backdrop-blur-sm bg-background/70">
                {event.category.name}
              </Badge>
            </div>
          )}
        </section>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title Section */}
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                {event.is_featured && (
                  <Badge className="mb-3 bg-primary text-primary-foreground">
                    Evento Destacado
                  </Badge>
                )}
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                  {event.title}
                </h1>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{format(startDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>
                  {doorsOpen && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Apertura: {format(doorsOpen, 'HH:mm')} hs</span>
                    </div>
                  )}
                  {event.venue_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>{event.venue_name}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                <h2 className="text-xl font-semibold mb-4">Acerca del evento</h2>
                <div className="prose prose-invert max-w-none">
                  {event.description ? (
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      {event.short_description || 'Sin descripcion disponible.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                <h2 className="text-xl font-semibold mb-4">Detalles</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-muted-foreground mb-1">Fecha y hora</h3>
                      <p className="font-medium">
                        {format(startDate, "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(startDate, 'HH:mm')} hs
                        {endDate && ` - ${format(endDate, 'HH:mm')} hs`}
                      </p>
                    </div>
                    {doorsOpen && (
                      <div>
                        <h3 className="text-sm text-muted-foreground mb-1">Apertura de puertas</h3>
                        <p className="font-medium">{format(doorsOpen, 'HH:mm')} hs</p>
                      </div>
                    )}
                    {event.age_restriction && (
                      <div>
                        <h3 className="text-sm text-muted-foreground mb-1">Restriccion de edad</h3>
                        <p className="font-medium">+{event.age_restriction} anos</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {event.venue_name && (
                      <div>
                        <h3 className="text-sm text-muted-foreground mb-1">Lugar</h3>
                        <p className="font-medium">{event.venue_name}</p>
                        {event.venue_address && (
                          <p className="text-sm text-muted-foreground">{event.venue_address}</p>
                        )}
                        {event.city && (
                          <p className="text-sm text-muted-foreground">
                            {event.city}{event.country && `, ${event.country}`}
                          </p>
                        )}
                      </div>
                    )}
                    {event.max_capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm">Capacidad: {event.max_capacity} personas</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms */}
              {event.terms_conditions && (
                <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                  <h2 className="text-xl font-semibold mb-4">Terminos y condiciones</h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.terms_conditions}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar - Tickets */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {isPast ? (
                  <div className="bg-card rounded-2xl p-6 border border-border text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Evento finalizado</h3>
                    <p className="text-sm text-muted-foreground">
                      Este evento ya ha pasado. Explora otros eventos disponibles.
                    </p>
                    <Button asChild className="mt-4 w-full">
                      <Link href="/events">Ver eventos</Link>
                    </Button>
                  </div>
                ) : (
                  <TicketSelector 
                    event={event} 
                    ticketTypes={event.ticket_types || []} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="h-16" />
      </main>
      
      <Footer />
    </div>
  )
}

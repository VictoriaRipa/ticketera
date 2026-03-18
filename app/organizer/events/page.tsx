import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Calendar, MapPin, Edit, Eye, MoreHorizontal, Ticket } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Mis Eventos | Organizador',
}

const statusColors = {
  draft: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  published: 'bg-green-500/20 text-green-500 border-green-500/50',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/50',
  completed: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
}

const statusLabels = {
  draft: 'Borrador',
  published: 'Publicado',
  cancelled: 'Cancelado',
  completed: 'Completado',
}

export default async function OrganizerEventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      ticket_types(*)
    `)
    .eq('organizer_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Eventos</h1>
          <p className="text-muted-foreground">
            Gestiona todos tus eventos desde aqui
          </p>
        </div>
        <Button asChild className="glow-primary">
          <Link href="/organizer/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Link>
        </Button>
      </div>

      {events?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tienes eventos</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer evento y comienza a vender tickets
            </p>
            <Button asChild>
              <Link href="/organizer/events/new">
                <Plus className="w-4 h-4 mr-2" />
                Crear Evento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events?.map((event) => {
            const ticketsSold = event.ticket_types?.reduce((sum: number, tt: any) => sum + (tt.sold || 0), 0) || 0
            const totalCapacity = event.ticket_types?.reduce((sum: number, tt: any) => sum + (tt.quantity || 0), 0) || 0
            const startDate = new Date(event.start_date)
            const isPast = startDate < new Date()

            return (
              <Card key={event.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative w-full md:w-48 h-32 md:h-auto shrink-0">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-primary/50" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                              {statusLabels[event.status as keyof typeof statusLabels]}
                            </Badge>
                            {event.is_featured && (
                              <Badge variant="outline">Destacado</Badge>
                            )}
                            {isPast && event.status === 'published' && (
                              <Badge variant="secondary">Pasado</Badge>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(startDate, "d MMM yyyy - HH:mm", { locale: es })}
                            </div>
                            {event.venue_name && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.venue_name}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{ticketsSold}</p>
                            <p className="text-xs text-muted-foreground">de {totalCapacity}</p>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/events/${event.slug}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver evento
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/organizer/events/${event.id}`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/organizer/events/${event.id}/tickets`}>
                                  <Ticket className="w-4 h-4 mr-2" />
                                  Gestionar tickets
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Cancelar evento
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

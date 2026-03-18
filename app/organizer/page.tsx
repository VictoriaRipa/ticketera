import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Ticket, DollarSign, Users, TrendingUp, ArrowRight, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Organizador',
  description: 'Panel de control para organizadores',
}

export default async function OrganizerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch organizer's events
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types(*)
    `)
    .eq('organizer_id', user?.id)
    .order('created_at', { ascending: false })

  // Fetch orders for organizer's events
  const eventIds = events?.map(e => e.id) || []
  const { data: orders } = eventIds.length > 0 
    ? await supabase
        .from('orders')
        .select('*')
        .in('event_id', eventIds)
        .eq('status', 'completed')
    : { data: [] }

  // Calculate stats
  const totalEvents = events?.length || 0
  const publishedEvents = events?.filter(e => e.status === 'published').length || 0
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.subtotal || 0), 0) || 0
  const totalTicketsSold = orders?.length || 0

  // Upcoming events
  const upcomingEvents = events
    ?.filter(e => new Date(e.start_date) >= new Date() && e.status === 'published')
    .slice(0, 5) || []

  const stats = [
    { 
      title: 'Eventos Totales', 
      value: totalEvents, 
      subtitle: `${publishedEvents} publicados`,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    { 
      title: 'Tickets Vendidos', 
      value: totalTicketsSold, 
      subtitle: 'Total',
      icon: Ticket,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    { 
      title: 'Ingresos', 
      value: `$${totalRevenue.toLocaleString()}`, 
      subtitle: 'Sin cargo por servicio',
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    { 
      title: 'Proximos Eventos', 
      value: upcomingEvents.length, 
      subtitle: 'Activos',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de organizador
          </p>
        </div>
        <Button asChild className="glow-primary">
          <Link href="/organizer/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Proximos Eventos</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/organizer/events">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No tienes eventos proximos</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/organizer/events/new">Crear primer evento</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const ticketsSold = event.ticket_types?.reduce((sum: number, tt: any) => sum + (tt.sold || 0), 0) || 0
                  const totalCapacity = event.ticket_types?.reduce((sum: number, tt: any) => sum + (tt.quantity || 0), 0) || 0
                  
                  return (
                    <Link
                      key={event.id}
                      href={`/organizer/events/${event.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.start_date), "d MMM yyyy - HH:mm", { locale: es })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-primary">{ticketsSold}/{totalCapacity}</p>
                        <p className="text-xs text-muted-foreground">vendidos</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild variant="outline" className="h-24 flex-col gap-2">
              <Link href="/organizer/events/new">
                <Plus className="w-6 h-6" />
                <span>Nuevo Evento</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2">
              <Link href="/organizer/scanner">
                <Ticket className="w-6 h-6" />
                <span>Escaner QR</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2">
              <Link href="/organizer/orders">
                <DollarSign className="w-6 h-6" />
                <span>Ver Ventas</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2">
              <Link href="/organizer/events">
                <Users className="w-6 h-6" />
                <span>Mis Eventos</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

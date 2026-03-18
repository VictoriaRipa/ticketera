import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Calendar, 
  Ticket, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Administracion',
  description: 'Panel de administracion de EventAccess',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch all stats
  const [
    { count: totalUsers },
    { count: totalOrganizers },
    { count: totalEvents },
    { count: publishedEvents },
    { count: draftEvents },
    { data: allOrders },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organizer'),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('orders').select('subtotal, service_fee, total').eq('status', 'completed'),
    supabase.from('events').select(`
      *,
      organizer:profiles!events_organizer_id_fkey(full_name, email)
    `).order('created_at', { ascending: false }).limit(10),
  ])

  const totalRevenue = allOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
  const platformFees = allOrders?.reduce((sum, o) => sum + (o.service_fee || 0), 0) || 0
  const totalTicketsSold = allOrders?.length || 0

  const stats = [
    { 
      title: 'Usuarios Totales', 
      value: totalUsers || 0, 
      subtitle: `${totalOrganizers || 0} organizadores`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    { 
      title: 'Eventos Totales', 
      value: totalEvents || 0, 
      subtitle: `${publishedEvents || 0} publicados`,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    { 
      title: 'Tickets Vendidos', 
      value: totalTicketsSold, 
      subtitle: 'Total',
      icon: Ticket,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    { 
      title: 'Ingresos Totales', 
      value: `$${totalRevenue.toLocaleString()}`, 
      subtitle: `$${platformFees.toLocaleString()} en fees`,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ]

  const statusColors = {
    draft: 'bg-yellow-500/20 text-yellow-500',
    published: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
    completed: 'bg-blue-500/20 text-blue-500',
  }

  const statusIcons = {
    draft: Clock,
    published: CheckCircle2,
    cancelled: AlertCircle,
    completed: CheckCircle2,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Panel de Administracion</h1>
        <p className="text-muted-foreground">
          Vista general de toda la plataforma
        </p>
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

      {/* Quick Stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/20">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eventos por moderar</p>
              <p className="text-3xl font-bold">{draftEvents || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-full bg-green-500/20">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ganancias de la plataforma</p>
              <p className="text-3xl font-bold">${platformFees.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-full bg-blue-500/20">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa de conversion</p>
              <p className="text-3xl font-bold">
                {totalUsers && totalTicketsSold 
                  ? ((totalTicketsSold / totalUsers) * 100).toFixed(1) 
                  : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Eventos Recientes</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/events">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEvents?.map((event: any) => {
              const StatusIcon = statusIcons[event.status as keyof typeof statusIcons] || Clock
              
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <StatusIcon className={`w-5 h-5 ${
                      event.status === 'published' ? 'text-green-500' : 
                      event.status === 'draft' ? 'text-yellow-500' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      por {event.organizer?.full_name || event.organizer?.email || 'Desconocido'}
                    </p>
                  </div>
                  <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                    {event.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(event.created_at), 'd MMM', { locale: es })}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

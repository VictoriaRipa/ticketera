import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DollarSign, Ticket, TrendingUp, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ordenes | Organizador',
  description: 'Gestiona las ordenes de tus eventos',
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  completed: 'bg-green-500/20 text-green-500 border-green-500/50',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/50',
  refunded: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
}

const statusLabels = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
}

export default async function OrganizerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get organizer's events
  const { data: events } = await supabase
    .from('events')
    .select('id, title')
    .eq('organizer_id', user?.id)

  const eventIds = events?.map(e => e.id) || []

  // Get orders for those events
  const { data: orders } = eventIds.length > 0 
    ? await supabase
        .from('orders')
        .select(`
          *,
          event:events(id, title, slug)
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Calculate stats
  const completedOrders = orders?.filter(o => o.status === 'completed') || []
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0)
  const totalServiceFees = completedOrders.reduce((sum, o) => sum + (o.service_fee || 0), 0)
  const totalTickets = completedOrders.length

  const stats = [
    {
      title: 'Ingresos Totales',
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: 'Sin cargo por servicio',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Ordenes Completadas',
      value: completedOrders.length,
      subtitle: `de ${orders?.length || 0} totales`,
      icon: Ticket,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Cargo por Servicio',
      value: `$${totalServiceFees.toLocaleString()}`,
      subtitle: 'Total cobrado',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Compradores',
      value: new Set(orders?.map(o => o.attendee_email)).size,
      subtitle: 'Unicos',
      icon: Users,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Ordenes</h1>
        <p className="text-muted-foreground">
          Historial de ventas de todos tus eventos
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ordenes</CardTitle>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay ordenes aun</p>
              <p className="text-sm text-muted-foreground mt-1">
                Las ordenes apareceran aqui cuando tus eventos tengan ventas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {order.event?.title || 'Evento eliminado'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.attendee_name}</p>
                          <p className="text-sm text-muted-foreground">{order.attendee_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.created_at), "d MMM yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">${order.total?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            (${order.subtotal?.toLocaleString()} + ${order.service_fee?.toLocaleString()} fee)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

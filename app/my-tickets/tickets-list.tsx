'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, Ticket, QrCode, Download, Clock, CheckCircle2, XCircle, Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Order, Ticket as TicketType } from '@/lib/types'

interface TicketsListProps {
  orders: (Order & { 
    event: any
    tickets: (TicketType & { ticket_type: any })[] 
  })[]
}

export function TicketsList({ orders }: TicketsListProps) {
  const [selectedTicket, setSelectedTicket] = useState<(TicketType & { ticket_type: any; event: any }) | null>(null)

  // Separate upcoming and past events
  const now = new Date()
  const upcomingOrders = orders.filter(o => new Date(o.event.start_date) >= now)
  const pastOrders = orders.filter(o => new Date(o.event.start_date) < now)

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <Ticket className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No tienes tickets</h3>
        <p className="text-muted-foreground mb-6">
          Cuando compres tickets, apareceran aqui
        </p>
        <Button asChild>
          <Link href="/events">Explorar eventos</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="gap-2">
            <Clock className="w-4 h-4" />
            Proximos ({upcomingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Pasados ({pastOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tienes eventos proximos</p>
              <Button asChild variant="outline">
                <Link href="/events">Buscar eventos</Link>
              </Button>
            </div>
          ) : (
            upcomingOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onSelectTicket={(ticket) => setSelectedTicket({ ...ticket, event: order.event })}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {pastOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tienes eventos pasados</p>
            </div>
          ) : (
            pastOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                isPast
                onSelectTicket={(ticket) => setSelectedTicket({ ...ticket, event: order.event })}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Ticket QR Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-md">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">Tu Ticket</DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-6">
                {/* QR Code */}
                <div className="bg-white p-6 rounded-xl inline-block">
                  <QRCodeSVG
                    value={selectedTicket.qr_code}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* QR Code Text */}
                <p className="text-sm font-mono text-muted-foreground">
                  {selectedTicket.qr_code}
                </p>

                {/* Ticket Status */}
                <Badge 
                  variant={selectedTicket.status === 'valid' ? 'default' : 'secondary'}
                  className={selectedTicket.status === 'valid' ? 'bg-green-500/20 text-green-500 border-green-500/50' : ''}
                >
                  {selectedTicket.status === 'valid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {selectedTicket.status === 'used' && <XCircle className="w-3 h-3 mr-1" />}
                  {selectedTicket.status === 'valid' ? 'Valido' : 
                   selectedTicket.status === 'used' ? 'Utilizado' : 
                   selectedTicket.status === 'cancelled' ? 'Cancelado' : 'Transferido'}
                </Badge>

                {/* Event Info */}
                <div className="text-left p-4 rounded-lg bg-card border border-border">
                  <h4 className="font-semibold mb-2">{selectedTicket.event.title}</h4>
                  <p className="text-sm text-primary font-medium mb-2">
                    {selectedTicket.ticket_type?.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedTicket.event.start_date), "d 'de' MMMM, yyyy - HH:mm", { locale: es })} hs
                  </div>
                  {selectedTicket.event.venue_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedTicket.event.venue_name}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <p className="text-xs text-muted-foreground">
                  Muestra este codigo QR en la entrada del evento
                </p>

                {/* Download Button */}
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Ticket
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

interface OrderCardProps {
  order: Order & { event: any; tickets: (TicketType & { ticket_type: any })[] }
  isPast?: boolean
  onSelectTicket: (ticket: TicketType & { ticket_type: any }) => void
}

function OrderCard({ order, isPast, onSelectTicket }: OrderCardProps) {
  const startDate = new Date(order.event.start_date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`overflow-hidden ${isPast ? 'opacity-75' : ''}`}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Event Image */}
            <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0">
              {order.event.image_url ? (
                <Image
                  src={order.event.image_url}
                  alt={order.event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                  <Ticket className="w-12 h-12 text-primary/50" />
                </div>
              )}
              {isPast && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <Badge variant="secondary">Evento pasado</Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="space-y-2">
                  <Link href={`/events/${order.event.slug}`}>
                    <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                      {order.event.title}
                    </h3>
                  </Link>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      {format(startDate, "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary" />
                      {format(startDate, 'HH:mm')} hs
                    </div>
                    {order.event.venue_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-primary" />
                        {order.event.venue_name}
                      </div>
                    )}
                  </div>

                  {/* Tickets */}
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      {order.tickets.length} ticket{order.tickets.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {order.tickets.map((ticket, index) => (
                        <Button
                          key={ticket.id}
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectTicket(ticket)}
                          className="gap-2"
                          disabled={isPast}
                        >
                          <QrCode className="w-4 h-4" />
                          {ticket.ticket_type?.name || `Ticket ${index + 1}`}
                          {ticket.status === 'used' && (
                            <Badge variant="secondary" className="text-xs">Usado</Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Orden #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    ${order.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), "d/MM/yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

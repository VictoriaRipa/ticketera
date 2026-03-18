'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, Ticket, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import type { Event, TicketType } from '@/lib/types'

interface TicketSelectorProps {
  event: Event
  ticketTypes: TicketType[]
}

const SERVICE_FEE_PERCENTAGE = 0.10 // 10% service fee

export function TicketSelector({ event, ticketTypes }: TicketSelectorProps) {
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const updateQuantity = (ticketTypeId: string, delta: number, maxAvailable: number, maxPerOrder: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketTypeId] || 0
      const newValue = Math.max(0, Math.min(current + delta, Math.min(maxAvailable, maxPerOrder)))
      
      if (newValue === 0) {
        const { [ticketTypeId]: _, ...rest } = prev
        return rest
      }
      
      return { ...prev, [ticketTypeId]: newValue }
    })
  }

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)
  
  const subtotal = ticketTypes.reduce((sum, tt) => {
    const qty = selectedTickets[tt.id] || 0
    return sum + (tt.price * qty)
  }, 0)

  const serviceFee = subtotal * SERVICE_FEE_PERCENTAGE
  const total = subtotal + serviceFee

  const handleCheckout = () => {
    if (totalTickets === 0) return
    
    setIsProcessing(true)
    
    // Store selected tickets in URL params
    const params = new URLSearchParams()
    Object.entries(selectedTickets).forEach(([ticketTypeId, qty]) => {
      params.append('tickets', `${ticketTypeId}:${qty}`)
    })
    
    router.push(`/checkout/${event.slug}?${params.toString()}`)
  }

  const activeTicketTypes = ticketTypes.filter(tt => {
    const now = new Date()
    const saleStart = tt.sale_start ? new Date(tt.sale_start) : null
    const saleEnd = tt.sale_end ? new Date(tt.sale_end) : null
    
    if (saleStart && now < saleStart) return false
    if (saleEnd && now > saleEnd) return false
    if (!tt.is_active) return false
    
    return true
  })

  const availableTicketTypes = activeTicketTypes.filter(tt => tt.quantity - tt.sold > 0)

  if (ticketTypes.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border text-center">
        <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold mb-2">Tickets no disponibles</h3>
        <p className="text-sm text-muted-foreground">
          Aun no hay tickets a la venta para este evento.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold mb-1">Selecciona tus tickets</h2>
        <p className="text-sm text-muted-foreground">
          Elige el tipo y cantidad de entradas
        </p>
      </div>

      {/* Ticket Types */}
      <div className="divide-y divide-border">
        {ticketTypes.map((ticketType) => {
          const available = ticketType.quantity - ticketType.sold
          const isAvailable = available > 0 && ticketType.is_active
          const now = new Date()
          const saleStart = ticketType.sale_start ? new Date(ticketType.sale_start) : null
          const saleEnd = ticketType.sale_end ? new Date(ticketType.sale_end) : null
          const notStarted = saleStart && now < saleStart
          const ended = saleEnd && now > saleEnd
          const selected = selectedTickets[ticketType.id] || 0

          return (
            <div 
              key={ticketType.id} 
              className={`p-4 transition-colors ${
                isAvailable && !notStarted && !ended 
                  ? 'hover:bg-accent/50' 
                  : 'opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{ticketType.name}</h3>
                    {available <= 10 && available > 0 && !notStarted && !ended && (
                      <Badge variant="destructive" className="text-xs">
                        Ultimos {available}!
                      </Badge>
                    )}
                    {notStarted && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Proximamente
                      </Badge>
                    )}
                    {ended && (
                      <Badge variant="secondary" className="text-xs">
                        Venta finalizada
                      </Badge>
                    )}
                    {available === 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Agotado
                      </Badge>
                    )}
                  </div>
                  {ticketType.description && (
                    <p className="text-sm text-muted-foreground">
                      {ticketType.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">
                    {ticketType.price === 0 ? 'Gratis' : `$${ticketType.price.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              {isAvailable && !notStarted && !ended && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">
                    {available} disponibles (max {ticketType.max_per_order} por orden)
                  </span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(ticketType.id, -1, available, ticketType.max_per_order)}
                      disabled={selected === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{selected}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(ticketType.id, 1, available, ticketType.max_per_order)}
                      disabled={selected >= Math.min(available, ticketType.max_per_order)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <AnimatePresence>
        {totalTickets > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({totalTickets} tickets)</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cargo por servicio (10%)</span>
                <span>${serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">${total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Button */}
      <div className="p-6 pt-0">
        <Button 
          className="w-full h-12 text-lg glow-primary" 
          disabled={totalTickets === 0 || isProcessing}
          onClick={handleCheckout}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : totalTickets === 0 ? (
            'Selecciona tickets'
          ) : (
            `Comprar ${totalTickets} ticket${totalTickets > 1 ? 's' : ''}`
          )}
        </Button>
        
        {/* Fee Notice */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          Los cargos por servicio no son reembolsables
        </p>
      </div>
    </div>
  )
}

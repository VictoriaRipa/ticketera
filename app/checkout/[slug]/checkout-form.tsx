'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Calendar, MapPin, Ticket, Shield, CreditCard, User, Mail, Phone, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Event, TicketType, Profile } from '@/lib/types'
import type { User as AuthUser } from '@supabase/supabase-js'

interface CheckoutFormProps {
  event: Event
  ticketTypes: TicketType[]
  selectedTickets: Record<string, number>
  user: AuthUser
  profile: Profile | null
}

const SERVICE_FEE_PERCENTAGE = 0.10

const checkoutSchema = z.object({
  attendee_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  attendee_email: z.string().email('Email invalido'),
  attendee_phone: z.string().optional(),
  accept_terms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los terminos y condiciones',
  }),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

function generateQRCode(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `EA-${timestamp}-${random}`.toUpperCase()
}

export function CheckoutForm({ event, ticketTypes, selectedTickets, user, profile }: CheckoutFormProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      attendee_name: profile?.full_name || '',
      attendee_email: user.email || '',
      attendee_phone: profile?.phone || '',
      accept_terms: false,
    },
  })

  const acceptTerms = watch('accept_terms')

  // Calculate totals
  const orderItems = Object.entries(selectedTickets)
    .map(([ticketTypeId, quantity]) => {
      const ticketType = ticketTypes.find(t => t.id === ticketTypeId)
      if (!ticketType) return null
      return {
        ticketType,
        quantity,
        subtotal: ticketType.price * quantity,
      }
    })
    .filter(Boolean) as { ticketType: TicketType; quantity: number; subtotal: number }[]

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
  const serviceFee = subtotal * SERVICE_FEE_PERCENTAGE
  const total = subtotal + serviceFee
  const totalTickets = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true)
    setStep('processing')

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          event_id: event.id,
          status: 'completed',
          subtotal,
          service_fee: serviceFee,
          total,
          payment_method: 'demo',
          attendee_name: data.attendee_name,
          attendee_email: data.attendee_email,
          attendee_phone: data.attendee_phone || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create tickets
      const ticketsToCreate = orderItems.flatMap(item =>
        Array.from({ length: item.quantity }, () => ({
          order_id: order.id,
          ticket_type_id: item.ticketType.id,
          qr_code: generateQRCode(),
          status: 'valid' as const,
        }))
      )

      const { error: ticketsError } = await supabase
        .from('tickets')
        .insert(ticketsToCreate)

      if (ticketsError) throw ticketsError

      setStep('success')
      toast.success('Compra realizada con exito!')
      
      // Redirect to tickets page after short delay
      setTimeout(() => {
        router.push(`/my-tickets?order=${order.id}`)
      }, 2000)
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Error al procesar la compra. Por favor intenta nuevamente.')
      setStep('form')
    } finally {
      setIsProcessing(false)
    }
  }

  const startDate = new Date(event.start_date)

  if (step === 'processing' || step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto text-center py-16"
      >
        {step === 'processing' ? (
          <>
            <Spinner className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Procesando tu compra...</h2>
            <p className="text-muted-foreground">
              Por favor espera mientras confirmamos tu orden.
            </p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Ticket className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Compra exitosa!</h2>
            <p className="text-muted-foreground mb-4">
              Tus tickets han sido generados. Te redirigiremos a tus tickets en unos segundos...
            </p>
            <p className="text-sm text-muted-foreground">
              Tambien recibiras un email con tus tickets.
            </p>
          </>
        )}
      </motion.div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Completa tus datos para finalizar la compra
          </p>
        </motion.div>

        {/* Event Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                    <Ticket className="w-8 h-8 text-primary/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{event.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(startDate, "d MMM yyyy", { locale: es })}
                  </span>
                  {event.venue_name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.venue_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendee Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Datos del asistente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attendee_name">Nombre completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="attendee_name"
                    placeholder="Juan Perez"
                    className="pl-10"
                    {...register('attendee_name')}
                  />
                </div>
                {errors.attendee_name && (
                  <p className="text-sm text-destructive">{errors.attendee_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendee_email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="attendee_email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    {...register('attendee_email')}
                  />
                </div>
                {errors.attendee_email && (
                  <p className="text-sm text-destructive">{errors.attendee_email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enviaremos los tickets a este email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendee_phone">Telefono (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="attendee_phone"
                    type="tel"
                    placeholder="+54 11 1234-5678"
                    className="pl-10"
                    {...register('attendee_phone')}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Payment - Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-primary font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Modo Demo - No se realizaran cargos reales
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Esta es una demostracion. En produccion, aqui se integraria Stripe o MercadoPago.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="accept_terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setValue('accept_terms', checked === true)}
          />
          <label
            htmlFor="accept_terms"
            className="text-sm text-muted-foreground leading-tight cursor-pointer"
          >
            Acepto los terminos y condiciones de compra, incluyendo la politica de reembolsos. 
            Los cargos por servicio no son reembolsables.
          </label>
        </div>
        {errors.accept_terms && (
          <p className="text-sm text-destructive">{errors.accept_terms.message}</p>
        )}
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tickets */}
              <div className="space-y-3">
                {orderItems.map(({ ticketType, quantity, subtotal }) => (
                  <div key={ticketType.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{ticketType.name}</span>
                      <span className="text-muted-foreground"> x{quantity}</span>
                    </div>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Cargo por servicio
                    <Badge variant="secondary" className="text-xs">10%</Badge>
                  </span>
                  <span>${serviceFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toLocaleString()}</span>
              </div>

              <Button 
                type="submit" 
                form="checkout-form" 
                className="w-full h-12 glow-primary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner className="w-5 h-5 mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Pagar ${total.toLocaleString()}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Pago seguro y encriptado
              </p>
            </CardContent>
          </Card>

          {/* Refund Notice */}
          <div className="mt-4 p-4 rounded-lg bg-card border border-border">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Politica de reembolso</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Los reembolsos se procesan segun la politica del organizador. 
                  Los cargos por servicio no son reembolsables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

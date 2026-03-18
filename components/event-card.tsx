'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Ticket as TicketIcon, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Event } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface EventCardProps {
  event: Event
  index?: number
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const startDate = new Date(event.start_date)
  const minPrice = event.ticket_types?.length 
    ? Math.min(...event.ticket_types.map(t => t.price))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={`/events/${event.slug}`}>
        <Card className="group overflow-hidden bg-card hover:bg-accent/50 transition-all duration-300 border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                <TicketIcon className="w-16 h-16 text-primary/50" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
            
            {/* Featured Badge */}
            {event.is_featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary text-primary-foreground font-semibold gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Destacado
                </Badge>
              </div>
            )}

            {/* Category Badge */}
            {event.category && (
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="backdrop-blur-sm bg-background/70">
                  {event.category.name}
                </Badge>
              </div>
            )}

            {/* Date Box */}
            <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-center min-w-[60px]">
              <span className="block text-xs font-medium text-primary uppercase">
                {format(startDate, 'MMM', { locale: es })}
              </span>
              <span className="block text-2xl font-bold leading-none">
                {format(startDate, 'd')}
              </span>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>{format(startDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              
              {event.doors_open && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>Apertura: {format(new Date(event.doors_open), 'HH:mm')} hs</span>
                </div>
              )}
              
              {event.venue_name && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{event.venue_name}, {event.city}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Desde</span>
              <span className="text-xl font-bold text-primary">
                {minPrice !== null ? (
                  minPrice === 0 ? 'Gratis' : `$${minPrice.toLocaleString()}`
                ) : (
                  'Agotado'
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/10] bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <div className="h-4 bg-muted rounded w-16 animate-pulse" />
          <div className="h-6 bg-muted rounded w-20 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

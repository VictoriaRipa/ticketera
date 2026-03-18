'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard, EventCardSkeleton } from '@/components/event-card'
import type { Event } from '@/lib/types'

interface FeaturedEventsProps {
  events: Event[]
  title?: string
  subtitle?: string
  showViewAll?: boolean
}

export function FeaturedEvents({ 
  events, 
  title = 'Eventos destacados',
  subtitle = 'Los mejores eventos seleccionados para ti',
  showViewAll = true 
}: FeaturedEventsProps) {
  return (
    <section className="py-16 md:py-24 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {title.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-primary">{title.split(' ').slice(-1)}</span>
            </h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          
          {showViewAll && (
            <Button variant="outline" asChild className="group w-fit">
              <Link href="/events">
                Ver todos los eventos
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </motion.div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No hay eventos disponibles en este momento.
            </p>
            <Button asChild>
              <Link href="/organizer">Crea tu primer evento</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export function FeaturedEventsSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="h-10 w-64 bg-muted rounded animate-pulse mb-2" />
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

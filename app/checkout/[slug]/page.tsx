import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from './checkout-form'
import { Navbar } from '@/components/navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Completa tu compra de tickets',
}

interface CheckoutPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tickets?: string | string[] }>
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { slug } = await params
  const { tickets } = await searchParams
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/auth/login?redirect=/checkout/${slug}${tickets ? `?tickets=${Array.isArray(tickets) ? tickets.join('&tickets=') : tickets}` : ''}`)
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch event
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      ticket_types(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!event) notFound()

  // Parse selected tickets from URL
  const ticketParams = Array.isArray(tickets) ? tickets : tickets ? [tickets] : []
  const selectedTickets: Record<string, number> = {}
  
  ticketParams.forEach(param => {
    const [ticketTypeId, qty] = param.split(':')
    if (ticketTypeId && qty) {
      selectedTickets[ticketTypeId] = parseInt(qty)
    }
  })

  // If no tickets selected, redirect back
  if (Object.keys(selectedTickets).length === 0) {
    redirect(`/events/${slug}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <CheckoutForm 
            event={event}
            ticketTypes={event.ticket_types || []}
            selectedTickets={selectedTickets}
            user={user}
            profile={profile}
          />
        </div>
      </main>
    </div>
  )
}

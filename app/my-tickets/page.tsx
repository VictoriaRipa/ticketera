import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { TicketsList } from './tickets-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis Tickets',
  description: 'Gestiona tus tickets y accede a tus eventos',
}

export default async function MyTicketsPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login?redirect=/my-tickets')
  }

  // Fetch user's orders with tickets
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      event:events(
        *,
        category:categories(*)
      ),
      tickets(
        *,
        ticket_type:ticket_types(*)
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Mis <span className="text-primary">Tickets</span>
            </h1>
            <p className="text-muted-foreground">
              Todos tus tickets y entradas para eventos
            </p>
          </div>

          <TicketsList orders={orders || []} />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

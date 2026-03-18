import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { EventsGrid } from './events-grid'
import { EventsFilter } from './events-filter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explorar Eventos',
  description: 'Descubre todos los eventos disponibles. Conciertos, festivales, teatro y mas.',
}

interface EventsPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    city?: string
    date?: string
    page?: string
  }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Build query
  let query = supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      ticket_types(*)
    `, { count: 'exact' })
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString())
    .order('start_date')

  // Apply filters
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%,venue_name.ilike.%${params.q}%`)
  }

  if (params.category && params.category !== 'all') {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  if (params.city) {
    query = query.ilike('city', `%${params.city}%`)
  }

  // Pagination
  const page = parseInt(params.page || '1')
  const limit = 12
  const offset = (page - 1) * limit

  query = query.range(offset, offset + limit - 1)

  const { data: events, count } = await query

  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Explorar <span className="text-primary">eventos</span>
            </h1>
            <p className="text-muted-foreground">
              {count ? `${count} eventos encontrados` : 'Buscando eventos...'}
            </p>
          </div>

          {/* Filters */}
          <EventsFilter 
            categories={categories || []} 
            currentFilters={params}
          />

          {/* Events Grid */}
          <Suspense fallback={<div className="animate-pulse">Cargando...</div>}>
            <EventsGrid 
              events={events || []} 
              currentPage={page}
              totalPages={totalPages}
            />
          </Suspense>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

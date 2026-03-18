import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { CategoriesSection } from '@/components/categories-section'
import { FeaturedEvents } from '@/components/featured-events'
import { CTASection } from '@/components/cta-section'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Fetch featured events
  const { data: featuredEvents } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      ticket_types(*)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date')
    .limit(8)

  // Fetch upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      ticket_types(*)
    `)
    .eq('status', 'published')
    .gte('start_date', new Date().toISOString())
    .order('start_date')
    .limit(8)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection categories={categories || []} />
        
        <CategoriesSection categories={categories || []} />
        
        <FeaturedEvents 
          events={featuredEvents || []}
          title="Eventos destacados"
          subtitle="Los mejores eventos seleccionados para ti"
        />

        <FeaturedEvents 
          events={upcomingEvents || []}
          title="Proximos eventos"
          subtitle="No te pierdas lo que viene"
          showViewAll={true}
        />
        
        <CTASection />
      </main>
      
      <Footer />
    </div>
  )
}

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Music, 
  PartyPopper, 
  Theater, 
  Trophy, 
  Mic2, 
  Sparkles,
  Palette,
  UtensilsCrossed,
  Laptop,
  Baby,
  Tag
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categorias | Ticketera',
  description: 'Explora todas las categorias de eventos disponibles',
}

const iconMap: Record<string, any> = {
  'conciertos': Music,
  'festivales': PartyPopper,
  'teatro': Theater,
  'deportes': Trophy,
  'conferencias': Mic2,
  'fiestas': Sparkles,
  'arte-cultura': Palette,
  'gastronomia': UtensilsCrossed,
  'tecnologia': Laptop,
  'familia': Baby,
}

const colorMap: Record<string, string> = {
  'conciertos': 'from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30',
  'festivales': 'from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30',
  'teatro': 'from-purple-500/20 to-violet-500/20 hover:from-purple-500/30 hover:to-violet-500/30',
  'deportes': 'from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30',
  'conferencias': 'from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30',
  'fiestas': 'from-fuchsia-500/20 to-pink-500/20 hover:from-fuchsia-500/30 hover:to-pink-500/30',
  'arte-cultura': 'from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30',
  'gastronomia': 'from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30',
  'tecnologia': 'from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30',
  'familia': 'from-teal-500/20 to-green-500/20 hover:from-teal-500/30 hover:to-green-500/30',
}

export default async function CategoriasPage() {
  const supabase = await createClient()

  // Fetch categories with event count
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Get event count for each category
  const categoriesWithCount = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())

      return { ...category, eventCount: count || 0 }
    })
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Explora por <span className="text-primary">Categoria</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Encuentra eventos que se ajusten a tus intereses
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {categoriesWithCount.length === 0 ? (
              <div className="text-center py-16">
                <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">No hay categorias disponibles</h2>
                <p className="text-muted-foreground">
                  Las categorias se mostraran aqui cuando esten disponibles
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoriesWithCount.map((category) => {
                  const Icon = iconMap[category.slug] || Tag
                  const gradient = colorMap[category.slug] || 'from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20'

                  return (
                    <Link key={category.id} href={`/eventos?categoria=${category.slug}`}>
                      <Card className={`group h-full border-none bg-gradient-to-br ${gradient} transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-2xl bg-background/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Icon className="w-8 h-8 text-foreground" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                          <Badge variant="secondary" className="bg-background/50">
                            {category.eventCount} {category.eventCount === 1 ? 'evento' : 'eventos'}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">No encontras lo que buscas?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Explora todos nuestros eventos o usa el buscador para encontrar exactamente lo que necesitas
            </p>
            <Link 
              href="/eventos"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-6 hover:bg-primary/90 transition-colors"
            >
              Ver todos los eventos
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

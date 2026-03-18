'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Music, Trophy, Theater, Sparkles, Users, Laugh, Moon, Heart } from 'lucide-react'
import type { Category } from '@/lib/types'

interface CategoriesSectionProps {
  categories: Category[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  music: Music,
  trophy: Trophy,
  drama: Theater,
  sparkles: Sparkles,
  users: Users,
  laugh: Laugh,
  moon: Moon,
  heart: Heart,
}

const colorMap: Record<string, string> = {
  concerts: 'from-pink-500 to-rose-600',
  sports: 'from-green-500 to-emerald-600',
  theater: 'from-amber-500 to-orange-600',
  festivals: 'from-violet-500 to-purple-600',
  conferences: 'from-blue-500 to-cyan-600',
  comedy: 'from-yellow-500 to-amber-600',
  nightlife: 'from-indigo-500 to-violet-600',
  family: 'from-red-500 to-pink-600',
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explora por <span className="text-primary">categoria</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuentra el evento perfecto segun tus gustos e intereses
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon || 'sparkles'] || Sparkles
            const gradient = colorMap[category.slug] || 'from-primary to-chart-2'
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/events?category=${category.slug}`}>
                  <div className="group relative overflow-hidden rounded-2xl p-6 h-40 flex flex-col justify-between bg-card border border-border hover:border-primary/50 transition-all duration-300">
                    {/* Background Gradient on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Label */}
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        Ver eventos
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

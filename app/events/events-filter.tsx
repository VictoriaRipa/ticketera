'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { Category } from '@/lib/types'

interface EventsFilterProps {
  categories: Category[]
  currentFilters: {
    q?: string
    category?: string
    city?: string
    date?: string
  }
}

export function EventsFilter({ categories, currentFilters }: EventsFilterProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentFilters.q || '')
  const [category, setCategory] = useState(currentFilters.category || '')
  const [city, setCity] = useState(currentFilters.city || '')
  const [isOpen, setIsOpen] = useState(false)

  const activeFilters = [
    currentFilters.q && { key: 'q', label: `Busqueda: ${currentFilters.q}` },
    currentFilters.category && currentFilters.category !== 'all' && { 
      key: 'category', 
      label: categories.find(c => c.slug === currentFilters.category)?.name || currentFilters.category 
    },
    currentFilters.city && { key: 'city', label: `Ciudad: ${currentFilters.city}` },
  ].filter(Boolean) as { key: string; label: string }[]

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category && category !== 'all') params.set('category', category)
    if (city) params.set('city', city)
    router.push(`/events?${params.toString()}`)
    setIsOpen(false)
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams()
    if (key !== 'q' && currentFilters.q) params.set('q', currentFilters.q)
    if (key !== 'category' && currentFilters.category) params.set('category', currentFilters.category)
    if (key !== 'city' && currentFilters.city) params.set('city', currentFilters.city)
    router.push(`/events?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setSearch('')
    setCategory('')
    setCity('')
    router.push('/events')
  }

  // Search on enter
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters()
    }
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Main Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Ciudad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-[150px]"
          />

          <Button onClick={applyFilters}>
            Aplicar
          </Button>
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Filtra los eventos por categoria, ciudad y mas
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <Input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ciudad</label>
                <Input
                  type="text"
                  placeholder="Nombre de la ciudad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={applyFilters} className="flex-1">
                  Aplicar filtros
                </Button>
                <Button variant="outline" onClick={clearAllFilters}>
                  Limpiar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => removeFilter(filter.key)}
            >
              {filter.label}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpiar todos
          </Button>
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { EventForm } from '../event-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Evento | Organizador',
}

export default async function NewEventPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Crear Evento</h1>
        <p className="text-muted-foreground">
          Completa los datos de tu evento para comenzar a vender tickets
        </p>
      </div>

      <EventForm categories={categories || []} />
    </div>
  )
}

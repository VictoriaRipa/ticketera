'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Calendar, MapPin, Ticket, FileText, Image as ImageIcon } from 'lucide-react'
import type { Category, Event, TicketType } from '@/lib/types'

const eventSchema = z.object({
  title: z.string().min(3, 'El titulo debe tener al menos 3 caracteres'),
  short_description: z.string().min(10, 'La descripcion corta debe tener al menos 10 caracteres'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Selecciona una categoria'),
  image_url: z.string().url('URL de imagen invalida').optional().or(z.literal('')),
  venue_name: z.string().min(2, 'Ingresa el nombre del lugar'),
  venue_address: z.string().optional(),
  city: z.string().min(2, 'Ingresa la ciudad'),
  country: z.string().default('Argentina'),
  start_date: z.string().min(1, 'Selecciona la fecha de inicio'),
  end_date: z.string().optional(),
  doors_open: z.string().optional(),
  max_capacity: z.number().optional(),
  age_restriction: z.number().optional(),
  terms_conditions: z.string().optional(),
  ticket_types: z.array(z.object({
    name: z.string().min(2, 'Nombre del ticket requerido'),
    description: z.string().optional(),
    price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
    quantity: z.number().min(1, 'Cantidad minima: 1'),
    max_per_order: z.number().min(1).max(10).default(10),
  })).min(1, 'Agrega al menos un tipo de ticket'),
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  categories: Category[]
  event?: Event
  ticketTypes?: TicketType[]
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    + '-' + Date.now().toString(36)
}

export function EventForm({ categories, event, ticketTypes }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft')
  const supabase = createClient()
  const isEditing = !!event

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      short_description: event?.short_description || '',
      description: event?.description || '',
      category_id: event?.category_id || '',
      image_url: event?.image_url || '',
      venue_name: event?.venue_name || '',
      venue_address: event?.venue_address || '',
      city: event?.city || '',
      country: event?.country || 'Argentina',
      start_date: event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
      end_date: event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      doors_open: event?.doors_open ? new Date(event.doors_open).toISOString().slice(0, 16) : '',
      max_capacity: event?.max_capacity || undefined,
      age_restriction: event?.age_restriction || undefined,
      terms_conditions: event?.terms_conditions || '',
      ticket_types: ticketTypes?.map(tt => ({
        name: tt.name,
        description: tt.description || '',
        price: tt.price,
        quantity: tt.quantity,
        max_per_order: tt.max_per_order,
      })) || [{ name: 'General', description: '', price: 0, quantity: 100, max_per_order: 10 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticket_types',
  })

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const slug = isEditing ? event.slug : generateSlug(data.title)

      const eventData = {
        organizer_id: user.id,
        title: data.title,
        slug,
        short_description: data.short_description,
        description: data.description || null,
        category_id: data.category_id,
        image_url: data.image_url || null,
        venue_name: data.venue_name,
        venue_address: data.venue_address || null,
        city: data.city,
        country: data.country,
        start_date: new Date(data.start_date).toISOString(),
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
        doors_open: data.doors_open ? new Date(data.doors_open).toISOString() : null,
        max_capacity: data.max_capacity || null,
        age_restriction: data.age_restriction || null,
        terms_conditions: data.terms_conditions || null,
        status: publishStatus,
      }

      let eventId = event?.id

      if (isEditing) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)

        if (error) throw error
      } else {
        const { data: newEvent, error } = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single()

        if (error) throw error
        eventId = newEvent.id
      }

      // Create/update ticket types
      if (!isEditing && eventId) {
        const ticketTypesData = data.ticket_types.map(tt => ({
          event_id: eventId,
          name: tt.name,
          description: tt.description || null,
          price: tt.price,
          quantity: tt.quantity,
          max_per_order: tt.max_per_order,
          is_active: true,
        }))

        const { error: ttError } = await supabase
          .from('ticket_types')
          .insert(ticketTypesData)

        if (ttError) throw ttError
      }

      const successMessage = publishStatus === 'published' 
        ? (isEditing ? 'Evento actualizado y publicado' : 'Evento creado y publicado')
        : (isEditing ? 'Evento actualizado como borrador' : 'Evento guardado como borrador')
      toast.success(successMessage)
      router.push('/organizer/events')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al guardar el evento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Informacion Basica
          </CardTitle>
          <CardDescription>
            Datos principales de tu evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo del evento *</Label>
            <Input
              id="title"
              placeholder="Nombre de tu evento"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Descripcion corta *</Label>
            <Textarea
              id="short_description"
              placeholder="Breve descripcion que aparecera en las tarjetas"
              rows={2}
              {...register('short_description')}
            />
            {errors.short_description && (
              <p className="text-sm text-destructive">{errors.short_description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion completa</Label>
            <Textarea
              id="description"
              placeholder="Descripcion detallada del evento"
              rows={5}
              {...register('description')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-destructive">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de imagen</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="image_url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="pl-10"
                  {...register('image_url')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Fecha y Hora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Inicio del evento *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Fin del evento</Label>
              <Input
                id="end_date"
                type="datetime-local"
                {...register('end_date')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doors_open">Apertura de puertas</Label>
            <Input
              id="doors_open"
              type="datetime-local"
              {...register('doors_open')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Ubicacion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue_name">Nombre del lugar *</Label>
              <Input
                id="venue_name"
                placeholder="Ej: Teatro Gran Rex"
                {...register('venue_name')}
              />
              {errors.venue_name && (
                <p className="text-sm text-destructive">{errors.venue_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                placeholder="Ej: Buenos Aires"
                {...register('city')}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_address">Direccion</Label>
            <Input
              id="venue_address"
              placeholder="Calle y numero"
              {...register('venue_address')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Tipos de Ticket
          </CardTitle>
          <CardDescription>
            Configura los diferentes tipos de entrada disponibles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 rounded-lg border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Ticket #{index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    placeholder="Ej: General, VIP, Early Bird"
                    {...register(`ticket_types.${index}.name`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descripcion</Label>
                  <Input
                    placeholder="Detalles del ticket"
                    {...register(`ticket_types.${index}.description`)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Precio ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register(`ticket_types.${index}.price`, { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cantidad *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="100"
                    {...register(`ticket_types.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max por orden</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="10"
                    {...register(`ticket_types.${index}.max_per_order`, { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: '', description: '', price: 0, quantity: 100, max_per_order: 10 })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar tipo de ticket
          </Button>
          {errors.ticket_types && (
            <p className="text-sm text-destructive">{errors.ticket_types.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuracion Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_capacity">Capacidad maxima</Label>
              <Input
                id="max_capacity"
                type="number"
                min="1"
                placeholder="1000"
                {...register('max_capacity', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age_restriction">Restriccion de edad</Label>
              <Input
                id="age_restriction"
                type="number"
                min="0"
                placeholder="18"
                {...register('age_restriction', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms_conditions">Terminos y condiciones</Label>
            <Textarea
              id="terms_conditions"
              placeholder="Condiciones especificas de tu evento"
              rows={4}
              {...register('terms_conditions')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="secondary"
          disabled={isLoading}
          onClick={() => setPublishStatus('draft')}
        >
          {isLoading && publishStatus === 'draft' ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Guardando...
            </>
          ) : (
            'Guardar como borrador'
          )}
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="glow-primary"
          onClick={() => setPublishStatus('published')}
        >
          {isLoading && publishStatus === 'published' ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Publicando...
            </>
          ) : (
            isEditing ? 'Guardar y publicar' : 'Crear y publicar'
          )}
        </Button>
      </div>
    </form>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { qr_code, event_id } = await request.json()

    if (!qr_code || !event_id) {
      return NextResponse.json({
        success: false,
        message: 'Codigo QR y evento son requeridos'
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user is authenticated and is organizer of this event
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No autorizado'
      }, { status: 401 })
    }

    // Check if user is organizer of this event
    const { data: event } = await supabase
      .from('events')
      .select('id, organizer_id, title')
      .eq('id', event_id)
      .single()

    if (!event || event.organizer_id !== user.id) {
      return NextResponse.json({
        success: false,
        message: 'No tienes permiso para validar tickets de este evento'
      }, { status: 403 })
    }

    // Find the ticket by QR code
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types(*),
        order:orders(
          *,
          event:events(*)
        )
      `)
      .eq('qr_code', qr_code)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({
        success: false,
        message: 'Ticket no encontrado'
      })
    }

    // Verify ticket belongs to the selected event
    if (ticket.order?.event_id !== event_id) {
      return NextResponse.json({
        success: false,
        message: 'Este ticket no pertenece al evento seleccionado',
        ticket: {
          id: ticket.id,
          qr_code: ticket.qr_code,
          status: ticket.status,
          attendee_name: ticket.order?.attendee_name || 'N/A',
          attendee_email: ticket.order?.attendee_email || 'N/A',
          ticket_type_name: ticket.ticket_type?.name || 'N/A',
          event_title: ticket.order?.event?.title || 'Otro evento'
        }
      })
    }

    // Check ticket status
    if (ticket.status === 'used') {
      return NextResponse.json({
        success: false,
        message: `Ticket ya utilizado (${ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleTimeString('es-AR') : ''})`,
        ticket: {
          id: ticket.id,
          qr_code: ticket.qr_code,
          status: ticket.status,
          attendee_name: ticket.order?.attendee_name || 'N/A',
          attendee_email: ticket.order?.attendee_email || 'N/A',
          ticket_type_name: ticket.ticket_type?.name || 'N/A',
          event_title: event.title,
          checked_in_at: ticket.checked_in_at
        }
      })
    }

    if (ticket.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        message: 'Ticket cancelado',
        ticket: {
          id: ticket.id,
          qr_code: ticket.qr_code,
          status: ticket.status,
          attendee_name: ticket.order?.attendee_name || 'N/A',
          attendee_email: ticket.order?.attendee_email || 'N/A',
          ticket_type_name: ticket.ticket_type?.name || 'N/A',
          event_title: event.title
        }
      })
    }

    if (ticket.status === 'transferred') {
      return NextResponse.json({
        success: false,
        message: 'Ticket transferido - usar el nuevo codigo',
        ticket: {
          id: ticket.id,
          qr_code: ticket.qr_code,
          status: ticket.status,
          attendee_name: ticket.order?.attendee_name || 'N/A',
          attendee_email: ticket.order?.attendee_email || 'N/A',
          ticket_type_name: ticket.ticket_type?.name || 'N/A',
          event_title: event.title
        }
      })
    }

    // Mark ticket as used (using admin client to bypass RLS)
    const now = new Date().toISOString()
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient
      .from('tickets')
      .update({
        status: 'used',
        checked_in_at: now,
        checked_in_by: user.id
      })
      .eq('id', ticket.id)

    if (updateError) {
      console.error('[v0] Error updating ticket:', updateError)
      return NextResponse.json({
        success: false,
        message: 'Error al registrar check-in'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in exitoso',
      ticket: {
        id: ticket.id,
        qr_code: ticket.qr_code,
        status: 'used',
        attendee_name: ticket.order?.attendee_name || 'N/A',
        attendee_email: ticket.order?.attendee_email || 'N/A',
        ticket_type_name: ticket.ticket_type?.name || 'N/A',
        event_title: event.title,
        checked_in_at: now
      }
    })

  } catch (error) {
    console.error('[v0] Validate ticket error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}

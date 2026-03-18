// EventAccess Types

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'user' | 'organizer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  image_url: string | null
  category_id: string | null
  venue_name: string | null
  venue_address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  start_date: string
  end_date: string | null
  doors_open: string | null
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  is_featured: boolean
  max_capacity: number | null
  age_restriction: number | null
  terms_conditions: string | null
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  organizer?: Profile
  ticket_types?: TicketType[]
}

export interface TicketType {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number
  quantity: number
  sold: number
  max_per_order: number
  sale_start: string | null
  sale_end: string | null
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  event_id: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  subtotal: number
  service_fee: number
  total: number
  payment_method: string | null
  payment_id: string | null
  attendee_name: string
  attendee_email: string
  attendee_phone: string | null
  created_at: string
  updated_at: string
  // Relations
  event?: Event
  tickets?: Ticket[]
}

export interface Ticket {
  id: string
  order_id: string
  ticket_type_id: string
  qr_code: string
  status: 'valid' | 'used' | 'cancelled' | 'transferred'
  checked_in_at: string | null
  checked_in_by: string | null
  created_at: string
  // Relations
  ticket_type?: TicketType
  order?: Order
}

// Form Types
export interface EventFormData {
  title: string
  description: string
  short_description: string
  image_url: string
  category_id: string
  venue_name: string
  venue_address: string
  city: string
  country: string
  start_date: string
  end_date: string
  doors_open: string
  max_capacity: number
  age_restriction: number
  terms_conditions: string
}

export interface TicketTypeFormData {
  name: string
  description: string
  price: number
  quantity: number
  max_per_order: number
  sale_start: string
  sale_end: string
}

export interface CheckoutFormData {
  attendee_name: string
  attendee_email: string
  attendee_phone: string
  tickets: {
    ticket_type_id: string
    quantity: number
  }[]
}

// Stats Types
export interface DashboardStats {
  totalEvents: number
  totalTicketsSold: number
  totalRevenue: number
  upcomingEvents: number
}

export interface AdminStats extends DashboardStats {
  totalUsers: number
  totalOrganizers: number
  pendingEvents: number
}

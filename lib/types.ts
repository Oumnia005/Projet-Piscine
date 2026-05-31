

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  avatar?: string
  role: 'client' | 'practitioner' | 'admin'
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at?: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  image?: string
  is_active: boolean
  sort_order: number
  services_count?: number
  created_at: string
}

export interface Service {
  id: number
  category_id: number
  name: string
  slug: string
  description?: string
  short_description?: string
  duration: number
  price: number
  price_promo?: number
  image?: string
  benefits?: string[]
  is_active: boolean
  is_featured: boolean
  max_participants: number
  category_name?: string
  category_slug?: string
  practitioners?: Practitioner[]
  reviews?: Review[]
  created_at: string
  updated_at?: string
}

export interface Practitioner {
  id: number
  user_id: number
  first_name: string
  last_name: string
  avatar?: string
  specialization?: string
  bio?: string
  experience_years: number
  certifications?: string[]
  is_available: boolean
  created_at: string
}

export interface Booking {
  id: number
  user_id: number
  service_id: number
  practitioner_id?: number
  time_slot_id?: number
  booking_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  total_price: number
  notes?: string
  cancellation_reason?: string
  service_name?: string
  service_image?: string
  service_description?: string
  practitioner_first_name?: string
  practitioner_last_name?: string
  practitioner_avatar?: string
  created_at: string
  updated_at?: string
}

export interface TimeSlot {
  start_time: string
  end_time: string
  is_available: boolean
}

export interface Activity {
  id: number
  name: string
  slug: string
  description?: string
  category_id?: number
  practitioner_id?: number
  schedule?: string
  duration?: number
  spots_available?: number
  date: string
  start_time: string
  end_time: string
  max_participants: number
  current_participants: number
  price: number
  location?: string
  image?: string
  level: 'debutant' | 'intermediaire' | 'avance' | 'tous'
  is_active: boolean
  category_name?: string
  instructor_first_name?: string
  instructor_last_name?: string
  instructor_avatar?: string
  instructor_bio?: string
  places_remaining?: number
  is_registered?: boolean
  created_at: string
}

export interface WellnessProgram {
  id: number
  name: string
  slug: string
  description?: string
  duration_weeks: number
  sessions_count: number
  price: number
  image?: string
  benefits?: string[]
  is_active: boolean
  is_enrolled?: boolean
  enrollment_status?: 'active' | 'completed' | 'paused' | 'cancelled'
  start_date?: string
  end_date?: string
  sessions_completed?: number
  progress_percent?: number
  created_at: string
}

export interface CartItem {
  id: number
  user_id: number
  item_type: 'service' | 'activity' | 'program'
  item_id: number
  time_slot_id?: number
  quantity: number
  price: number
  item_name?: string
  item_image?: string
  slot_date?: string
  slot_start_time?: string
  created_at: string
}

export interface Cart {
  items: CartItem[]
  total: number
  count: number
}

export interface Notification {
  id: number
  user_id: number
  type: 'booking' | 'reminder' | 'promotion' | 'system' | 'activity'
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: number
  user_id: number
  service_id?: number
  practitioner_id?: number
  booking_id?: number
  rating: number
  comment?: string
  is_approved: boolean
  first_name?: string
  last_name?: string
  created_at: string
}

export interface Payment {
  id: number
  user_id: number
  booking_id?: number
  amount: number
  payment_method: 'card' | 'cash' | 'transfer'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  created_at: string
}

export interface AdminStats {
  total_users: number
  new_users_this_month: number
  today_bookings: number
  week_bookings: number
  monthly_revenue: number
  popular_services: { name: string; bookings_count: number }[]
  upcoming_activities: {
    name: string
    date: string
    current_participants: number
    max_participants: number
  }[]
  bookings_by_status: { status: string; count: number }[]
}

export interface ApiResponse<T> {
  success?: boolean
  error?: string
  [key: string]: T | boolean | string | undefined
}

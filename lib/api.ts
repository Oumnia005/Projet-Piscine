



export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/vitacare/backend/api'

export const API_ENDPOINTS = {
  
  login: '/auth.php?action=login',
  register: '/auth.php?action=register',
  me: '/auth.php?action=me',
  logout: '/auth.php?action=logout',

  
  categories: '/categories.php?action=list',
  category: (slug: string) => `/categories.php?action=get&slug=${slug}`,

  
  services: '/services.php?action=list',
  service: (id: string) => `/services.php?action=get&id=${id}`,
  featuredServices: '/services.php?action=featured',
  servicesByCategory: (slug: string) => `/services.php?action=by-category&category=${slug}`,
  searchServices: (q: string) => `/services.php?action=search&q=${encodeURIComponent(q)}`,

  
  bookings: '/bookings.php?action=list',
  booking: (id: number) => `/bookings.php?action=get&id=${id}`,
  createBooking: '/bookings.php?action=create',
  cancelBooking: (id: number) => `/bookings.php?action=cancel&id=${id}`,
  availableSlots: (serviceId: number, date: string) => 
    `/bookings.php?action=available-slots&service_id=${serviceId}&date=${date}`,
  bookingHistory: '/bookings.php?action=history',
  upcomingBookings: '/bookings.php?action=list&upcoming=1',

  
  activities: '/activities.php?action=list',
  activity: (id: number) => `/activities.php?action=get&id=${id}`,
  upcomingActivities: '/activities.php?action=upcoming',
  registerActivity: '/activities.php?action=register',
  unregisterActivity: '/activities.php?action=unregister',
  myRegistrations: '/activities.php?action=my-registrations',

  
  programs: '/programs.php?action=list',
  program: (id: string) => `/programs.php?action=get&id=${id}`,
  enrollProgram: '/programs.php?action=enroll',
  myPrograms: '/programs.php?action=my-programs',

  
  cart: '/cart.php?action=get',
  addToCart: '/cart.php?action=add',
  removeFromCart: '/cart.php?action=remove',
  clearCart: '/cart.php?action=clear',
  checkout: '/cart.php?action=checkout',

  
  notifications: '/notifications.php?action=list',
  markRead: '/notifications.php?action=mark-read',
  markAllRead: '/notifications.php?action=mark-all-read',
  unreadCount: '/notifications.php?action=unread-count',

  
  adminStats: '/admin.php?action=stats',
  adminUsers: '/admin.php?action=users',
  adminBookings: '/admin.php?action=bookings',
  adminRevenue: (period: string) => `/admin.php?action=revenue&period=${period}`,
}


export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vitacare_token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue')
  }

  return data
}

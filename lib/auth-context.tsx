'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User } from '@/lib/types'
import { addAuditEvent, getStoredUsers, saveStoredUser, updateStoredPassword, updateStoredUser } from '@/lib/vitacare-store'

interface CartItem {
  slot_id?: string
  item_type?: 'service' | 'activity' | 'program'
  service_id: number
  service_name: string
  date: string
  time: string
  practitioner_id?: number
  practitioner_name?: string
  location?: string
  price: number
  duration: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, role?: User['role']) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  updateProfile: (data: Partial<User>) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (index: number) => void
  clearCart: () => void
}

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@vitacare.fr': {
    password: 'password',
    user: {
      id: 1,
      email: 'admin@vitacare.fr',
      first_name: 'Admin',
      last_name: 'VitaCare',
      phone: '0600000000',
      role: 'admin',
      is_active: true,
      email_verified: true,
      created_at: '2024-01-01T00:00:00Z',
    },
  },
  'client@vitacare.fr': {
    password: 'password',
    user: {
      id: 5,
      email: 'client@vitacare.fr',
      first_name: 'Pierre',
      last_name: 'Durand',
      phone: '0645678901',
      role: 'client',
      is_active: true,
      email_verified: true,
      created_at: '2024-01-15T00:00:00Z',
    },
  },
  'intervenant@vitacare.fr': {
    password: 'password',
    user: {
      id: 7,
      email: 'intervenant@vitacare.fr',
      first_name: 'Elise',
      last_name: 'Garnier',
      phone: '0611223344',
      role: 'practitioner',
      is_active: true,
      email_verified: true,
      created_at: '2024-01-08T00:00:00Z',
    },
  },
  'nutrition@vitacare.fr': {
    password: 'password',
    user: {
      id: 8,
      email: 'nutrition@vitacare.fr',
      first_name: 'Nadia',
      last_name: 'Rami',
      phone: '0612345678',
      role: 'practitioner',
      is_active: true,
      email_verified: true,
      created_at: '2024-01-08T00:00:00Z',
    },
  },
  'coach@vitacare.fr': {
    password: 'password',
    user: {
      id: 9,
      email: 'coach@vitacare.fr',
      first_name: 'Karim',
      last_name: 'Diallo',
      phone: '0698765432',
      role: 'practitioner',
      is_active: true,
      email_verified: true,
      created_at: '2024-01-08T00:00:00Z',
    },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    
    const storedToken = localStorage.getItem('vitacare_token')
    const storedUser = localStorage.getItem('vitacare_user')
    const storedCart = localStorage.getItem('vitacare_cart')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }

    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string, role?: User['role']) => {
    
    const storedUsers = getStoredUsers()
    const mockUser = storedUsers[email] || MOCK_USERS[email]
    
    if (!mockUser || mockUser.password !== password) {
      throw new Error('Email ou mot de passe incorrect')
    }

    if (role && mockUser.user.role !== role) {
      throw new Error('Ce compte ne correspond pas au role selectionne')
    }

    const mockToken = `mock_token_${Date.now()}`
    
    setToken(mockToken)
    setUser(mockUser.user)
    localStorage.setItem('vitacare_token', mockToken)
    localStorage.setItem('vitacare_user', JSON.stringify(mockUser.user))
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    
    const storedUsers = getStoredUsers()
    if (MOCK_USERS[data.email] || storedUsers[data.email]) {
      throw new Error('Cette adresse email est deja utilisee')
    }

    const newUser: User = {
      id: Date.now(),
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: 'client',
      is_active: true,
      email_verified: false,
      created_at: new Date().toISOString(),
    }

    const mockToken = `mock_token_${Date.now()}`

    setToken(mockToken)
    setUser(newUser)
    saveStoredUser({ password: data.password, user: newUser })
    addAuditEvent({
      userId: newUser.id,
      userName: `${newUser.first_name} ${newUser.last_name}`,
      type: 'user',
      label: 'Creation de compte patient',
    })
    localStorage.setItem('vitacare_token', mockToken)
    localStorage.setItem('vitacare_user', JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setCart([])
    localStorage.removeItem('vitacare_token')
    localStorage.removeItem('vitacare_user')
    localStorage.removeItem('vitacare_cart')
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('vitacare_user', JSON.stringify(updatedUser))
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return
    
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
    localStorage.setItem('vitacare_user', JSON.stringify(updatedUser))
    updateStoredUser(user.email, updatedUser)
    addAuditEvent({
      userId: updatedUser.id,
      userName: `${updatedUser.first_name} ${updatedUser.last_name}`,
      type: 'profile',
      label: 'Modification du profil',
    })
  }, [user])

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) return
    const storedUsers = getStoredUsers()
    const account = storedUsers[user.email] || MOCK_USERS[user.email]

    if (!account || account.password !== currentPassword) {
      throw new Error('Mot de passe actuel incorrect')
    }

    const updated = updateStoredPassword(user.email, newPassword, user)
    if (!updated) {
      throw new Error('Impossible de modifier le mot de passe')
    }
  }, [user])

  
  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const alreadyInCart = item.slot_id ? prev.some(cartItem => cartItem.slot_id === item.slot_id) : false
      const newCart = alreadyInCart ? prev : [...prev, item]
      localStorage.setItem('vitacare_cart', JSON.stringify(newCart))
      return newCart
    })
  }, [])

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => {
      const newCart = prev.filter((_, i) => i !== index)
      localStorage.setItem('vitacare_cart', JSON.stringify(newCart))
      return newCart
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    localStorage.removeItem('vitacare_cart')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
        updatePassword,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

"use client"

export type AppointmentStatus = "pending" | "accepted" | "refused" | "cancelled"

export interface VitaCareSlot {
  id: string
  serviceId: number
  serviceName: string
  practitionerId: number
  practitionerName: string
  date: string
  time: string
  capacity: number
  location: string
}

export interface VitaCareAppointment {
  id: string
  slotId: string
  serviceId: number
  serviceName: string
  patientId: number
  patientName: string
  practitionerId: number
  practitionerName: string
  date: string
  time: string
  status: AppointmentStatus
  price?: number
  paymentStatus?: "preauthorized" | "paid" | "released"
  paymentCardName?: string
  paymentCardLast4?: string
  paidAt?: string
}

export interface VitaCareNotification {
  id: string
  userId: number
  title: string
  message: string
  createdAt: string
  read: boolean
}

export interface StoredAccount {
  password: string
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone?: string
    role: "client" | "practitioner" | "admin"
    is_active: boolean
    email_verified: boolean
    created_at: string
    updated_at?: string
  }
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  userId?: number
  userRole?: string
  createdAt: string
  status: "new" | "read"
}

export interface ActivityRegistration {
  id: string
  activityId: number
  activityName: string
  userId: number
  userName: string
  status: "registered" | "cancelled"
  createdAt: string
}

export interface AuditEvent {
  id: string
  userId?: number
  userName?: string
  type: string
  label: string
  createdAt: string
}

export interface FavoriteService {
  serviceId: number
  userId: number
  createdAt: string
}

const slotsKey = "vitacare_slots"
const appointmentsKey = "vitacare_appointments"
const notificationsKey = "vitacare_notifications"
const usersKey = "vitacare_registered_users"
const contactsKey = "vitacare_contact_messages"
const activityRegistrationsKey = "vitacare_activity_registrations"
const auditKey = "vitacare_audit_events"
const favoritesKey = "vitacare_favorite_services"
const deletedServicesKey = "vitacare_deleted_services"

function isPastSlot(date: string, time: string) {
  if (!date || !time || date === "Date a definir") return false
  return new Date(`${date}T${time.length === 5 ? time : time.slice(0, 5)}`) < new Date()
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStoredUsers() {
  return read<Record<string, StoredAccount>>(usersKey, {})
}

export function saveStoredUser(account: StoredAccount) {
  const users = getStoredUsers()
  users[account.user.email] = account
  write(usersKey, users)
  return account
}

export function updateStoredUser(email: string, user: StoredAccount["user"]) {
  const users = getStoredUsers()
  const previous = users[email] || users[user.email]
  if (users[email]) {
    delete users[email]
  }
  users[user.email] = { password: previous?.password || "password", user }
  write(usersKey, users)
}

export function updateStoredPassword(email: string, password: string, fallbackUser?: StoredAccount["user"]) {
  const users = getStoredUsers()
  const previous = users[email]
  if (!previous && !fallbackUser) return false
  users[email] = { password, user: previous?.user || fallbackUser! }
  write(usersKey, users)
  addAuditEvent({
    userId: users[email].user.id,
    userName: `${users[email].user.first_name} ${users[email].user.last_name}`,
    type: "profile",
    label: "Modification du mot de passe",
  })
  return true
}

export function updateStoredUserRole(email: string, role: StoredAccount["user"]["role"]) {
  const users = getStoredUsers()
  if (!users[email]) return
  users[email] = { ...users[email], user: { ...users[email].user, role, updated_at: new Date().toISOString() } }
  write(usersKey, users)
  addAuditEvent({
    userId: users[email].user.id,
    userName: `${users[email].user.first_name} ${users[email].user.last_name}`,
    type: "role",
    label: `Role modifie en ${role}`,
  })
}

export function addAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">) {
  const events = read<AuditEvent[]>(auditKey, [])
  const newEvent = { ...event, id: `audit_${Date.now()}`, createdAt: new Date().toISOString() }
  write(auditKey, [newEvent, ...events])
  return newEvent
}

export function getAuditEvents() {
  return read<AuditEvent[]>(auditKey, [])
}

export function getSlots() {
  const slots = read<VitaCareSlot[]>(slotsKey, [])
  const cleaned = slots.filter((slot) => !isPastSlot(slot.date, slot.time))
  if (cleaned.length !== slots.length) write(slotsKey, cleaned)
  return cleaned
}

export function saveSlot(slot: Omit<VitaCareSlot, "id">) {
  if (isPastSlot(slot.date, slot.time)) {
    throw new Error("Impossible de creer un creneau dans le passe")
  }
  const slots = getSlots()
  const newSlot = { ...slot, id: `slot_${Date.now()}` }
  write(slotsKey, [...slots, newSlot])
  addAuditEvent({
    userId: slot.practitionerId,
    userName: slot.practitionerName,
    type: "availability",
    label: `Disponibilite ajoutee pour ${slot.serviceName}`,
  })
  return newSlot
}

export function getAppointments() {
  return read<VitaCareAppointment[]>(appointmentsKey, [])
}

export function saveAppointment(appointment: Omit<VitaCareAppointment, "id" | "status">) {
  if (isPastSlot(appointment.date, appointment.time)) {
    throw new Error("Ce creneau n'est plus disponible")
  }

  const appointments = getAppointments()
  const newAppointment: VitaCareAppointment = {
    ...appointment,
    id: `rdv_${Date.now()}`,
    status: "pending",
  }
  write(appointmentsKey, [...appointments, newAppointment])
  saveNotification({
    userId: appointment.patientId,
    title: "Demande envoyee a l'intervenant",
    message: `Votre demande pour ${appointment.serviceName} a ete transmise a ${appointment.practitionerName}. Le paiement sera debite uniquement si elle est acceptee.`,
  })
  saveNotification({
    userId: appointment.practitionerId,
    title: "Nouvelle demande de rendez-vous",
    message: `${appointment.patientName} demande ${appointment.serviceName} le ${appointment.date} a ${appointment.time}.`,
  })
  addAuditEvent({
    userId: appointment.patientId,
    userName: appointment.patientName,
    type: "booking",
    label: `Demande de reservation pour ${appointment.serviceName}`,
  })
  return newAppointment
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const appointments = getAppointments()
  const updated = appointments.map((appointment) =>
    appointment.id === id
      ? {
          ...appointment,
          status,
          paymentStatus:
            status === "accepted"
              ? ("paid" as const)
              : status === "refused" || status === "cancelled"
                ? ("released" as const)
                : appointment.paymentStatus,
          paidAt: status === "accepted" ? new Date().toISOString() : appointment.paidAt,
        }
      : appointment
  )
  write(appointmentsKey, updated)
  const appointment = updated.find((item) => item.id === id)
  if (appointment) {
    if (status === "accepted") {
      saveNotification({
        userId: appointment.patientId,
        title: "Rendez-vous accepte et paiement valide",
        message: `${appointment.practitionerName} a accepte ${appointment.serviceName}. Votre carte se terminant par ${appointment.paymentCardLast4 || "****"} est maintenant debitee de ${appointment.price || 0} €.`,
      })
    }
    if (status === "refused") {
      saveNotification({
        userId: appointment.patientId,
        title: "Rendez-vous refuse",
        message: `${appointment.practitionerName} a refuse votre demande pour ${appointment.serviceName}. Aucun debit n'a ete effectue.`,
      })
    }
    if (status === "cancelled") {
      saveNotification({
        userId: appointment.patientId,
        title: "Rendez-vous annule",
        message: `Votre demande pour ${appointment.serviceName} a ete annulee. Aucun debit n'a ete effectue si elle n'etait pas acceptee.`,
      })
    }
    addAuditEvent({
      userId: appointment.patientId,
      userName: appointment.patientName,
      type: "booking",
      label: `Reservation ${status} pour ${appointment.serviceName}`,
    })
  }
  return appointment
}

export function updateAppointment(id: string, changes: Partial<Pick<VitaCareAppointment, "slotId" | "date" | "time" | "practitionerId" | "practitionerName">>) {
  const appointments = getAppointments()
  const updated = appointments.map((appointment) =>
    appointment.id === id ? { ...appointment, ...changes, status: "pending" as AppointmentStatus } : appointment
  )
  write(appointmentsKey, updated)
  const appointment = updated.find((item) => item.id === id)
  if (appointment) {
    saveNotification({
      userId: appointment.patientId,
      title: "Modification envoyee",
      message: `Votre demande de modification pour ${appointment.serviceName} est en attente de validation.`,
    })
    saveNotification({
      userId: appointment.practitionerId,
      title: "Modification de rendez-vous demandee",
      message: `${appointment.patientName} demande un nouveau creneau pour ${appointment.serviceName}: ${appointment.date} a ${appointment.time}.`,
    })
    addAuditEvent({
      userId: appointment.patientId,
      userName: appointment.patientName,
      type: "booking",
      label: `Modification demandee pour ${appointment.serviceName}`,
    })
  }
}

export function getNotifications() {
  return read<VitaCareNotification[]>(notificationsKey, [])
}

export function saveNotification(notification: Omit<VitaCareNotification, "id" | "createdAt" | "read">) {
  const notifications = getNotifications()
  const newNotification: VitaCareNotification = {
    ...notification,
    id: `notif_${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  }
  write(notificationsKey, [newNotification, ...notifications])
  return newNotification
}

export function markNotificationRead(id: string) {
  const notifications = getNotifications().map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification
  )
  write(notificationsKey, notifications)
}

export function markAllNotificationsRead(userId: number) {
  const notifications = getNotifications().map((notification) =>
    notification.userId === userId ? { ...notification, read: true } : notification
  )
  write(notificationsKey, notifications)
}

export function getContactMessages() {
  return read<ContactMessage[]>(contactsKey, [])
}

export function saveContactMessage(message: Omit<ContactMessage, "id" | "createdAt" | "status">) {
  const messages = getContactMessages()
  const newMessage: ContactMessage = {
    ...message,
    id: `contact_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "new",
  }
  write(contactsKey, [newMessage, ...messages])
  addAuditEvent({
    userId: message.userId,
    userName: message.name,
    type: "contact",
    label: `Message contact: ${message.subject}`,
  })
  return newMessage
}

export function getActivityRegistrations() {
  return read<ActivityRegistration[]>(activityRegistrationsKey, [])
}

export function registerActivity(activity: { id: number; name: string; max_participants: number }, user: { id: number; first_name: string; last_name: string }) {
  const registrations = getActivityRegistrations()
  const activeRegistrations = registrations.filter((item) => item.activityId === activity.id && item.status === "registered")
  if (activeRegistrations.length >= activity.max_participants) {
    throw new Error("Activite complete")
  }

  const existing = registrations.find((item) => item.activityId === activity.id && item.userId === user.id)
  if (existing?.status === "registered") {
    throw new Error("Vous etes deja inscrit")
  }

  const next: ActivityRegistration = {
    id: existing?.id || `act_${Date.now()}`,
    activityId: activity.id,
    activityName: activity.name,
    userId: user.id,
    userName: `${user.first_name} ${user.last_name}`,
    status: "registered",
    createdAt: new Date().toISOString(),
  }
  const updated = existing ? registrations.map((item) => (item.id === existing.id ? next : item)) : [next, ...registrations]
  write(activityRegistrationsKey, updated)
  saveNotification({
    userId: user.id,
    title: "Inscription confirmee",
    message: `Votre inscription a ${activity.name} est confirmee.`,
  })
  addAuditEvent({
    userId: user.id,
    userName: `${user.first_name} ${user.last_name}`,
    type: "activity",
    label: `Inscription a ${activity.name}`,
  })
}

export function unregisterActivity(activityId: number, userId: number) {
  const registrations = getActivityRegistrations()
  const updated = registrations.map((item) =>
    item.activityId === activityId && item.userId === userId ? { ...item, status: "cancelled" as const } : item
  )
  write(activityRegistrationsKey, updated)
}

export function getFavoriteServices() {
  return read<FavoriteService[]>(favoritesKey, [])
}

export function isFavoriteService(userId: number, serviceId: number) {
  return getFavoriteServices().some((favorite) => favorite.userId === userId && favorite.serviceId === serviceId)
}

export function toggleFavoriteService(userId: number, serviceId: number) {
  const favorites = getFavoriteServices()
  const exists = favorites.some((favorite) => favorite.userId === userId && favorite.serviceId === serviceId)
  const updated = exists
    ? favorites.filter((favorite) => !(favorite.userId === userId && favorite.serviceId === serviceId))
    : [{ userId, serviceId, createdAt: new Date().toISOString() }, ...favorites]
  write(favoritesKey, updated)
  return !exists
}

export function getDeletedServiceIds() {
  return read<number[]>(deletedServicesKey, [])
}

export function isServiceDeleted(serviceId: number) {
  return getDeletedServiceIds().includes(serviceId)
}

export function deleteService(serviceId: number, actorName: string) {
  const deleted = getDeletedServiceIds()
  if (!deleted.includes(serviceId)) {
    write(deletedServicesKey, [...deleted, serviceId])
  }
  const remainingSlots = getSlots().filter((slot) => slot.serviceId !== serviceId)
  write(slotsKey, remainingSlots)
  addAuditEvent({
    type: "service",
    label: `Service ${serviceId} supprime par ${actorName}`,
  })
}

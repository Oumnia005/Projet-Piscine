import { mockActivities, mockPrograms, mockServices } from "@/lib/mock-data"

export const practitionerAccounts = [
  {
    userId: 7,
    email: "intervenant@vitacare.fr",
    name: "Elise Garnier",
    specialty: "Nutritionniste",
    serviceIds: [1, 2, 3, 4],
    activityIds: [4],
    programIds: [1],
  },
  {
    userId: 8,
    email: "nutrition@vitacare.fr",
    name: "Nadia Rami",
    specialty: "Psychologue",
    serviceIds: [5],
    activityIds: [2],
    programIds: [2],
  },
  {
    userId: 9,
    email: "coach@vitacare.fr",
    name: "Karim Diallo",
    specialty: "Coach bien-etre",
    serviceIds: [6, 7, 8, 9, 10],
    activityIds: [1, 3],
    programIds: [3],
  },
]

export function getPractitionerForService(serviceId: number) {
  return practitionerAccounts.find((practitioner) => practitioner.serviceIds.includes(serviceId))
}

export function getPractitionerByUserId(userId: number) {
  return practitionerAccounts.find((practitioner) => practitioner.userId === userId)
}

export function getServicesForPractitioner(userId: number) {
  const practitioner = getPractitionerByUserId(userId)
  if (!practitioner) return []
  return mockServices.filter((service) => practitioner.serviceIds.includes(service.id))
}

export function getPractitionerForActivity(activityId: number) {
  return practitionerAccounts.find((practitioner) => practitioner.activityIds.includes(activityId))
}

export function getPractitionerForProgram(programId: number) {
  return practitionerAccounts.find((practitioner) => practitioner.programIds.includes(programId))
}

export function getActivitiesForPractitioner(userId: number) {
  const practitioner = getPractitionerByUserId(userId)
  if (!practitioner) return []
  return mockActivities.filter((activity) => practitioner.activityIds.includes(activity.id))
}

export function getProgramsForPractitioner(userId: number) {
  const practitioner = getPractitionerByUserId(userId)
  if (!practitioner) return []
  return mockPrograms.filter((program) => practitioner.programIds.includes(program.id))
}

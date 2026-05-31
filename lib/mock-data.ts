


import type { Category, Service, Activity, WellnessProgram, Notification, Booking, User } from './types'

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Consultations',
    slug: 'consultations',
    description: 'Rendez-vous avec des professionnels de sante',
    icon: 'stethoscope',
    sort_order: 1,
    is_active: true,
    services_count: 3,
    created_at: '2024-01-01',
  },
  {
    id: 2,
    name: 'Therapies',
    slug: 'therapies',
    description: 'Accompagnement therapeutique et rehabilitation',
    icon: 'activity',
    sort_order: 2,
    is_active: true,
    services_count: 2,
    created_at: '2024-01-01',
  },
  {
    id: 3,
    name: 'Bien-etre',
    slug: 'bien-etre',
    description: 'Activites pour l equilibre physique et mental',
    icon: 'leaf',
    sort_order: 3,
    is_active: true,
    services_count: 2,
    created_at: '2024-01-01',
  },
  {
    id: 4,
    name: 'Nutrition',
    slug: 'nutrition',
    description: 'Conseils alimentaires et suivi personnalise',
    icon: 'apple',
    sort_order: 4,
    is_active: true,
    services_count: 2,
    created_at: '2024-01-01',
  },
  {
    id: 5,
    name: 'Sante mentale',
    slug: 'sante-mentale',
    description: 'Soutien psychologique et gestion du stress',
    icon: 'brain',
    sort_order: 5,
    is_active: true,
    services_count: 1,
    created_at: '2024-01-01',
  },
]

export const mockServices: Service[] = [
  {
    id: 1,
    category_id: 1,
    name: 'Consultation generale',
    slug: 'consultation-generale',
    description: 'Rendez-vous medical de premiere intention pour faire le point sur vos symptomes, obtenir des conseils et etre oriente vers le bon parcours de soin.',
    short_description: 'Bilan medical avec un medecin generaliste',
    duration: 30,
    price: 45,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800',
    benefits: ['Evaluation rapide', 'Orientation personnalisee', 'Compte rendu', 'Suivi possible'],
    is_active: true,
    is_featured: true,
    max_participants: 1,
    category_name: 'Consultations',
    category_slug: 'consultations',
    created_at: '2024-01-01',
  },
  {
    id: 2,
    category_id: 2,
    name: 'Seance d osteopathie',
    slug: 'osteopathie',
    description: 'Seance manuelle pour soulager les tensions, ameliorer la mobilite et accompagner les douleurs fonctionnelles du quotidien.',
    short_description: 'Therapie manuelle et mobilite',
    duration: 45,
    price: 70,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    benefits: ['Mobilite', 'Soulagement tensions', 'Conseils posturaux', 'Approche globale'],
    is_active: true,
    is_featured: true,
    max_participants: 1,
    category_name: 'Therapies',
    category_slug: 'therapies',
    created_at: '2024-01-01',
  },
  {
    id: 3,
    category_id: 2,
    name: 'Physiotherapie',
    slug: 'physiotherapie',
    description: 'Seance de rehabilitation avec exercices guides pour recuperer apres une blessure, une douleur chronique ou une operation.',
    short_description: 'Reeducation et reprise progressive',
    duration: 60,
    price: 55,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    benefits: ['Reeducation', 'Renforcement', 'Mobilite', 'Prevention recidive'],
    is_active: true,
    is_featured: false,
    max_participants: 1,
    category_name: 'Therapies',
    category_slug: 'therapies',
    created_at: '2024-01-01',
  },
  {
    id: 4,
    category_id: 4,
    name: 'Consultation nutrition',
    slug: 'consultation-nutrition',
    description: 'Bilan alimentaire et recommandations concretes pour construire une routine adaptee a votre sante, vos contraintes et vos objectifs.',
    short_description: 'Bilan et plan nutritionnel',
    duration: 60,
    price: 60,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    benefits: ['Bilan alimentaire', 'Objectifs realistes', 'Plan personnalise', 'Suivi'],
    is_active: true,
    is_featured: true,
    max_participants: 1,
    category_name: 'Nutrition',
    category_slug: 'nutrition',
    created_at: '2024-01-01',
  },
  {
    id: 5,
    category_id: 5,
    name: 'Soutien psychologique',
    slug: 'soutien-psychologique',
    description: 'Entretien avec un professionnel pour parler, comprendre une situation difficile et repartir avec des pistes d accompagnement.',
    short_description: 'Ecoute et accompagnement',
    duration: 60,
    price: 65,
    image: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800',
    benefits: ['Ecoute', 'Gestion emotions', 'Orientation', 'Soutien'],
    is_active: true,
    is_featured: false,
    max_participants: 1,
    category_name: 'Sante mentale',
    category_slug: 'sante-mentale',
    created_at: '2024-01-01',
  },
  {
    id: 6,
    category_id: 3,
    name: 'Yoga et relaxation',
    slug: 'yoga-relaxation',
    description: 'Cours collectif pour travailler la respiration, la mobilite douce et la relaxation. Adapte aux debutants comme aux profils plus avances.',
    short_description: 'Cours collectif de relaxation',
    duration: 60,
    price: 20,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    benefits: ['Souplesse', 'Force interieure', 'Calme mental', 'Equilibre'],
    is_active: true,
    is_featured: true,
    max_participants: 15,
    category_name: 'Bien-etre',
    category_slug: 'bien-etre',
    created_at: '2024-01-01',
  },
  {
    id: 7,
    category_id: 3,
    name: 'Meditation Guidee',
    slug: 'meditation-guidee',
    description: 'Seance de meditation pour apaiser le mental et developper la pleine conscience. Techniques de respiration et visualisation guidee.',
    short_description: 'Paix interieure et concentration',
    duration: 45,
    price: 20,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    benefits: ['Paix interieure', 'Concentration', 'Reduction anxiete', 'Clarte mentale'],
    is_active: true,
    is_featured: false,
    max_participants: 20,
    category_name: 'Yoga & Meditation',
    category_slug: 'yoga-meditation',
    created_at: '2024-01-01',
  },
  {
    id: 8,
    category_id: 4,
    name: 'Bain Thermal',
    slug: 'bain-thermal',
    description: 'Immersion dans nos bains aux eaux thermales enrichies en mineraux. Detente absolue dans un cadre zen et apaisant.',
    short_description: 'Detente et bien-etre aquatique',
    duration: 60,
    price: 45,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    benefits: ['Detente totale', 'Peau douce', 'Elimination toxines', 'Apaisement'],
    is_active: true,
    is_featured: true,
    max_participants: 1,
    category_name: 'Relaxation',
    category_slug: 'relaxation',
    created_at: '2024-01-01',
  },
  {
    id: 9,
    category_id: 4,
    name: 'Sauna & Hammam',
    slug: 'sauna-hammam',
    description: 'Acces au sauna finlandais et hammam oriental pour une purification complete. Alternance chaud/froid pour stimuler la circulation.',
    short_description: 'Purification et detoxification',
    duration: 90,
    price: 35,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    benefits: ['Detoxification', 'Peau purifiee', 'Relaxation musculaire', 'Systeme immunitaire'],
    is_active: true,
    is_featured: false,
    max_participants: 10,
    category_name: 'Relaxation',
    category_slug: 'relaxation',
    created_at: '2024-01-01',
  },
  {
    id: 10,
    category_id: 5,
    name: 'Coaching Personnel',
    slug: 'coaching-personnel',
    description: 'Seance individuelle avec un coach certifie pour atteindre vos objectifs. Programme personnalise et suivi regulier.',
    short_description: 'Accompagnement sur mesure',
    duration: 60,
    price: 55,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    benefits: ['Objectifs atteints', 'Motivation', 'Technique amelioree', 'Resultats durables'],
    is_active: true,
    is_featured: false,
    max_participants: 1,
    category_name: 'Fitness & Coaching',
    category_slug: 'fitness',
    created_at: '2024-01-01',
  },
]


const getUpcomingDate = (daysFromNow: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

export const mockActivities: Activity[] = [
  {
    id: 1,
    name: 'Yoga Matinal',
    slug: 'yoga-matinal',
    description:
      'Commencez la journee en douceur avec une seance de yoga energisante. Postures douces et respiration pour bien demarrer.',

    category_id: 3,
    practitioner_id: 2,

    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',

    schedule: 'Lundi - 08:00',
    duration: 60,
    spots_available: 4,

    date: getUpcomingDate(1),
    start_time: '08:00:00',
    end_time: '09:00:00',

    max_participants: 12,
    current_participants: 8,

    price: 20,
    location: 'Salle Zen',
    level: 'tous',

    is_active: true,

    category_name: 'Yoga & Meditation',

    instructor_first_name: 'Jean',
    instructor_last_name: 'Martin',

    places_remaining: 4,

    created_at: '2024-01-01',
  },

  {
    id: 2,
    name: 'Atelier Meditation Pleine Conscience',
    slug: 'atelier-meditation',

    description:
      'Apprenez les bases de la meditation mindfulness. Seance guidee pour debutants souhaitant decouvrir la meditation.',

    category_id: 3,
    practitioner_id: 2,

    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',

    schedule: 'Mardi - 18:00',
    duration: 90,
    spots_available: 10,

    date: getUpcomingDate(2),
    start_time: '18:00:00',
    end_time: '19:30:00',

    max_participants: 15,
    current_participants: 5,

    price: 25,
    location: 'Salle Serenite',
    level: 'debutant',

    is_active: true,

    category_name: 'Yoga & Meditation',

    instructor_first_name: 'Jean',
    instructor_last_name: 'Martin',

    places_remaining: 10,

    created_at: '2024-01-01',
  },

  {
    id: 3,
    name: 'Yoga Vinyasa Flow',
    slug: 'yoga-vinyasa',

    description:
      'Seance dynamique enchainant les postures en fluidite. Parfait pour ceux qui recherchent une pratique plus intense.',

    category_id: 3,
    practitioner_id: 2,

    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',

    schedule: 'Mercredi - 10:00',
    duration: 75,
    spots_available: 3,

    date: getUpcomingDate(3),
    start_time: '10:00:00',
    end_time: '11:15:00',

    max_participants: 10,
    current_participants: 7,

    price: 22,
    location: 'Salle Zen',
    level: 'intermediaire',

    is_active: true,

    category_name: 'Yoga & Meditation',

    instructor_first_name: 'Jean',
    instructor_last_name: 'Martin',

    places_remaining: 3,

    created_at: '2024-01-01',
  },

  {
    id: 4,
    name: 'Initiation Auto-massage',
    slug: 'initiation-automassage',

    description:
      'Apprenez les techniques pour vous masser vous-meme et soulager vos tensions au quotidien.',

    category_id: 1,
    practitioner_id: 1,

    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800',

    schedule: 'Jeudi - 14:00',
    duration: 120,
    spots_available: 5,

    date: getUpcomingDate(4),
    start_time: '14:00:00',
    end_time: '16:00:00',

    max_participants: 8,
    current_participants: 3,

    price: 35,
    location: 'Salle Harmonie',
    level: 'tous',

    is_active: true,

    category_name: 'Massages',

    instructor_first_name: 'Marie',
    instructor_last_name: 'Dupont',

    places_remaining: 5,

    created_at: '2024-01-01',
  },
]

export const mockPrograms: WellnessProgram[] = [
  {
    id: 1,
    name: 'Detox & Revitalisation',
    slug: 'detox-revitalisation',
    description: 'Programme complet de 4 semaines pour purifier votre corps et retrouver votre vitalite. Combine massages drainants, seances de sauna et conseils nutritionnels.',
    duration_weeks: 4,
    sessions_count: 8,
    price: 350,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    benefits: ['Elimination des toxines', 'Regain d\'energie', 'Amelioration du sommeil', 'Perte de poids'],
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: 2,
    name: 'Anti-Stress Intensif',
    slug: 'anti-stress-intensif',
    description: 'Programme de 6 semaines combinant massages, yoga et meditation pour vaincre le stress. Accompagnement personnalise par nos experts.',
    duration_weeks: 6,
    sessions_count: 12,
    price: 480,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    benefits: ['Reduction du stress', 'Meilleure gestion des emotions', 'Relaxation profonde', 'Equilibre retrouve'],
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: 3,
    name: 'Remise en Forme',
    slug: 'remise-en-forme',
    description: 'Programme sportif de 8 semaines avec coaching personnalise et suivi nutritionnel. Objectif: retrouver forme et vitalite.',
    duration_weeks: 8,
    sessions_count: 16,
    price: 550,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    benefits: ['Tonification musculaire', 'Endurance amelioree', 'Conseils nutrition', 'Motivation garantie'],
    is_active: true,
    created_at: '2024-01-01',
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 5,
    type: 'system',
    title: 'Bienvenue chez VitaCare!',
    message: 'Decouvrez nos services de bien-etre et reservez votre premiere seance.',
    link: '/services',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 5,
    type: 'promotion',
    title: 'Offre speciale -20%',
    message: 'Profitez de 20% de reduction sur tous les massages cette semaine!',
    link: '/services?category=massages',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    user_id: 5,
    type: 'reminder',
    title: 'Rappel de rendez-vous',
    message: 'N\'oubliez pas votre seance de yoga demain a 10h00.',
    link: '/dashboard/bookings',
    is_read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

export const mockUsers: User[] = [
  {
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
  {
    id: 5,
    email: 'client@vitacare.fr',
    first_name: 'Julie',
    last_name: 'Martin',
    phone: '0645678901',
    role: 'client',
    is_active: true,
    email_verified: true,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 6,
    email: 'nora@example.fr',
    first_name: 'Nora',
    last_name: 'Benali',
    phone: '0678123456',
    role: 'client',
    is_active: true,
    email_verified: true,
    created_at: '2024-02-11T00:00:00Z',
  },
  {
    id: 7,
    email: 'elise@vitacare.fr',
    first_name: 'Elise',
    last_name: 'Garnier',
    phone: '0611223344',
    role: 'practitioner',
    is_active: true,
    email_verified: true,
    created_at: '2024-01-08T00:00:00Z',
  },
]


export interface Practitioner {
  id: number
  name: string
  specialty: string
  avatar: string
  bio: string
  services: number[]
  is_active: boolean
}

export const mockPractitioners: Practitioner[] = [
  {
    id: 1,
    name: 'Sarah Martin',
    specialty: 'Medecin generaliste',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Medecin generaliste, specialisee dans le suivi preventif et l orientation des patients.',
    services: [1],
    is_active: true,
  },
  {
    id: 2,
    name: 'Thomas Lefevre',
    specialty: 'Osteopathe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Osteopathe diplome, accompagne les douleurs fonctionnelles et la mobilite.',
    services: [2, 3],
    is_active: true,
  },
  {
    id: 3,
    name: 'Elise Garnier',
    specialty: 'Nutritionniste',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Nutritionniste specialisee dans les plans alimentaires simples et durables.',
    services: [4],
    is_active: true,
  },
  {
    id: 4,
    name: 'Claire Bernard',
    specialty: 'Psychologue',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Psychologue clinicienne, accompagne la gestion du stress et des emotions.',
    services: [5, 6],
    is_active: true,
  },
]

export const mockBookings: Booking[] = [
  {
    id: 1,
    user_id: 5,
    service_id: 1,
    booking_date: getUpcomingDate(2),
    start_time: '10:00:00',
    end_time: '11:00:00',
    status: 'confirmed',
    total_price: 75,
    service_name: 'Massage Relaxant',
    service_image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    practitioner_first_name: 'Marie',
    practitioner_last_name: 'Dupont',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 5,
    service_id: 6,
    booking_date: getUpcomingDate(5),
    start_time: '08:00:00',
    end_time: '09:15:00',
    status: 'confirmed',
    total_price: 25,
    service_name: 'Seance de Yoga Hatha',
    service_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    practitioner_first_name: 'Jean',
    practitioner_last_name: 'Martin',
    created_at: new Date().toISOString(),
  },
]

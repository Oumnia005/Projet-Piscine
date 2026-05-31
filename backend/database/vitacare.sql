-- =====================================================
-- VitaCare - Base de donnees MySQL
-- Centre de Bien-etre et Spa
-- A importer dans phpMyAdmin (MAMP)
-- =====================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `vitacare` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vitacare`;

-- =====================================================
-- Table: users (Utilisateurs)
-- =====================================================
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `avatar` VARCHAR(255),
  `role` ENUM('client', 'practitioner', 'admin') DEFAULT 'client',
  `is_active` BOOLEAN DEFAULT TRUE,
  `email_verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: categories (Categories de services)
-- =====================================================
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `icon` VARCHAR(50),
  `image` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: services (Services/Prestations)
-- =====================================================
CREATE TABLE `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `description` TEXT,
  `short_description` VARCHAR(500),
  `duration` INT NOT NULL COMMENT 'Duree en minutes',
  `price` DECIMAL(10,2) NOT NULL,
  `price_promo` DECIMAL(10,2),
  `image` VARCHAR(255),
  `benefits` JSON,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `max_participants` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: practitioners (Praticiens)
-- =====================================================
CREATE TABLE `practitioners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `specialization` VARCHAR(200),
  `bio` TEXT,
  `experience_years` INT DEFAULT 0,
  `certifications` JSON,
  `is_available` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: practitioner_services (Liaison praticien-services)
-- =====================================================
CREATE TABLE `practitioner_services` (
  `practitioner_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  PRIMARY KEY (`practitioner_id`, `service_id`),
  FOREIGN KEY (`practitioner_id`) REFERENCES `practitioners`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: time_slots (Creneaux horaires disponibles)
-- =====================================================
CREATE TABLE `time_slots` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `practitioner_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_available` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`practitioner_id`) REFERENCES `practitioners`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_slot` (`practitioner_id`, `date`, `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: bookings (Reservations)
-- =====================================================
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `practitioner_id` INT,
  `time_slot_id` INT,
  `booking_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'pending',
  `total_price` DECIMAL(10,2) NOT NULL,
  `notes` TEXT,
  `cancellation_reason` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`practitioner_id`) REFERENCES `practitioners`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: activities (Activites/Ateliers collectifs)
-- =====================================================
CREATE TABLE `activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `description` TEXT,
  `category_id` INT,
  `practitioner_id` INT,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `max_participants` INT NOT NULL DEFAULT 10,
  `current_participants` INT DEFAULT 0,
  `price` DECIMAL(10,2) NOT NULL,
  `location` VARCHAR(200),
  `image` VARCHAR(255),
  `level` ENUM('debutant', 'intermediaire', 'avance', 'tous') DEFAULT 'tous',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`practitioner_id`) REFERENCES `practitioners`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: activity_registrations (Inscriptions aux activites)
-- =====================================================
CREATE TABLE `activity_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `activity_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `status` ENUM('registered', 'cancelled', 'attended', 'no_show') DEFAULT 'registered',
  `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_registration` (`activity_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: wellness_programs (Programmes de bien-etre)
-- =====================================================
CREATE TABLE `wellness_programs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `description` TEXT,
  `duration_weeks` INT NOT NULL,
  `sessions_count` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `image` VARCHAR(255),
  `benefits` JSON,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: program_enrollments (Inscriptions aux programmes)
-- =====================================================
CREATE TABLE `program_enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `program_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE,
  `sessions_completed` INT DEFAULT 0,
  `status` ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`program_id`) REFERENCES `wellness_programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: cart (Panier)
-- =====================================================
CREATE TABLE `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `item_type` ENUM('service', 'activity', 'program') NOT NULL,
  `item_id` INT NOT NULL,
  `time_slot_id` INT,
  `quantity` INT DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: payments (Paiements - simulation)
-- =====================================================
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `booking_id` INT,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('card', 'cash', 'transfer') DEFAULT 'card',
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  `transaction_id` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: notifications
-- =====================================================
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` ENUM('booking', 'reminder', 'promotion', 'system', 'activity') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(255),
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: reviews (Avis clients)
-- =====================================================
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `service_id` INT,
  `practitioner_id` INT,
  `booking_id` INT,
  `rating` TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `is_approved` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`practitioner_id`) REFERENCES `practitioners`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: favorites (Favoris)
-- =====================================================
CREATE TABLE `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_favorite` (`user_id`, `service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DONNEES DE DEMONSTRATION
-- =====================================================

-- Utilisateur admin
INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`, `phone`, `role`, `is_active`, `email_verified`) VALUES
('admin@vitacare.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'VitaCare', '0600000000', 'admin', TRUE, TRUE),
('marie.dupont@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Dupont', '0612345678', 'practitioner', TRUE, TRUE),
('jean.martin@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean', 'Martin', '0623456789', 'practitioner', TRUE, TRUE),
('sophie.bernard@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophie', 'Bernard', '0634567890', 'practitioner', TRUE, TRUE),
('client@vitacare.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pierre', 'Durand', '0645678901', 'client', TRUE, TRUE);

-- Categories
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `sort_order`) VALUES
('Massages', 'massages', 'Detendez-vous avec nos massages professionnels', 'hand', 1),
('Soins du visage', 'soins-visage', 'Sublimez votre peau avec nos soins experts', 'sparkles', 2),
('Yoga & Meditation', 'yoga-meditation', 'Trouvez votre equilibre interieur', 'lotus', 3),
('Relaxation', 'relaxation', 'Echappez au stress quotidien', 'moon', 4),
('Fitness & Coaching', 'fitness', 'Atteignez vos objectifs sportifs', 'dumbbell', 5);

-- Services
INSERT INTO `services` (`category_id`, `name`, `slug`, `description`, `short_description`, `duration`, `price`, `image`, `is_featured`, `max_participants`) VALUES
(1, 'Massage Relaxant', 'massage-relaxant', 'Un massage doux et apaisant pour evacuer le stress et les tensions. Ideal pour une detente profonde.', 'Massage doux pour une relaxation totale', 60, 75.00, '/images/services/massage-relaxant.jpg', TRUE, 1),
(1, 'Massage aux Pierres Chaudes', 'massage-pierres-chaudes', 'Les pierres volcaniques chaudes detendent les muscles en profondeur pour une experience unique.', 'Relaxation profonde avec pierres volcaniques', 90, 95.00, '/images/services/pierres-chaudes.jpg', TRUE, 1),
(1, 'Massage Sportif', 'massage-sportif', 'Massage tonique adapte aux sportifs pour la recuperation et la prevention des blessures.', 'Recuperation et performance sportive', 60, 80.00, '/images/services/massage-sportif.jpg', FALSE, 1),
(2, 'Soin Hydratant Visage', 'soin-hydratant', 'Soin complet pour hydrater et revitaliser votre peau en profondeur.', 'Hydratation intense et eclat', 45, 65.00, '/images/services/soin-hydratant.jpg', TRUE, 1),
(2, 'Soin Anti-Age', 'soin-anti-age', 'Traitement premium anti-rides pour une peau visiblement plus jeune et ferme.', 'Rajeunissement et fermete', 60, 95.00, '/images/services/soin-anti-age.jpg', FALSE, 1),
(3, 'Seance de Yoga Hatha', 'yoga-hatha', 'Cours de yoga traditionnel pour harmoniser corps et esprit. Tous niveaux.', 'Equilibre et serenite', 75, 25.00, '/images/services/yoga-hatha.jpg', TRUE, 15),
(3, 'Meditation Guidee', 'meditation-guidee', 'Seance de meditation pour apaiser le mental et developper la pleine conscience.', 'Paix interieure et concentration', 45, 20.00, '/images/services/meditation.jpg', FALSE, 20),
(4, 'Bain Thermal', 'bain-thermal', 'Immersion dans nos bains aux eaux thermales enrichies en mineraux.', 'Detente et bien-etre aquatique', 60, 45.00, '/images/services/bain-thermal.jpg', TRUE, 1),
(4, 'Sauna & Hammam', 'sauna-hammam', 'Acces au sauna finlandais et hammam oriental pour une purification complete.', 'Purification et detoxification', 90, 35.00, '/images/services/sauna.jpg', FALSE, 10),
(5, 'Coaching Personnel', 'coaching-personnel', 'Seance individuelle avec un coach certifie pour atteindre vos objectifs.', 'Accompagnement sur mesure', 60, 55.00, '/images/services/coaching.jpg', FALSE, 1);

-- Praticiens
INSERT INTO `practitioners` (`user_id`, `specialization`, `bio`, `experience_years`, `is_available`) VALUES
(2, 'Masseuse & Aromatherapeute', 'Marie est specialisee dans les massages relaxants et therapeutiques. Certifiee en aromatherapie.', 8, TRUE),
(3, 'Coach Yoga & Meditation', 'Jean pratique le yoga depuis 15 ans et enseigne differentes techniques de meditation.', 12, TRUE),
(4, 'Estheticienne & Soins du visage', 'Sophie est experte en soins du visage et techniques de rajeunissement naturel.', 6, TRUE);

-- Liaison praticien-services
INSERT INTO `practitioner_services` (`practitioner_id`, `service_id`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 6), (2, 7),
(3, 4), (3, 5);

-- Activites
INSERT INTO `activities` (`name`, `slug`, `description`, `category_id`, `practitioner_id`, `date`, `start_time`, `end_time`, `max_participants`, `price`, `location`, `level`) VALUES
('Yoga Matinal', 'yoga-matinal', 'Commencez la journee en douceur avec une seance de yoga energisante', 3, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '09:00:00', 12, 20.00, 'Salle Zen', 'tous'),
('Atelier Meditation Pleine Conscience', 'atelier-meditation', 'Apprenez les bases de la meditation mindfulness', 3, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00', '19:30:00', 15, 25.00, 'Salle Serenite', 'debutant'),
('Yoga Vinyasa Flow', 'yoga-vinyasa', 'Seance dynamique enchainant les postures en fluidite', 3, 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', '11:15:00', 10, 22.00, 'Salle Zen', 'intermediaire'),
('Initiation Auto-massage', 'initiation-automassage', 'Apprenez les techniques pour vous masser vous-meme', 1, 1, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '14:00:00', '16:00:00', 8, 35.00, 'Salle Harmonie', 'tous');

-- Programmes bien-etre
INSERT INTO `wellness_programs` (`name`, `slug`, `description`, `duration_weeks`, `sessions_count`, `price`, `benefits`) VALUES
('Detox & Revitalisation', 'detox-revitalisation', 'Programme complet de 4 semaines pour purifier votre corps et retrouver votre vitalite.', 4, 8, 350.00, '["Elimination des toxines", "Regain d energie", "Amelioration du sommeil", "Perte de poids"]'),
('Anti-Stress Intensif', 'anti-stress-intensif', 'Programme de 6 semaines combinant massages, yoga et meditation pour vaincre le stress.', 6, 12, 480.00, '["Reduction du stress", "Meilleure gestion des emotions", "Relaxation profonde", "Equilibre retrouve"]'),
('Remise en Forme', 'remise-en-forme', 'Programme sportif de 8 semaines avec coaching personnalise et suivi nutritionnel.', 8, 16, 550.00, '["Tonification musculaire", "Endurance amelioree", "Conseils nutrition", "Motivation garantie"]');

-- Index pour optimisation
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_time_slots_date ON time_slots(date);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

COMMIT;

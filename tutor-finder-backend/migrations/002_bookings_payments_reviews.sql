-- Safe, additive schema migration for the tutor-finder backend.
-- Adds booking + simulated mobile-money payment + receipt + review support.
-- This migration does not drop, truncate, or recreate existing tables.
--
-- Run against the `tutor_finder` database:
--   mysql -u root -p tutor_finder < migrations/002_bookings_payments_reviews.sql

-- --------------------------------------------------------
-- bookings — a student requesting a session with a tutor. Payment can only
-- be initiated once a booking's status is 'confirmed' (i.e. the tutor has
-- confirmed their availability).
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    tutor_id CHAR(36) NOT NULL,
    subject VARCHAR(150) NULL,
    scheduled_at DATETIME NULL,
    rate DECIMAL(10,2) NOT NULL,
    message TEXT NULL,
    status ENUM('pending', 'confirmed', 'declined', 'cancelled') NOT NULL DEFAULT 'pending',
    confirmed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bookings_student (student_id),
    KEY idx_bookings_tutor (tutor_id),
    CONSTRAINT fk_bookings_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- transactions — one simulated mobile-money payment attempt per booking.
-- A booking can have several attempts (e.g. a failed one followed by a
-- retry), but application logic refuses a new attempt once one has
-- status = 'completed' for that booking.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id CHAR(36) NOT NULL,
    booking_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    tutor_id CHAR(36) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    payer_msisdn VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    tutor_payout DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    momo_reference VARCHAR(64) NULL,
    failure_reason VARCHAR(255) NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_transactions_booking (booking_id),
    KEY idx_transactions_student (student_id),
    KEY idx_transactions_tutor (tutor_id),
    CONSTRAINT fk_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- receipts — issued automatically the moment a transaction completes.
-- One per completed transaction; kept separate from transactions so a
-- human-friendly receipt_number can be generated independently of the
-- internal UUID.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS receipts (
    id CHAR(36) NOT NULL,
    transaction_id CHAR(36) NOT NULL,
    receipt_number VARCHAR(32) NOT NULL,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_receipts_transaction (transaction_id),
    UNIQUE KEY uq_receipts_number (receipt_number),
    CONSTRAINT fk_receipts_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- reviews — a student's rating + comment for a tutor. Gated in
-- controller/reviews/reviewService.js to students who have at least one
-- completed transaction with that tutor. One review per (student, tutor)
-- pair; resubmitting edits the existing review instead of duplicating it.
--
-- tutor_profiles.rating / reviews_count already exist as denormalized
-- read fields (see 001_account_and_tutor_profiles.sql) — the review
-- service keeps them in sync on every insert/update/delete.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) NOT NULL,
    tutor_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    booking_id CHAR(36) NULL,
    rating TINYINT(1) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reviews_student_tutor (student_id, tutor_id),
    KEY idx_reviews_tutor (tutor_id),
    CONSTRAINT chk_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_reviews_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

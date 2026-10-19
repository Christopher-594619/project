-- Safe, additive schema migration: simulated mobile-money payments.
-- Creates the transactions and receipts tables only; does not touch the
-- existing bookings table. Column types match bookings.id (VARCHAR(36))
-- and users.id (CHAR(36)) so the foreign keys line up.
--
-- Run against the `tutor_finder` database:
--   mysql -u root -p tutor_finder < migrations/003_payments.sql

-- --------------------------------------------------------
-- transactions — one simulated mobile-money payment attempt per booking.
-- A booking can have several attempts (e.g. a failed one followed by a
-- retry), but application logic refuses a new attempt once one has
-- status = 'completed' for that booking.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id CHAR(36) NOT NULL,
    booking_id VARCHAR(36) NOT NULL,
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

-- Safe, additive migration adding the bookings table.
-- Does not drop, truncate, or recreate existing tables.

CREATE TABLE IF NOT EXISTS bookings (
    id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    tutor_id CHAR(36) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    session_date DATE NOT NULL,
    session_time VARCHAR(20) NOT NULL,
    duration INT UNSIGNED NOT NULL DEFAULT 60,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT NULL,
    cancelled_by CHAR(36) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bookings_student (student_id),
    KEY idx_bookings_tutor (tutor_id),
    KEY idx_bookings_status (status),
    CONSTRAINT fk_bookings_student
        FOREIGN KEY (student_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_bookings_tutor
        FOREIGN KEY (tutor_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

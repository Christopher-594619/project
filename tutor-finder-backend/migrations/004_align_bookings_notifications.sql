-- Aligns bookings/notifications tables created from the older tutor_finder.sql
-- schema with the columns the current code expects. 002_notifications.sql and
-- 003_bookings.sql use CREATE TABLE IF NOT EXISTS, so they were skipped for
-- those databases.
-- Additive: legacy columns are kept and existing rows are backfilled.
-- Run once; skip it on databases created from 002/003.

-- ==================== BOOKINGS ====================
ALTER TABLE bookings
    ADD COLUMN session_date DATE NULL AFTER subject,
    ADD COLUMN session_time VARCHAR(20) NULL AFTER session_date,
    ADD COLUMN duration INT UNSIGNED NOT NULL DEFAULT 60 AFTER session_time,
    ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER status,
    ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER price,
    ADD COLUMN cancelled_by CHAR(36) NULL AFTER notes,
    MODIFY scheduled_at DATETIME NULL,
    MODIFY status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending';

UPDATE bookings b
LEFT JOIN tutor_profiles tp ON tp.user_id = b.tutor_id
SET b.session_date = DATE(b.scheduled_at),
    b.session_time = DATE_FORMAT(b.scheduled_at, '%l:%i %p'),
    b.duration = b.duration_minutes,
    b.price = COALESCE(tp.price, 0),
    b.total_amount = ROUND(COALESCE(tp.price, 0) * b.duration_minutes / 60, 2)
WHERE b.session_date IS NULL AND b.scheduled_at IS NOT NULL;

-- ==================== NOTIFICATIONS ====================
ALTER TABLE notifications
    ADD COLUMN message VARCHAR(500) NULL AFTER type,
    ADD COLUMN read_at TIMESTAMP NULL DEFAULT NULL AFTER message,
    MODIFY type VARCHAR(50) NOT NULL,
    MODIFY title VARCHAR(150) NULL;

UPDATE notifications
SET message = IF(body IS NULL OR body = '', title, CONCAT(title, ': ', body)),
    read_at = IF(is_read = 1, created_at, NULL)
WHERE message IS NULL;

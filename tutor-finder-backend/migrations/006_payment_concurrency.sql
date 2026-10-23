-- Concurrency safety for payments (safe to re-run).
--
-- At most ONE payment per booking may be in progress ('pending') or
-- succeeded ('completed'). Failed attempts are not limited, so a student can
-- retry after a failure and every failed attempt stays on record.
--
-- MySQL/MariaDB have no partial unique indexes, so a stored generated column
-- holds the booking id only for pending/completed rows (NULL otherwise), and a
-- UNIQUE index on it rejects a second active payment. UNIQUE allows any number
-- of NULLs, so failed rows never conflict. Works on MariaDB 10.4 and MySQL 8.

DELIMITER //

DROP PROCEDURE IF EXISTS add_payment_concurrency_guard//

CREATE PROCEDURE add_payment_concurrency_guard()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'
                     AND COLUMN_NAME = 'active_booking_id') THEN
        ALTER TABLE transactions
            ADD COLUMN active_booking_id VARCHAR(36)
                GENERATED ALWAYS AS (IF(status IN ('pending', 'completed'), booking_id, NULL)) STORED,
            ADD UNIQUE KEY uq_one_active_payment_per_booking (active_booking_id);
    END IF;
END//

DELIMITER ;

CALL add_payment_concurrency_guard();
DROP PROCEDURE IF EXISTS add_payment_concurrency_guard;

-- Safe, additive migration adding admin moderation controls.
-- Does not drop, truncate, or recreate existing tables.

DELIMITER //

DROP PROCEDURE IF EXISTS add_admin_control_columns//

CREATE PROCEDURE add_admin_control_columns()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_suspended') THEN
        ALTER TABLE users ADD COLUMN is_suspended BOOLEAN NOT NULL DEFAULT FALSE AFTER role;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'suspended_reason') THEN
        ALTER TABLE users ADD COLUMN suspended_reason VARCHAR(255) NULL AFTER is_suspended;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'suspended_at') THEN
        ALTER TABLE users ADD COLUMN suspended_at TIMESTAMP NULL AFTER suspended_reason;
    END IF;
END//

CALL add_admin_control_columns()//
DROP PROCEDURE add_admin_control_columns//

DELIMITER ;

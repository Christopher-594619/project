-- Safe, additive schema migration for the tutor-finder backend.
-- This migration does not drop, truncate, or recreate existing tables.

DELIMITER //

DROP PROCEDURE IF EXISTS add_missing_user_columns//

CREATE PROCEDURE add_missing_user_columns()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(150) NULL AFTER phone;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT NULL AFTER name;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_pic') THEN
        ALTER TABLE users ADD COLUMN profile_pic VARCHAR(500) NULL AFTER bio;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'middle_name') THEN
        ALTER TABLE users ADD COLUMN middle_name VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'mobile_phone') THEN
        ALTER TABLE users ADD COLUMN mobile_phone VARCHAR(20) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'telephone') THEN
        ALTER TABLE users ADD COLUMN telephone VARCHAR(20) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'address') THEN
        ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'physical_address') THEN
        ALTER TABLE users ADD COLUMN physical_address TEXT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'postal_address') THEN
        ALTER TABLE users ADD COLUMN postal_address TEXT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'date_of_birth') THEN
        ALTER TABLE users ADD COLUMN date_of_birth DATE NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'gender') THEN
        ALTER TABLE users ADD COLUMN gender VARCHAR(30) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'nationality') THEN
        ALTER TABLE users ADD COLUMN nationality VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'place_of_birth_town') THEN
        ALTER TABLE users ADD COLUMN place_of_birth_town VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'place_of_birth_country') THEN
        ALTER TABLE users ADD COLUMN place_of_birth_country VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'nrc_number') THEN
        ALTER TABLE users ADD COLUMN nrc_number VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'nrc_place_of_issue') THEN
        ALTER TABLE users ADD COLUMN nrc_place_of_issue VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'nrc_date_of_issue') THEN
        ALTER TABLE users ADD COLUMN nrc_date_of_issue DATE NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_completed') THEN
        ALTER TABLE users ADD COLUMN profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_registered') THEN
        ALTER TABLE users ADD COLUMN is_registered BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    END IF;
END//

CALL add_missing_user_columns()//
DROP PROCEDURE add_missing_user_columns//

DELIMITER ;

CREATE TABLE IF NOT EXISTS tutor_profiles (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    bio TEXT NULL,
    photo VARCHAR(500) NULL,
    subjects JSON NULL,
    levels JSON NULL,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    reviews_count INT UNSIGNED NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    distance DECIMAL(10,2) NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'both',
    availability JSON NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    experience VARCHAR(255) NULL,
    qualifications JSON NULL,
    languages JSON NULL,
    location VARCHAR(255) NULL,
    skills JSON NULL,
    education JSON NULL,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tutor_profiles_user_id (user_id),
    KEY idx_tutor_profiles_active_rating (is_active, rating, reviews_count),
    KEY idx_tutor_profiles_location (latitude, longitude),
    CONSTRAINT fk_tutor_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
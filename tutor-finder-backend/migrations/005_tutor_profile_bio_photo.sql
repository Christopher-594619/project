-- Safe, additive schema migration: tutor_profiles.bio and tutor_profiles.photo.
-- The code (becomeTutor, updateTutor, searchTutors, users/me) reads and
-- writes these columns, but tutor_finder.sql doesn't create them, so
-- loading a tutor's profile fails with "Unknown column".

DELIMITER //

DROP PROCEDURE IF EXISTS add_tutor_profile_bio_photo//

CREATE PROCEDURE add_tutor_profile_bio_photo()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tutor_profiles' AND COLUMN_NAME = 'bio') THEN
        ALTER TABLE tutor_profiles ADD COLUMN bio TEXT NULL AFTER user_id;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tutor_profiles' AND COLUMN_NAME = 'photo') THEN
        ALTER TABLE tutor_profiles ADD COLUMN photo VARCHAR(500) NULL AFTER bio;
    END IF;
END//

DELIMITER ;

CALL add_tutor_profile_bio_photo();
DROP PROCEDURE IF EXISTS add_tutor_profile_bio_photo;

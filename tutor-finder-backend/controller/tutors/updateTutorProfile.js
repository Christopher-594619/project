// controllers/tutor/updateTutorProfile.js
const path = require("path");
const fs = require("fs");
const { db } = require("../../modal/db");
const { parseProfile } = require("../tutors/parseProfile");
const bcrypt = require("bcrypt");

const updateUserPassword = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters",
            });
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain uppercase, lowercase, and a number",
            });
        }

        const [rows] = await db.promise().query(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const sameAsOld = await bcrypt.compare(newPassword, rows[0].password);
        if (sameAsOld) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password",
            });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await db.promise().query(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashed, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const safeParseJSON = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === "object") return value;
    try { return JSON.parse(value); } catch { return fallback; }
};

const updateTutorProfile = async (req, res) => {
    let savedPhotoPath = null;

    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // --- fetch existing user + tutor profile ---
        const [userRows] = await db.promise().query(
            "SELECT id, profile_pic FROM users WHERE id = ?",
            [userId]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const currentUser = userRows[0];

        const [profileRows] = await db.promise().query(
            "SELECT id FROM tutor_profiles WHERE user_id = ?",
            [userId]
        );
        if (profileRows.length === 0) {
            return res.status(404).json({ success: false, message: "Tutor profile not found" });
        }

        // --- parse fields ---
        const {
            firstName,
            lastName,
            email,
            phone,
            bio,
            subjects,
            levels,
            price,
            mode,
            availability,
            experience,
            qualifications,
            languages,
            location,
            skills,
            education,
        } = req.body;

        const parsedSubjects       = safeParseJSON(subjects, []);
        const parsedLevels         = safeParseJSON(levels, []);
        const parsedAvailability   = safeParseJSON(availability, []);
        const parsedQualifications = safeParseJSON(qualifications, []);
        const parsedLanguages      = safeParseJSON(languages, []);
        const parsedSkills         = safeParseJSON(skills, []);
        const parsedEducation      = safeParseJSON(education, []);

        // --- uniqueness checks (only if changed) ---
        if (email) {
            const [dup] = await db.promise().query(
                "SELECT id FROM users WHERE email = ? AND id <> ?",
                [email.toLowerCase(), userId]
            );
            if (dup.length > 0) return res.status(409).json({ success: false, message: "Email already in use" });
        }
        if (phone) {
            const [dup] = await db.promise().query(
                "SELECT id FROM users WHERE phone = ? AND id <> ?",
                [phone, userId]
            );
            if (dup.length > 0) return res.status(409).json({ success: false, message: "Phone already in use" });
        }

        // --- handle new photo ---
        let photoUrl = currentUser.profile_pic;

        if (req.file) {
            const filename = `${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
            const profilesDir = path.join(__dirname, "../../uploads/profiles");

            if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir, { recursive: true });

            savedPhotoPath = path.join(profilesDir, filename);

            if (req.file.path !== savedPhotoPath) fs.renameSync(req.file.path, savedPhotoPath);

            // delete old
            if (currentUser.profile_pic) {
                const old = path.join(
                    __dirname,
                    "../../",
                    currentUser.profile_pic.startsWith("/") ? currentUser.profile_pic.slice(1) : currentUser.profile_pic
                );
                try { if (fs.existsSync(old)) fs.unlinkSync(old); } catch {}
            }

            photoUrl = `/uploads/profiles/${filename}`;
        }

        // --- update users ---
        const userFields = [];
        const userValues = [];

        if (firstName) { userFields.push("firstName = ?"); userValues.push(firstName); }
        if (lastName)  { userFields.push("lastName = ?");  userValues.push(lastName); }
        if (email)     { userFields.push("email = ?");     userValues.push(email.toLowerCase()); }
        if (phone)     { userFields.push("phone = ?");     userValues.push(phone); }
        if (bio !== undefined) { userFields.push("bio = ?"); userValues.push(bio); }
        if (photoUrl !== currentUser.profile_pic) {
            userFields.push("profile_pic = ?");
            userValues.push(photoUrl);
        }

        if (userFields.length > 0) {
            userValues.push(userId);
            await db.promise().query(
                `UPDATE users SET ${userFields.join(", ")} WHERE id = ?`,
                userValues
            );
        }

        // --- update tutor_profiles ---
        const tFields = [];
        const tValues = [];

        if (subjects)         { tFields.push("subjects = ?");         tValues.push(JSON.stringify(parsedSubjects)); }
        if (levels)           { tFields.push("levels = ?");           tValues.push(JSON.stringify(parsedLevels)); }
        if (price !== undefined) { tFields.push("price = ?");         tValues.push(price); }
        if (mode)             { tFields.push("mode = ?");             tValues.push(mode); }
        if (availability)     { tFields.push("availability = ?");     tValues.push(JSON.stringify(parsedAvailability)); }
        if (experience)       { tFields.push("experience = ?");       tValues.push(experience); }
        if (qualifications)   { tFields.push("qualifications = ?");   tValues.push(JSON.stringify(parsedQualifications)); }
        if (languages)        { tFields.push("languages = ?");        tValues.push(JSON.stringify(parsedLanguages)); }
        if (location)         { tFields.push("location = ?");         tValues.push(location); }
        if (skills)           { tFields.push("skills = ?");           tValues.push(JSON.stringify(parsedSkills)); }
        if (education)        { tFields.push("education = ?");        tValues.push(JSON.stringify(parsedEducation)); }

        if (tFields.length > 0) {
            tValues.push(userId);
            await db.promise().query(
                `UPDATE tutor_profiles SET ${tFields.join(", ")} WHERE user_id = ?`,
                tValues
            );
        }

        // --- return fresh data ---
        const [row] = await db.promise().query(
            `
            SELECT
                tp.*,
                u.id AS user_id,
                u.firstName AS tutor_first_name,
                u.lastName AS tutor_last_name,
                u.email AS tutor_email,
                u.phone AS tutor_phone,
                u.bio AS tutor_bio,
                u.profile_pic AS tutor_profile_pic
            FROM tutor_profiles tp
            INNER JOIN users u ON tp.user_id = u.id
            WHERE tp.user_id = ?
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Tutor profile updated successfully",
            tutor: parseProfile(row[0]),
        });

    } catch (error) {
        console.error("Error updating tutor profile:", error);
        if (savedPhotoPath) {
            try { if (fs.existsSync(savedPhotoPath)) fs.unlinkSync(savedPhotoPath); } catch {}
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { updateTutorProfile, updateUserPassword};

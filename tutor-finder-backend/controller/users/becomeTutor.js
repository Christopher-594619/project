// controllers/tutor/tutorController.js
const path = require("path");
const fs = require("fs");
const { db } = require("../../modal/db");
const { v4: uuidv4 } = require("uuid");
const { parseProfile } = require("../tutors/parseProfile");

// ==================== CREATE TUTOR PROFILE ====================
const createTutorProfile = async (req, res) => {
    const profileId = uuidv4();
    let savedPhotoFilename = null;
    let savedPhotoPath = null;

    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // req.body from multer form-data (all fields come as strings)
        const {
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
            education
        } = req.body;

        // Parse JSON strings sent from frontend (multipart form-data)
        const parsedSubjects = safeParseJSON(subjects, []);
        const parsedLevels = safeParseJSON(levels, []);
        const parsedAvailability = safeParseJSON(availability, []);
        const parsedQualifications = safeParseJSON(qualifications, []);
        const parsedLanguages = safeParseJSON(languages, []);
        const parsedSkills = safeParseJSON(skills, []);
        const parsedEducation = safeParseJSON(education, []);

        // Validate required fields
        if (!bio || parsedSubjects.length === 0 || parsedLevels.length === 0 || !price || parsedAvailability.length === 0) {
            // Clean up uploaded file if validation fails
            if (req.file) cleanupFile(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Missing required fields: bio, subjects, levels, price, availability"
            });
        }

        // Validate photo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile photo is required"
            });
        }

        // Move/rename uploaded photo into uploads/profiles with a unique name
        savedPhotoFilename = `${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
        const profilesDir = path.join(__dirname, "../../uploads/profiles");

        // Ensure directory exists
        if (!fs.existsSync(profilesDir)) {
            fs.mkdirSync(profilesDir, { recursive: true });
        }

        savedPhotoPath = path.join(profilesDir, savedPhotoFilename);

        // If multer saved to temp location, move it
        if (req.file.path !== savedPhotoPath) {
            fs.renameSync(req.file.path, savedPhotoPath);
        }

        // Check if user already has a tutor profile
        const [existing] = await db.promise().query(
            "SELECT id FROM tutor_profiles WHERE user_id = ?",
            [userId]
        );

        if (existing.length > 0) {
            // Cleanup newly uploaded file since profile already exists
            cleanupFile(savedPhotoPath);
            return res.status(409).json({
                success: false,
                message: "You already have a tutor profile"
            });
        }

        // Public URL path for serving the photo
        const photoUrl = `/uploads/profiles/${savedPhotoFilename}`;

        // 1. Update the account role only; tutor details belong to tutor_profiles.
        await db.promise().query(
            `
            UPDATE users
            SET role = 'tutor'
            WHERE id = ?
            `,
            [userId]
        );

        // 2. Insert tutor profile
        await db.promise().query(
            `
            INSERT INTO tutor_profiles
            (
                id,
                user_id,
                bio,
                photo,
                subjects,
                levels,
                rating,
                reviews_count,
                price,
                distance,
                mode,
                availability,
                verified,
                experience,
                qualifications,
                languages,
                location,
                skills,
                education
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                profileId,
                userId,
                bio,
                photoUrl,
                JSON.stringify(parsedSubjects),
                JSON.stringify(parsedLevels),
                0.00,
                0,
                price,
                0.00,
                mode || 'both',
                JSON.stringify(parsedAvailability),
                false,
                experience || null,
                JSON.stringify(parsedQualifications),
                JSON.stringify(parsedLanguages),
                location || null,
                JSON.stringify(parsedSkills),
                JSON.stringify(parsedEducation)
            ]
        );

        // Fetch the created profile
        const [profile] = await db.promise().query(
            "SELECT * FROM tutor_profiles WHERE id = ?",
            [profileId]
        );

        const createdProfile = parseProfile(profile[0]);

        return res.status(201).json({
            success: true,
            message: "Tutor profile created successfully",
            tutor: createdProfile
        });

    } catch (error) {
        console.error("Error creating tutor profile:", error);

        // Clean up file on error
        if (savedPhotoPath) cleanupFile(savedPhotoPath);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ==================== HELPERS ====================
const safeParseJSON = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const cleanupFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("Error cleaning up file:", err);
    }
};


module.exports = {createTutorProfile};
// ==================== UPDATE TUTOR PROFILE ====================
const path = require("path");
const fs = require("fs");
const { db } = require("../../modal/db");
const { parseProfile } = require("./parseProfile");

// Columns the tutor is allowed to change from their dashboard.
// JSON columns are stringified before they hit the database.
const TEXT_FIELDS = ["bio", "price", "mode", "experience", "location"];
const JSON_FIELDS = [
    "subjects",
    "levels",
    "availability",
    "qualifications",
    "languages",
    "skills",
    "education"
];

const updateTutorProfile = async (req, res) => {
    let savedPhotoPath = null;

    try {
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            if (req.file) cleanupFile(req.file.path);
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const [existing] = await db.promise().query(
            "SELECT id, photo FROM tutor_profiles WHERE user_id = ?",
            [userId]
        );

        if (existing.length === 0) {
            if (req.file) cleanupFile(req.file.path);
            return res.status(404).json({
                success: false,
                message: "Tutor profile not found"
            });
        }

        // Build a partial update so untouched fields keep their current values.
        const columns = [];
        const values = [];

        TEXT_FIELDS.forEach((field) => {
            if (req.body[field] !== undefined) {
                columns.push(`${field} = ?`);
                values.push(req.body[field] === "" ? null : req.body[field]);
            }
        });

        // Visibility toggle: form-data arrives as a string, so normalise it.
        if (req.body.is_active !== undefined) {
            const active = !["0", "false", ""].includes(String(req.body.is_active));
            columns.push("is_active = ?");
            values.push(active);
        }

        JSON_FIELDS.forEach((field) => {
            if (req.body[field] !== undefined) {
                columns.push(`${field} = ?`);
                values.push(JSON.stringify(safeParseJSON(req.body[field], [])));
            }
        });

        // A new photo replaces the old one on disk.
        if (req.file) {
            const savedPhotoFilename = `${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
            const profilesDir = path.join(__dirname, "../../uploads/profiles");

            if (!fs.existsSync(profilesDir)) {
                fs.mkdirSync(profilesDir, { recursive: true });
            }

            savedPhotoPath = path.join(profilesDir, savedPhotoFilename);

            if (req.file.path !== savedPhotoPath) {
                fs.renameSync(req.file.path, savedPhotoPath);
            }

            columns.push("photo = ?");
            values.push(`/uploads/profiles/${savedPhotoFilename}`);
        }

        if (columns.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No profile fields were provided"
            });
        }

        values.push(userId);

        await db.promise().query(
            `UPDATE tutor_profiles SET ${columns.join(", ")} WHERE user_id = ?`,
            values
        );

        // Remove the previous photo only after the update succeeded.
        if (req.file && existing[0].photo) {
            cleanupFile(path.join(__dirname, "../..", existing[0].photo));
        }

        const [rows] = await db.promise().query(
            "SELECT * FROM tutor_profiles WHERE user_id = ?",
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            tutor: parseProfile(rows[0])
        });

    } catch (error) {
        console.error("Error updating tutor profile:", error);

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
    if (typeof value === "object") return value;
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
    } catch (error) {
        console.error("Error cleaning up file:", error);
    }
};

module.exports = { updateTutorProfile };

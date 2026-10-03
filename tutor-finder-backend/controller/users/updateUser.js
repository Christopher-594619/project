// controllers/user/updateUserProfile.js
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { db } = require("../../modal/db");

// ==================== UPDATE PROFILE ====================
const updateUserProfile = async (req, res) => {
    let savedPhotoPath = null;

    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { firstName, lastName, email, phone, bio } = req.body;

        const [rows] = await db.promise().query(
            "SELECT id, profile_pic FROM users WHERE id = ?",
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const current = rows[0];

        if (email) {
            const [dup] = await db.promise().query(
                "SELECT id FROM users WHERE email = ? AND id <> ?",
                [email.toLowerCase(), userId]
            );
            if (dup.length > 0) {
                return res.status(409).json({ success: false, message: "Email already in use" });
            }
        }
        if (phone) {
            const [dup] = await db.promise().query(
                "SELECT id FROM users WHERE phone = ? AND id <> ?",
                [phone, userId]
            );
            if (dup.length > 0) {
                return res.status(409).json({ success: false, message: "Phone already in use" });
            }
        }

        let photoUrl = current.profile_pic;

        if (req.file) {
            const filename = `${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
            const profilesDir = path.join(__dirname, "../../uploads/profiles");

            if (!fs.existsSync(profilesDir)) {
                fs.mkdirSync(profilesDir, { recursive: true });
            }

            savedPhotoPath = path.join(profilesDir, filename);

            if (req.file.path !== savedPhotoPath) {
                fs.renameSync(req.file.path, savedPhotoPath);
            }

            if (current.profile_pic) {
                const old = path.join(
                    __dirname,
                    "../../",
                    current.profile_pic.startsWith("/") ? current.profile_pic.slice(1) : current.profile_pic
                );
                try {
                    if (fs.existsSync(old)) fs.unlinkSync(old);
                } catch (e) {
                    console.warn("Could not delete old photo:", e.message);
                }
            }

            photoUrl = `/uploads/profiles/${filename}`;
        }

        const fields = [];
        const values = [];

        if (firstName) { fields.push("firstName = ?"); values.push(firstName); }
        if (lastName)  { fields.push("lastName = ?");  values.push(lastName); }
        if (email)     { fields.push("email = ?");     values.push(email.toLowerCase()); }
        if (phone)     { fields.push("phone = ?");     values.push(phone); }
        if (bio !== undefined) { fields.push("bio = ?"); values.push(bio); }
        if (photoUrl !== current.profile_pic) {
            fields.push("profile_pic = ?"); values.push(photoUrl);
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "Nothing to update" });
        }

        values.push(userId);

        await db.promise().query(
            `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        const [updated] = await db.promise().query(
            "SELECT id, firstName, lastName, email, phone, role, bio, profile_pic, created_at FROM users WHERE id = ?",
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updated[0],
        });

    } catch (error) {
        console.error("Error updating user profile:", error);
        if (savedPhotoPath) {
            try { if (fs.existsSync(savedPhotoPath)) fs.unlinkSync(savedPhotoPath); } catch {}
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ==================== UPDATE PASSWORD ====================
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

module.exports = { updateUserProfile, updateUserPassword };
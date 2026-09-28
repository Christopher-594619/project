const { db } = require("../../modal/db");

// ==================== VERIFY / UNVERIFY A TUTOR (ADMIN) ====================
const updateTutorVerification = async (req, res) => {
    try {
        const { id } = req.params; // tutor_profiles.id
        const { verified } = req.body;

        const [existing] = await db.promise().query(
            "SELECT id FROM tutor_profiles WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tutor profile not found"
            });
        }

        await db.promise().query(
            "UPDATE tutor_profiles SET verified = ? WHERE id = ?",
            [Boolean(verified), id]
        );

        return res.status(200).json({
            success: true,
            message: verified ? "Tutor verified" : "Tutor verification revoked"
        });
    } catch (error) {
        console.error("Error updating tutor verification:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { updateTutorVerification };

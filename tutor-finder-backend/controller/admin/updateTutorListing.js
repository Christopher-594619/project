const { db } = require("../../modal/db");

// ==================== ACTIVATE / DEACTIVATE A TUTOR LISTING (ADMIN) ====================
// Distinct from the tutor's own visibility toggle - this is an admin override,
// e.g. to unlist a tutor pending investigation without suspending their account.
const updateTutorListing = async (req, res) => {
    try {
        const { id } = req.params; // tutor_profiles.id
        const { active } = req.body;

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
            "UPDATE tutor_profiles SET is_active = ? WHERE id = ?",
            [Boolean(active), id]
        );

        return res.status(200).json({
            success: true,
            message: active ? "Tutor listing activated" : "Tutor listing deactivated"
        });
    } catch (error) {
        console.error("Error updating tutor listing:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { updateTutorListing };

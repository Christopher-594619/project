const { db } = require("../../modal/db");

// ==================== SUSPEND / REACTIVATE A USER (ADMIN) ====================
// Works for both students and tutors - suspending a tutor's account also
// blocks their profile from search via the tutor_profiles.is_active flag.
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { suspended, reason } = req.body;
        const adminId = req.user?.userId || req.user?.id;

        if (id === adminId) {
            return res.status(400).json({
                success: false,
                message: "You cannot suspend your own account"
            });
        }

        const [rows] = await db.promise().query(
            "SELECT id, role FROM users WHERE id = ? LIMIT 1",
            [id]
        );

        const target = rows[0];

        if (!target) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (target.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot be suspended here"
            });
        }

        const isSuspended = Boolean(suspended);

        await db.promise().query(
            `
            UPDATE users
            SET is_suspended = ?, suspended_reason = ?, suspended_at = ?
            WHERE id = ?
            `,
            [isSuspended, isSuspended ? (reason || null) : null, isSuspended ? new Date() : null, id]
        );

        // Suspending a tutor also pulls their listing out of search. Reactivating
        // does not automatically re-list them - that is a separate admin action
        // (updateTutorListing) so a suspension can't quietly make someone public again.
        if (target.role === "tutor" && isSuspended) {
            await db.promise().query(
                "UPDATE tutor_profiles SET is_active = FALSE WHERE user_id = ?",
                [id]
            );
        }

        return res.status(200).json({
            success: true,
            message: isSuspended ? "User suspended" : "User reactivated"
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { updateUserStatus };

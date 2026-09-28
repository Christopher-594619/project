const { db } = require("../../modal/db");

// ==================== DELETE A USER (ADMIN) ====================
// tutor_profiles has ON DELETE CASCADE on user_id, so deleting a tutor's
// account also removes their profile in the same statement.
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?.userId || req.user?.id;

        if (id === adminId) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
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
                message: "Admin accounts cannot be deleted here"
            });
        }

        await db.promise().query("DELETE FROM users WHERE id = ?", [id]);

        return res.status(200).json({
            success: true,
            message: "User deleted"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { deleteUser };

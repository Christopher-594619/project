const { db } = require("../../modal/db");

// ==================== TUTOR EARNINGS SUMMARY ====================
const getEarnings = async (req, res) => {
    try {
        const tutorId = req.user?.userId || req.user?.id;
        const role = req.user?.role;

        if (role !== "tutor") {
            return res.status(403).json({
                success: false,
                message: "Only tutors have earnings"
            });
        }

        const [[totals]] = await db.promise().query(
            `
            SELECT
                COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS totalEarnings,
                COALESCE(SUM(CASE
                    WHEN status = 'completed' AND session_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    THEN total_amount ELSE 0
                END), 0) AS thisMonth,
                COALESCE(SUM(CASE
                    WHEN status = 'completed' AND session_date >= (CURDATE() - INTERVAL 7 DAY)
                    THEN total_amount ELSE 0
                END), 0) AS thisWeek,
                COUNT(*) AS totalBookings,
                SUM(status = 'completed') AS completedBookings,
                SUM(status = 'pending') AS pendingBookings
            FROM bookings
            WHERE tutor_id = ?
            `,
            [tutorId]
        );

        const [[profile]] = await db.promise().query(
            "SELECT rating FROM tutor_profiles WHERE user_id = ? LIMIT 1",
            [tutorId]
        );

        return res.status(200).json({
            success: true,
            earnings: {
                totalEarnings: Number(totals.totalEarnings) || 0,
                thisMonth: Number(totals.thisMonth) || 0,
                thisWeek: Number(totals.thisWeek) || 0,
                totalBookings: Number(totals.totalBookings) || 0,
                completedBookings: Number(totals.completedBookings) || 0,
                pendingBookings: Number(totals.pendingBookings) || 0,
                averageRating: Number(profile?.rating) || 0,
            }
        });

    } catch (error) {
        console.error("Error fetching earnings:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getEarnings };

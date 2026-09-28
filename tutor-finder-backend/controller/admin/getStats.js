const { db } = require("../../modal/db");

// ==================== ADMIN OVERVIEW STATS ====================
const getStats = async (req, res) => {
    try {
        const [[userCounts]] = await db.promise().query(
            `
            SELECT
                SUM(role = 'student') AS students,
                SUM(role = 'tutor') AS tutors,
                SUM(role = 'admin') AS admins,
                SUM(is_suspended = TRUE) AS suspended
            FROM users
            `
        );

        const [[tutorCounts]] = await db.promise().query(
            `
            SELECT
                SUM(verified = TRUE) AS verifiedTutors,
                SUM(verified = FALSE) AS pendingTutors,
                SUM(is_active = TRUE) AS activeListings
            FROM tutor_profiles
            `
        );

        const [[bookingCounts]] = await db.promise().query(
            `
            SELECT
                COUNT(*) AS totalBookings,
                SUM(status = 'pending') AS pendingBookings,
                SUM(status = 'confirmed') AS confirmedBookings,
                SUM(status = 'completed') AS completedBookings,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS totalRevenue
            FROM bookings
            `
        );

        const [recentUsers] = await db.promise().query(
            `
            SELECT id, email, role, is_suspended, created_at
            FROM users
            WHERE role != 'admin'
            ORDER BY created_at DESC
            LIMIT 5
            `
        );

        return res.status(200).json({
            success: true,
            stats: {
                students: Number(userCounts.students) || 0,
                tutors: Number(userCounts.tutors) || 0,
                admins: Number(userCounts.admins) || 0,
                suspended: Number(userCounts.suspended) || 0,
                verifiedTutors: Number(tutorCounts.verifiedTutors) || 0,
                pendingTutors: Number(tutorCounts.pendingTutors) || 0,
                activeListings: Number(tutorCounts.activeListings) || 0,
                totalBookings: Number(bookingCounts.totalBookings) || 0,
                pendingBookings: Number(bookingCounts.pendingBookings) || 0,
                confirmedBookings: Number(bookingCounts.confirmedBookings) || 0,
                completedBookings: Number(bookingCounts.completedBookings) || 0,
                totalRevenue: Number(bookingCounts.totalRevenue) || 0,
            },
            recentUsers
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getStats };

// controllers/booking/getBookings.js
const { db } = require("../../modal/db");
const { formatBooking } = require("./createBooking");

const getBookings = async (req, res) => {
    try {
        const userId = req.user?.userId;

        // Check if email already exists
        const [user] = await db.promise().query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (user.length < 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const role = user[0].role;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const column = role === "tutor" ? "b.tutor_id" : "b.student_id";

        const [rows] = await db.promise().query(
            `
            SELECT
                b.*,
                su.firstName AS student_first_name,
                su.lastName  AS student_last_name,
                su.profile_pic AS student_profile_pic,
                tu.firstName AS tutor_first_name,
                tu.lastName  AS tutor_last_name
            FROM bookings b
            INNER JOIN users su ON b.student_id = su.id
            INNER JOIN users tu ON b.tutor_id   = tu.id
            WHERE ${column} = ?
            ORDER BY b.date DESC, b.time DESC
            `,
            [userId]
        );

        console.log(rows)

        return res.status(200).json({
            success: true,
            count: rows.length,
            bookings: rows.map(formatBooking),
        });

    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { getBookings };
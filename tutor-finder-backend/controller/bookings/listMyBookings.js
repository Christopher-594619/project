const { db } = require("../../modal/db");

// Returns the current user's bookings — their own requests if they're a
// student, or requests made to them if they're a tutor — joined with
// payment status so the frontend can decide whether to show "Pay now",
// "View receipt", etc. without a second round trip.
const listMyBookings = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const column = role === "tutor" ? "b.tutor_id" : "b.student_id";

        const [rows] = await db.promise().query(
            `SELECT
                b.*,
                s.email AS student_email,
                tu.email AS tutor_email,
                t.id AS transaction_id,
                t.status AS payment_status,
                r.receipt_number
             FROM bookings b
             JOIN users s ON s.id = b.student_id
             JOIN users tu ON tu.id = b.tutor_id
             LEFT JOIN transactions t
                ON t.booking_id = b.id AND t.status IN ('pending', 'completed')
             LEFT JOIN receipts r ON r.transaction_id = t.id
             WHERE ${column} = ?
             ORDER BY b.created_at DESC`,
            [userId]
        );

        return res.json({ success: true, bookings: rows });
    } catch (err) {
        console.error("Error listing bookings:", err);
        return res.status(500).json({ success: false, message: "Could not fetch bookings." });
    }
};

module.exports = { listMyBookings };

const { db } = require("../../modal/db");

// The tutor confirming availability is what unlocks payment for the
// student (see controller/payments/paymentService.js — it refuses to
// start a payment for a booking that isn't 'confirmed').
const respondToBooking = async (req, res) => {
    try {
        const tutorId = req.user?.userId;
        const { id } = req.params;
        const { action } = req.body; // 'confirm' | 'decline'

        if (!["confirm", "decline"].includes(action)) {
            return res.status(400).json({ success: false, message: "action must be 'confirm' or 'decline'." });
        }

        const [rows] = await db.promise().query("SELECT * FROM bookings WHERE id = ?", [id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
        const booking = rows[0];
        if (booking.tutor_id !== tutorId) {
            return res.status(403).json({ success: false, message: "This booking isn't assigned to you." });
        }
        if (booking.status !== "pending") {
            return res.status(400).json({ success: false, message: `Booking is already ${booking.status}.` });
        }

        const newStatus = action === "confirm" ? "confirmed" : "declined";
        await db.promise().query(
            `UPDATE bookings
             SET status = ?, confirmed_at = ${action === "confirm" ? "NOW()" : "NULL"}
             WHERE id = ?`,
            [newStatus, id]
        );

        const [updated] = await db.promise().query("SELECT * FROM bookings WHERE id = ?", [id]);
        return res.json({ success: true, booking: updated[0] });
    } catch (err) {
        console.error("Error responding to booking:", err);
        return res.status(500).json({ success: false, message: "Could not update booking." });
    }
};

module.exports = { respondToBooking };

const { db } = require("../../modal/db");

// What each side is allowed to do to a booking they own, keyed by
// "who is asking" -> "current status" -> allowed next statuses.
const ALLOWED_TRANSITIONS = {
    tutor: {
        pending: ["confirmed", "cancelled"],
        confirmed: ["completed", "cancelled"],
    },
    student: {
        pending: ["cancelled"],
        confirmed: ["cancelled"],
    },
};

// ==================== UPDATE BOOKING STATUS ====================
const updateBookingStatus = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const role = req.user?.role;
        const { id } = req.params;
        const { status } = req.body;

        const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const [rows] = await db.promise().query(
            "SELECT * FROM bookings WHERE id = ? LIMIT 1",
            [id]
        );

        const booking = rows[0];

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const isTutor = role === "tutor" && booking.tutor_id === userId;
        const isStudent = role === "student" && booking.student_id === userId;
        const isAdmin = role === "admin";

        if (!isTutor && !isStudent && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this booking"
            });
        }

        // Admins can override any transition for moderation; everyone else
        // follows the state machine for their side of the booking.
        if (!isAdmin) {
            const allowedForRole = ALLOWED_TRANSITIONS[isTutor ? "tutor" : "student"];
            const allowedNext = allowedForRole[booking.status] || [];

            if (!allowedNext.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot move a ${booking.status} booking to ${status}`
                });
            }
        }

        await db.promise().query(
            `
            UPDATE bookings
            SET status = ?, cancelled_by = ?
            WHERE id = ?
            `,
            [status, status === "cancelled" ? userId : null, id]
        );

        return res.status(200).json({
            success: true,
            message: "Booking updated",
            booking: { id, status }
        });

    } catch (error) {
        console.error("Error updating booking status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { updateBookingStatus };

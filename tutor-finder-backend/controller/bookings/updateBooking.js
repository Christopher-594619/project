// controllers/booking/updateBookingStatus.js
const { db } = require("../../modal/db");
const { formatBooking } = require("./createBooking");

const ALLOWED_STATUSES = ["confirmed", "cancelled", "completed"];

const updateBookingStatus = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { status } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Check if email already exists
        const [user] = await db.promise().query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const role = user[0].role;

        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
            });
        }

        // Fetch booking with student + tutor info
        const [rows] = await db.promise().query(
            `
            SELECT
                b.*,
                su.firstName AS student_first_name,
                su.lastName  AS student_last_name,
                su.profile_pic AS student_profile_pic,
                tu.firstName AS tutor_first_name,
                tu.lastName  AS tutor_last_name,
                tu.profile_pic AS tutor_profile_pic
            FROM bookings b
            INNER JOIN users su ON b.student_id = su.id
            INNER JOIN users tu ON b.tutor_id   = tu.id
            WHERE b.id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const booking = rows[0];

        // Permissions
        const isTutor = role === "tutor" && booking.tutor_id === userId;
        const isStudent = role === "student" && booking.student_id === userId;
        // Admins reach this through PATCH /api/admin/bookings/:id/status.
        const isAdmin = role === "admin";

        if (!isTutor && !isStudent && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this booking",
            });
        }

        // Admins oversee bookings but only ever cancel them
        if (isAdmin && status !== "cancelled") {
            return res.status(403).json({
                success: false,
                message: "Admins can only cancel bookings",
            });
        }

        // A session has to be agreed before it can be marked as done
        if (status === "completed" && booking.status !== "confirmed") {
            return res.status(400).json({
                success: false,
                message: "Only confirmed bookings can be marked completed",
            });
        }

        // Students can only cancel
        if (isStudent && !isTutor && status !== "cancelled") {
            return res.status(403).json({
                success: false,
                message: "Students can only cancel bookings",
            });
        }

        // Tutors can only confirm or complete (not cancel to cancelled? allow)
        if (isTutor && status === "confirmed" && booking.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending bookings can be confirmed",
            });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cannot update a cancelled booking",
            });
        }

        if (booking.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Cannot update a completed booking",
            });
        }

        // Update
        await db.promise().query(
            "UPDATE bookings SET status = ? WHERE id = ?",
            [status, id]
        );

        const updated = { ...booking, status };

        return res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            booking: formatBooking(updated),
        });

    } catch (error) {
        console.error("Error updating booking:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { updateBookingStatus };
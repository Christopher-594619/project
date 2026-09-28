const { v4: uuidv4 } = require("uuid");
const { db } = require("../../modal/db");

const VALID_DURATIONS = [30, 60, 90, 120, 150, 180];

// ==================== CREATE BOOKING (STUDENT) ====================
const createBooking = async (req, res) => {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const role = req.user?.role;

        if (role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can book a session"
            });
        }

        const { tutorId, subject, date, time, duration, notes } = req.body;

        if (!tutorId || !subject || !date || !time) {
            return res.status(400).json({
                success: false,
                message: "tutorId, subject, date and time are required"
            });
        }

        const sessionDuration = VALID_DURATIONS.includes(Number(duration)) ? Number(duration) : 60;

        // The session can't be in the past.
        const sessionDate = new Date(date);
        if (Number.isNaN(sessionDate.getTime()) || sessionDate < new Date(new Date().toDateString())) {
            return res.status(400).json({
                success: false,
                message: "Please choose a valid, upcoming date"
            });
        }

        // Look the tutor up by their user id and pull the live rate + subjects
        // straight from their profile - never trust a price from the client.
        const [tutorRows] = await db.promise().query(
            `
            SELECT tp.id AS profile_id, tp.price, tp.subjects, tp.is_active, u.role
            FROM tutor_profiles tp
            JOIN users u ON u.id = tp.user_id
            WHERE tp.user_id = ?
            LIMIT 1
            `,
            [tutorId]
        );

        const tutor = tutorRows[0];

        if (!tutor || tutor.role !== "tutor") {
            return res.status(404).json({
                success: false,
                message: "Tutor not found"
            });
        }

        if (!tutor.is_active) {
            return res.status(400).json({
                success: false,
                message: "This tutor is not currently accepting bookings"
            });
        }

        const price = Number(tutor.price) || 0;
        const totalAmount = Number((price * (sessionDuration / 60)).toFixed(2));
        const id = uuidv4();

        await db.promise().query(
            `
            INSERT INTO bookings
                (id, student_id, tutor_id, subject, session_date, session_time, duration, status, price, total_amount, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
            `,
            [id, studentId, tutorId, subject, date, time, sessionDuration, price, totalAmount, notes || null]
        );

        return res.status(201).json({
            success: true,
            message: "Booking request sent",
            booking: {
                id,
                studentId,
                tutorId,
                subject,
                date,
                time,
                duration: sessionDuration,
                status: "pending",
                price,
                totalAmount,
                notes: notes || null,
            }
        });

    } catch (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { createBooking };

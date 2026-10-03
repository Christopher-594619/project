// controllers/booking/createBooking.js
const { db } = require("../../modal/db");
const { v4: uuidv4 } = require("uuid");

// ==================== TIME HELPERS ====================
// Convert "2:00 PM" → minutes since midnight (840)
const toMinutes = (timeStr) => {
    const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;

    let [, h, m, period] = match;
    h = parseInt(h, 10);
    m = parseInt(m, 10);
    period = period.toUpperCase();

    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;

    return h * 60 + m;
};

// 1-hour minimum gap between bookings (in minutes)
const MIN_GAP_MINUTES = 60;

// ==================== CREATE BOOKING ====================
const createBooking = async (req, res) => {
    const id = uuidv4();

    try {
        const studentId = req.user?.userId;
        const {
            tutorId,
            subject,
            date,
            time,
            duration,
            notes,
            price,
        } = req.body;

        // ===== Validations =====
        if (!studentId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!tutorId || !subject || !date || !time || !duration) {
            return res.status(400).json({
                success: false,
                message: "tutorId, subject, date, time and duration are required",
            });
        }

        if (studentId === tutorId) {
            return res.status(400).json({
                success: false,
                message: "You cannot book yourself",
            });
        }

        const durationInt = parseInt(duration, 10);
        if (isNaN(durationInt) || durationInt <= 0) {
            return res.status(400).json({
                success: false,
                message: "Duration must be a positive number",
            });
        }

        const newStart = toMinutes(time);
        if (newStart === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid time format. Use '2:00 PM' style.",
            });
        }
        const newEnd = newStart + durationInt;

        // ===== Confirm tutor exists =====
        const [tutorRows] = await db.promise().query(
            "SELECT user_id FROM tutor_profiles WHERE user_id = ? AND is_active = TRUE",
            [tutorId]
        );
        if (tutorRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tutor not found",
            });
        }

        // ===== Check existing bookings for the same tutor + date =====
        const [existing] = await db.promise().query(
            `
            SELECT id, time, duration
            FROM bookings
            WHERE tutor_id = ?
              AND date = ?
              AND status IN ('pending', 'confirmed')
            `,
            [tutorId, date]
        );

        // Compare each existing booking against the new one
        for (const b of existing) {
            const existingStart = toMinutes(b.time);
            if (existingStart === null) continue;

            const existingEnd = existingStart + (parseInt(b.duration, 10) || 0);

            // Overlap check (with MIN_GAP_MINUTES buffer)
            const gapBefore = newStart - existingEnd;      // new comes after existing
            const gapAfter = existingStart - newEnd;       // new comes before existing

            const overlaps =
                newStart < existingEnd + MIN_GAP_MINUTES &&
                existingStart < newEnd + MIN_GAP_MINUTES;

            if (overlaps) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This tutor already has a session that clashes with your selected time. Please pick a slot at least 1 hour apart.",
                });
            }
        }

        // ===== Insert =====
        const totalPrice = price != null ? parseFloat(price) : 0;

        await db.promise().query(
            `
            INSERT INTO bookings
            (id, student_id, tutor_id, subject, date, time, duration, notes, price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `,
            [
                id,
                studentId,
                tutorId,
                subject,
                date,
                time,
                durationInt,
                notes || null,
                totalPrice,
            ]
        );

        // ===== Fetch back with names =====
        const [rows] = await db.promise().query(
            `
            SELECT
                b.*,
                su.firstName AS student_first_name,
                su.lastName  AS student_last_name,
                tu.firstName AS tutor_first_name,
                tu.lastName  AS tutor_last_name
            FROM bookings b
            INNER JOIN users su ON b.student_id = su.id
            INNER JOIN users tu ON b.tutor_id   = tu.id
            WHERE b.id = ?
            `,
            [id]
        );

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: formatBooking(rows[0]),
        });

    } catch (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ============ HELPER ============
const formatBooking = (row) => {
    if (!row) return null;

    const studentName = [row.student_first_name, row.student_last_name]
        .filter(Boolean).join(" ").trim() || "Student";
    const tutorName = [row.tutor_first_name, row.tutor_last_name]
        .filter(Boolean).join(" ").trim() || "Tutor";

    return {
        id: row.id,
        studentId: row.student_id,
        studentName,
        studentProfilePic: row.student_profile_pic || null,
        tutorId: row.tutor_id,
        tutorName,
        tutorProfilePic: row.tutor_profile_pic || null,
        subject: row.subject,
        date: row.date,
        time: row.time,
        duration: row.duration,
        notes: row.notes,
        price: parseFloat(row.price) || 0,
        status: row.status,
        createdAt: row.created_at,
    };
};

module.exports = { createBooking, formatBooking };

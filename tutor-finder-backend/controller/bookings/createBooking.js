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

        // ===== Reject sessions in the past =====
        const dateMatch = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!dateMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Use YYYY-MM-DD.",
            });
        }
        const sessionStart = new Date(
            Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]),
            Math.floor(newStart / 60), newStart % 60
        );
        if (sessionStart <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "That time has already passed. Please choose a future date and time.",
            });
        }

        // ===== Check and insert inside one transaction =====
        // Concurrency: two simultaneous requests could otherwise both run the
        // clash check before either inserts, and both succeed (double
        // booking). Locking the tutor's profile row (SELECT ... FOR UPDATE)
        // makes concurrent bookings for the same tutor run one at a time:
        // the second waits until the first has committed, then sees its
        // booking in the clash check. Bookings for other tutors don't wait.
        const conn = await db.promise().getConnection();
        try {
            await conn.beginTransaction();
            const reject = async (status, message) => {
                await conn.rollback();
                return res.status(status).json({ success: false, message });
            };

            // Confirm tutor exists. The price is read here so the booking
            // uses the tutor's real hourly rate, not what the browser sends.
            const [tutorRows] = await conn.query(
                "SELECT user_id, price, verified FROM tutor_profiles WHERE user_id = ? AND is_active = TRUE FOR UPDATE",
                [tutorId]
            );
            if (tutorRows.length === 0) {
                return reject(404, "Tutor not found");
            }
            // Only tutors verified by an admin can take bookings
            if (!tutorRows[0].verified) {
                return reject(403, "This tutor has not been verified yet, so they can't take bookings.");
            }

            // Existing active bookings for the same tutor and date. A locking
            // read sees the latest committed rows, including ones committed
            // by a request that held the lock just before this one.
            const [existing] = await conn.query(
                `
                SELECT id, time, duration
                FROM bookings
                WHERE tutor_id = ?
                  AND date = ?
                  AND status IN ('pending', 'confirmed')
                FOR UPDATE
                `,
                [tutorId, date]
            );

            // Overlap check, with a MIN_GAP_MINUTES buffer either side
            for (const b of existing) {
                const existingStart = toMinutes(b.time);
                if (existingStart === null) continue;
                const existingEnd = existingStart + (parseInt(b.duration, 10) || 0);

                const overlaps =
                    newStart < existingEnd + MIN_GAP_MINUTES &&
                    existingStart < newEnd + MIN_GAP_MINUTES;

                if (overlaps) {
                    return reject(
                        409,
                        "This tutor already has a session that clashes with your selected time. Please pick a slot at least 1 hour apart."
                    );
                }
            }

            // The tutor's current hourly rate, snapshotted onto the booking.
            const totalPrice = parseFloat(tutorRows[0].price) || 0;

            await conn.query(
                `
                INSERT INTO bookings
                (id, student_id, tutor_id, subject, date, time, duration, notes, price, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                `,
                [id, studentId, tutorId, subject, date, time, durationInt, notes || null, totalPrice]
            );

            await conn.commit();
        } catch (err) {
            await conn.rollback().catch(() => {});
            throw err;
        } finally {
            conn.release();
        }
        if (res.headersSent) return; // rejected inside the transaction

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

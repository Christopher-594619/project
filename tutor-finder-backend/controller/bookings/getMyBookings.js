const { db } = require("../../modal/db");

const dateStr = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const mapRow = (row) => ({
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name || row.student_email,
    studentAvatar: (row.student_name || row.student_email || "S")[0].toUpperCase(),
    tutorId: row.tutor_id,
    tutorName: row.tutor_name || row.tutor_email,
    tutorAvatar: (row.tutor_name || row.tutor_email || "T")[0].toUpperCase(),
    subject: row.subject,
    date: dateStr(row.session_date),
    time: row.session_time,
    duration: row.duration,
    status: row.status,
    price: Number(row.price),
    totalAmount: Number(row.total_amount),
    notes: row.notes,
    createdAt: row.created_at,
});

// ==================== LIST MY BOOKINGS (STUDENT OR TUTOR) ====================
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const role = req.user?.role;

        if (role !== "student" && role !== "tutor") {
            return res.status(403).json({
                success: false,
                message: "Only students and tutors have bookings"
            });
        }

        const { scope, status } = req.query;
        const ownerColumn = role === "student" ? "b.student_id" : "b.tutor_id";

        const where = [`${ownerColumn} = ?`];
        const params = [userId];

        if (status) {
            where.push("b.status = ?");
            params.push(status);
        }

        let order = "b.session_date DESC, b.session_time DESC";

        if (scope === "upcoming") {
            where.push("b.status IN ('pending', 'confirmed')");
            order = "b.session_date ASC, b.session_time ASC";
        } else if (scope === "history") {
            where.push("b.status IN ('completed', 'cancelled')");
        }

        const [rows] = await db.promise().query(
            `
            SELECT
                b.*,
                s.name AS student_name, s.email AS student_email,
                t.name AS tutor_name, t.email AS tutor_email
            FROM bookings b
            JOIN users s ON s.id = b.student_id
            JOIN users t ON t.id = b.tutor_id
            WHERE ${where.join(" AND ")}
            ORDER BY ${order}
            `,
            params
        );

        return res.status(200).json({
            success: true,
            bookings: rows.map(mapRow)
        });

    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getMyBookings, mapRow };

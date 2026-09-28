const { db } = require("../../modal/db");
const { mapRow } = require("../bookings/getMyBookings");

// ==================== LIST ALL BOOKINGS (ADMIN) ====================
const getBookings = async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const status = req.query.status || "all";
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
        const offset = (page - 1) * limit;

        const where = [];
        const params = [];

        if (search) {
            where.push("(s.name LIKE ? OR s.email LIKE ? OR t.name LIKE ? OR t.email LIKE ? OR b.subject LIKE ?)");
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status !== "all") {
            where.push("b.status = ?");
            params.push(status);
        }

        const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const [[{ total }]] = await db.promise().query(
            `
            SELECT COUNT(*) AS total
            FROM bookings b
            JOIN users s ON s.id = b.student_id
            JOIN users t ON t.id = b.tutor_id
            ${whereClause}
            `,
            params
        );

        const [rows] = await db.promise().query(
            `
            SELECT
                b.*,
                s.name AS student_name, s.email AS student_email,
                t.name AS tutor_name, t.email AS tutor_email
            FROM bookings b
            JOIN users s ON s.id = b.student_id
            JOIN users t ON t.id = b.tutor_id
            ${whereClause}
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        );

        return res.status(200).json({
            success: true,
            bookings: rows.map(mapRow),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1
            }
        });
    } catch (error) {
        console.error("Error fetching bookings (admin):", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getBookings };

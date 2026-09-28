const { db } = require("../../modal/db");
const { parseProfile } = require("../tutors/parseProfile");

// ==================== LIST TUTORS (ADMIN) ====================
const getTutors = async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const status = req.query.status || "all"; // all | verified | pending | suspended
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
        const offset = (page - 1) * limit;

        const where = [];
        const params = [];

        if (search) {
            where.push("(u.email LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)");
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status === "verified") where.push("tp.verified = TRUE");
        if (status === "pending") where.push("tp.verified = FALSE");
        if (status === "suspended") where.push("u.is_suspended = TRUE");

        const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const [[{ total }]] = await db.promise().query(
            `
            SELECT COUNT(*) AS total
            FROM tutor_profiles tp
            JOIN users u ON u.id = tp.user_id
            ${whereClause}
            `,
            params
        );

        const [rows] = await db.promise().query(
            `
            SELECT
                tp.*,
                u.name AS tutor_name,
                u.email AS tutor_email,
                u.phone AS tutor_phone,
                u.name AS tutor_name,
                u.is_suspended,
                u.suspended_reason,
                u.created_at AS user_created_at
            FROM tutor_profiles tp
            JOIN users u ON u.id = tp.user_id
            ${whereClause}
            ORDER BY tp.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        );

        const tutors = rows.map((row) => ({
            ...parseProfile(row),
            isSuspended: Boolean(row.is_suspended),
            suspendedReason: row.suspended_reason,
        }));

        return res.status(200).json({
            success: true,
            tutors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1
            }
        });
    } catch (error) {
        console.error("Error fetching tutors:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getTutors };

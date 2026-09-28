const { db } = require("../../modal/db");

// ==================== LIST STUDENTS (ADMIN) ====================
// Deliberately scoped to students - tutors have their own richer listing
// (getTutors) because they carry a tutor_profiles row.
const getUsers = async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
        const offset = (page - 1) * limit;

        const where = ["role = 'student'"];
        const params = [];

        if (search) {
            where.push("(email LIKE ? OR name LIKE ? OR phone LIKE ?)");
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = `WHERE ${where.join(" AND ")}`;

        const [[{ total }]] = await db.promise().query(
            `SELECT COUNT(*) AS total FROM users ${whereClause}`,
            params
        );

        const [rows] = await db.promise().query(
            `
            SELECT id, email, phone, name, role, is_suspended, suspended_reason, created_at
            FROM users
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        );

        return res.status(200).json({
            success: true,
            users: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getUsers };

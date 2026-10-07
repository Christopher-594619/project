// controllers/review/reviewController.js
const { db } = require("../../modal/db");
const { v4: uuidv4 } = require("uuid");

// ============ CREATE REVIEW ============
const addReview = async (req, res) => {
    const id = uuidv4();

    try {
        const studentId = req.user?.userId;
        const { tutorId, rating, comment } = req.body;

        if (!studentId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!tutorId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "tutorId, rating and comment are required",
            });
        }

        const r = parseInt(rating, 10);
        if (isNaN(r) || r < 1 || r > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        if (studentId === tutorId) {
            return res.status(400).json({
                success: false,
                message: "You cannot review yourself",
            });
        }

        // Prevent duplicate review
        const [existing] = await db.promise().query(
            "SELECT id FROM reviews WHERE student_id = ? AND tutor_id = ?",
            [studentId, tutorId]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this tutor",
            });
        }

        // Insert review
        await db.promise().query(
            `
            INSERT INTO reviews (id, tutor_id, student_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
            `,
            [id, tutorId, studentId, r, comment.trim() || null]
        );

        // Recalculate tutor rating + reviews_count
        const [[stats]] = await db.promise().query(
            `
            SELECT
                COUNT(*) AS count,
                COALESCE(AVG(rating), 0) AS avg
            FROM reviews
            WHERE tutor_id = ?
            `,
            [tutorId]
        );

        await db.promise().query(
            `
            UPDATE tutor_profiles
            SET rating = ?, reviews_count = ?
            WHERE user_id = ?
            `,
            [Number(stats.avg).toFixed(2), stats.count, tutorId]
        );

        // Return the newly created review (with student info)
        const [rows] = await db.promise().query(
            `
            SELECT
                r.*,
                u.firstName AS student_first_name,
                u.lastName  AS student_last_name,
                u.profile_pic AS student_profile_pic
            FROM reviews r
            INNER JOIN users u ON r.student_id = u.id
            WHERE r.id = ?
            `,
            [id]
        );

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review: formatReview(rows[0]),
        });

    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ============ GET REVIEWS FOR A TUTOR ============
const getTutorReviews = async (req, res) => {
    try {
        const { tutorId } = req.params;

        const [rows] = await db.promise().query(
            `
            SELECT
                r.*,
                u.firstName AS student_first_name,
                u.lastName  AS student_last_name,
                u.profile_pic AS student_profile_pic
            FROM reviews r
            INNER JOIN users u ON r.student_id = u.id
            WHERE r.tutor_id = ?
            ORDER BY r.created_at DESC
            `,
            [tutorId]
        );

        const reviews = rows.map(formatReview);

        const count = reviews.length;
        const average = count
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / count
            : 0;

        return res.status(200).json({
            success: true,
            count,
            average: Number(average.toFixed(2)),
            reviews,
        });

    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ============ HELPER ============
const formatReview = (row) => {
    if (!row) return null;
    const name = [row.student_first_name, row.student_last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "Student";

    return {
        id: row.id,
        tutorId: row.tutor_id,
        studentId: row.student_id,
        studentName: name,
        studentProfilePic: row.student_profile_pic || null,
        studentAvatar: row.student_profile_pic || name.slice(0, 2).toUpperCase(),
        rating: row.rating,
        comment: row.comment,
        date: row.created_at,
    };
};

module.exports = { addReview, getTutorReviews };
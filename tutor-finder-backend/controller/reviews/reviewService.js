// controller/reviews/reviewService.js
const { v4: uuidv4 } = require("uuid");
const { db } = require("../../modal/db");

class ReviewError extends Error {}

// A student can only review a tutor once they've actually paid for (and
// therefore had) a session with them.
async function assertHasCompletedSession(studentId, tutorId) {
    const [rows] = await db.promise().query(
        `SELECT booking_id FROM transactions
         WHERE student_id = ? AND tutor_id = ? AND status = 'completed'
         ORDER BY completed_at DESC LIMIT 1`,
        [studentId, tutorId]
    );
    if (!rows.length) {
        throw new ReviewError(
            "You can only review a tutor after completing a paid session with them."
        );
    }
    return rows[0].booking_id;
}

// Recomputes the average rating and count from `reviews` and writes them
// onto tutor_profiles — the field the rest of the app already reads
// (getAllTutors, getTutorProfile, parseProfile).
async function syncTutorProfileRating(tutorId) {
    const [[agg]] = await db.promise().query(
        `SELECT COUNT(*) AS review_count, COALESCE(AVG(rating), 0) AS average_rating
         FROM reviews WHERE tutor_id = ?`,
        [tutorId]
    );
    await db.promise().query(
        `UPDATE tutor_profiles SET rating = ?, reviews_count = ? WHERE user_id = ?`,
        [Math.round(Number(agg.average_rating) * 100) / 100, agg.review_count, tutorId]
    );
}

async function submitReview({ studentId, tutorId, rating, comment }) {
    if (studentId === tutorId) {
        throw new ReviewError("You can't review yourself.");
    }
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        throw new ReviewError("Rating must be a whole number between 1 and 5.");
    }
    if (!comment || !comment.trim()) {
        throw new ReviewError("Please write a comment.");
    }

    const [tutorRows] = await db.promise().query(
        "SELECT id FROM users WHERE id = ? AND role = 'tutor'",
        [tutorId]
    );
    if (!tutorRows.length) {
        throw new ReviewError("Tutor not found.");
    }

    const bookingId = await assertHasCompletedSession(studentId, tutorId);

    const id = uuidv4();
    await db.promise().query(
        `INSERT INTO reviews (id, tutor_id, student_id, booking_id, rating, comment)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             rating = VALUES(rating),
             comment = VALUES(comment),
             booking_id = VALUES(booking_id),
             updated_at = NOW()`,
        [id, tutorId, studentId, bookingId, ratingNum, comment.trim()]
    );

    await syncTutorProfileRating(tutorId);

    const [rows] = await db.promise().query(
        "SELECT * FROM reviews WHERE student_id = ? AND tutor_id = ?",
        [studentId, tutorId]
    );
    return rows[0];
}

async function getReviewsForTutor(tutorId) {
    const [reviews] = await db.promise().query(
        `SELECT r.id, r.tutor_id, r.student_id, r.rating, r.comment,
                r.created_at, r.updated_at,
                COALESCE(u.name, u.email) AS student_name
         FROM reviews r
         JOIN users u ON u.id = r.student_id
         WHERE r.tutor_id = ?
         ORDER BY r.created_at DESC`,
        [tutorId]
    );

    const [[agg]] = await db.promise().query(
        `SELECT COUNT(*) AS review_count, COALESCE(AVG(rating), 0) AS average_rating
         FROM reviews WHERE tutor_id = ?`,
        [tutorId]
    );

    return {
        reviews,
        averageRating: Math.round(Number(agg.average_rating) * 10) / 10,
        reviewCount: agg.review_count,
    };
}

async function getMyReview(studentId, tutorId) {
    const [rows] = await db.promise().query(
        "SELECT * FROM reviews WHERE student_id = ? AND tutor_id = ?",
        [studentId, tutorId]
    );
    return rows[0] || null;
}

async function deleteReview(reviewId, studentId) {
    const [rows] = await db.promise().query("SELECT tutor_id FROM reviews WHERE id = ? AND student_id = ?", [
        reviewId,
        studentId,
    ]);
    if (!rows.length) {
        throw new ReviewError("Review not found.");
    }
    const { tutor_id: tutorId } = rows[0];

    await db.promise().query("DELETE FROM reviews WHERE id = ?", [reviewId]);
    await syncTutorProfileRating(tutorId);
}

module.exports = {
    submitReview,
    getReviewsForTutor,
    getMyReview,
    deleteReview,
    ReviewError,
};

// routes/reviews.js
const express = require("express");
const { authenticate } = require("../controller/auth/authenticate");
const {
    submitReview,
    getReviewsForTutor,
    getMyReview,
    deleteReview,
    ReviewError,
} = require("../controller/reviews/reviewService");

const reviews = express.Router();

// Public — anyone browsing a tutor's profile can see their reviews.
reviews.get("/tutor/:tutorId", async (req, res) => {
    try {
        const data = await getReviewsForTutor(req.params.tutorId);
        return res.json({ success: true, ...data });
    } catch (err) {
        console.error("Error fetching reviews:", err);
        return res.status(500).json({ success: false, message: "Could not fetch reviews." });
    }
});

// The logged-in student's own review for a tutor, if any — used to switch
// the UI between "Write a Review" and "Edit your review".
reviews.get("/tutor/:tutorId/mine", authenticate, async (req, res) => {
    try {
        const review = await getMyReview(req.user.userId, req.params.tutorId);
        return res.json({ success: true, review });
    } catch (err) {
        console.error("Error fetching your review:", err);
        return res.status(500).json({ success: false, message: "Could not fetch your review." });
    }
});

// Create or update the logged-in student's review for a tutor. Requires a
// completed (paid) session with that tutor — enforced in reviewService.
reviews.post("/", authenticate, async (req, res) => {
    if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Only students can leave reviews." });
    }
    const { tutor_id, rating, comment } = req.body;
    if (!tutor_id || rating === undefined || rating === null) {
        return res.status(400).json({ success: false, message: "tutor_id and rating are required." });
    }

    try {
        const review = await submitReview({
            studentId: req.user.userId,
            tutorId: tutor_id,
            rating,
            comment,
        });
        return res.status(201).json({ success: true, review });
    } catch (err) {
        if (err instanceof ReviewError) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error("Error submitting review:", err);
        return res.status(500).json({ success: false, message: "Could not submit review." });
    }
});

reviews.delete("/:id", authenticate, async (req, res) => {
    try {
        await deleteReview(req.params.id, req.user.userId);
        return res.json({ success: true });
    } catch (err) {
        if (err instanceof ReviewError) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error("Error deleting review:", err);
        return res.status(500).json({ success: false, message: "Could not delete review." });
    }
});

module.exports = { reviews };

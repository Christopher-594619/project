const { db } = require("../../modal/db");
const { v4: uuidv4 } = require("uuid");

const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const [rows] = await db.promise().query(
            `SELECT id, type, message, read_at, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [userId]
        );

        return res.json({
            success: true,
            notifications: rows.map((notification) => ({
                id: notification.id,
                type: notification.type,
                message: notification.message,
                read: notification.read_at !== null,
                time: notification.created_at,
            })),
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const [result] = await db.promise().query(
            "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
            [req.params.id, userId]
        );

        return res.json({ success: true, updated: result.affectedRows > 0 });
    } catch (error) {
        console.error("Error marking notification read:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const createBookingNotification = async (req, res) => {
    try {
        const studentId = req.user?.userId || req.user?.id;
        const { tutorUserId, tutorName, studentName, date, time, duration, notes } = req.body;

        if (!studentId || !tutorUserId || !date || !time || !duration) {
            return res.status(400).json({
                success: false,
                message: "Tutor, date, time, and duration are required",
            });
        }

        const message = `${studentName || "A student"} requested a ${duration}-minute session with you on ${date} at ${time}.${notes ? ` Note: ${notes}` : ""}`;

        await db.promise().query(
            `INSERT INTO notifications (id, user_id, type, message)
             VALUES (?, ?, 'booking', ?)`,
            [uuidv4(), tutorUserId, message]
        );

        return res.status(201).json({
            success: true,
            message: `Booking request sent to ${tutorName || "the tutor"}`,
        });
    } catch (error) {
        console.error("Error creating booking notification:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { getNotifications, markNotificationRead, createBookingNotification };
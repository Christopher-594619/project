// controllers/chats/unreadCount.js
const { db } = require("../../modal/db");

// How many messages sent to the current user they haven't opened yet.
// Messages are marked read when the receiver opens the chat (see getMessages).
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const [[row]] = await db.promise().query(
            "SELECT COUNT(*) AS unread FROM messages WHERE receiver_id = ? AND read_at IS NULL",
            [userId]
        );

        return res.status(200).json({ success: true, unread: Number(row.unread) || 0 });
    } catch (error) {
        console.error("Error counting unread messages:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { getUnreadCount };

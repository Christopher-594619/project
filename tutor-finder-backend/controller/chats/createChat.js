// controllers/chat/createOrGetChat.js
const { db } = require("../../modal/db");
const { v4: uuidv4 } = require("uuid");

const createOrGetChat = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { studentId, tutorId } = req.body;

        if (!studentId || !tutorId) {
            return res.status(400).json({
                success: false,
                message: "studentId and tutorId are required",
            });
        }

        // Caller must be one of the two
        if (userId !== studentId && userId !== tutorId) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this chat",
            });
        }

        // Return existing chat if it already exists
        const [existing] = await db.promise().query(
            "SELECT id FROM chats WHERE student_id = ? AND tutor_id = ? LIMIT 1",
            [studentId, tutorId]
        );

        if (existing.length > 0) {
            return res.status(200).json({
                success: true,
                created: false,
                chat: { id: existing[0].id },
            });
        }

        // Create new chat
        const id = uuidv4();
        await db.promise().query(
            "INSERT INTO chats (id, student_id, tutor_id) VALUES (?, ?, ?)",
            [id, studentId, tutorId]
        );

        return res.status(201).json({
            success: true,
            created: true,
            chat: { id },
        });

    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { createOrGetChat };
// controllers/message/messageController.js
const { db } = require("../../modal/db");
const { v4: uuidv4 } = require("uuid");

const formatMessage = (row) => ({
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    readAt: row.read_at,
    createdAt: row.created_at,
});

// ============ SEND MESSAGE ============
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user?.userId;
        if (!senderId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { chatId, receiverId, content } = req.body;

        if (!chatId || !receiverId || !content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "chatId, receiverId and content are required",
            });
        }

        // Verify chat membership
        const [chatRows] = await db.promise().query(
            "SELECT student_id, tutor_id FROM chats WHERE id = ?",
            [chatId]
        );
        if (chatRows.length === 0) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        const chat = chatRows[0];
        const isMember = chat.student_id === senderId || chat.tutor_id === senderId;
        if (!isMember) {
            return res.status(403).json({ success: false, message: "Not part of this chat" });
        }

        const id = uuidv4();
        await db.promise().query(
            `
            INSERT INTO messages (id, chat_id, sender_id, receiver_id, content)
            VALUES (?, ?, ?, ?, ?)
            `,
            [id, chatId, senderId, receiverId, content.trim()]
        );

        const [rows] = await db.promise().query(
            "SELECT * FROM messages WHERE id = ?",
            [id]
        );

        return res.status(201).json({
            success: true,
            message: formatMessage(rows[0]),
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ============ GET MESSAGES (with optional since) ============
const getMessages = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { chatId } = req.params;
        const since = req.query.since || null; // ISO timestamp

        // Verify chat membership + fetch other user's info
        const [chatRows] = await db.promise().query(
            `
            SELECT
                c.student_id,
                c.tutor_id,
                s.id AS s_id,
                s.firstName AS s_first,
                s.lastName  AS s_last,
                s.profile_pic AS s_pic,
                s.role AS s_role,
                t.id AS t_id,
                t.firstName AS t_first,
                t.lastName  AS t_last,
                t.profile_pic AS t_pic,
                t.role AS t_role
            FROM chats c
            INNER JOIN users s ON c.student_id = s.id
            INNER JOIN users t ON c.tutor_id   = t.id
            WHERE c.id = ?
            `,
            [chatId]
        );
        if (chatRows.length === 0) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        const chat = chatRows[0];
        const isMember = chat.student_id === userId || chat.tutor_id === userId;
        if (!isMember) {
            return res.status(403).json({ success: false, message: "Not part of this chat" });
        }

        // Build "other user" object (the one who is NOT the current user)
        const isCurrentUserStudent = chat.student_id === userId;

        const other = isCurrentUserStudent
            ? {
                  id: chat.t_id,
                  name: [chat.t_first, chat.t_last].filter(Boolean).join(' ').trim() || 'Tutor',
                  profilePic: chat.t_pic || null,
                  role: chat.t_role || 'tutor',
              }
            : {
                  id: chat.s_id,
                  name: [chat.s_first, chat.s_last].filter(Boolean).join(' ').trim() || 'Student',
                  profilePic: chat.s_pic || null,
                  role: chat.s_role || 'student',
              };

        // ---- Fetch messages ----
        let sql = `
            SELECT * FROM messages
            WHERE chat_id = ?
        `;
        const params = [chatId];

        if (since) {
            sql += ` AND created_at > ?`;
            params.push(since);
        }

        sql += ` ORDER BY created_at ASC`;

        const [rows] = await db.promise().query(sql, params);

        // Mark incoming messages as read (best-effort)
        await db.promise().query(
            `
            UPDATE messages
            SET read_at = NOW()
            WHERE chat_id = ?
              AND receiver_id = ?
              AND read_at IS NULL
            `,
            [chatId, userId]
        );

        return res.status(200).json({
            success: true,
            count: rows.length,
            chat: {
                id: chatId,
                studentId: chat.student_id,
                tutorId: chat.tutor_id,
                other,
            },
            messages: rows.map(formatMessage),
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
module.exports = { sendMessage, getMessages };
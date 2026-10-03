// controllers/chats/getUserChats.js
const { db } = require("../../modal/db");

const getUserChats = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const [rows] = await db.promise().query(
            `
            SELECT
                c.id AS chat_id,
                c.student_id,
                c.tutor_id,
                c.updated_at AS chat_updated_at,

                s.id           AS s_id,
                s.firstName    AS s_first,
                s.lastName     AS s_last,
                s.profile_pic  AS s_pic,
                s.role         AS s_role,

                t.id           AS t_id,
                t.firstName    AS t_first,
                t.lastName     AS t_last,
                t.profile_pic  AS t_pic,
                t.role         AS t_role,

                m.id           AS msg_id,
                m.sender_id    AS msg_sender_id,
                m.receiver_id  AS msg_receiver_id,
                m.content      AS msg_content,
                m.read_at      AS msg_read_at,
                m.created_at   AS msg_created_at

            FROM chats c

            INNER JOIN users s ON c.student_id = s.id
            INNER JOIN users t ON c.tutor_id   = t.id

            LEFT JOIN messages m
                ON m.id = (
                    SELECT id FROM messages
                    WHERE chat_id = c.id
                    ORDER BY created_at DESC
                    LIMIT 1
                )

            WHERE c.student_id = ? OR c.tutor_id = ?

            ORDER BY
                COALESCE(m.created_at, c.created_at) DESC
            `,
            [userId, userId]
        );

        const chats = rows.map((r) => {
            const isCurrentUserStudent = r.student_id === userId;

            const other = isCurrentUserStudent
                ? {
                      id: r.t_id,
                      name: [r.t_first, r.t_last].filter(Boolean).join(' ').trim() || 'Tutor',
                      profilePic: r.t_pic || null,
                      role: r.t_role || 'tutor',
                  }
                : {
                      id: r.s_id,
                      name: [r.s_first, r.s_last].filter(Boolean).join(' ').trim() || 'Student',
                      profilePic: r.s_pic || null,
                      role: r.s_role || 'student',
                  };

            const lastMessage = r.msg_id
                ? {
                      id: r.msg_id,
                      senderId: r.msg_sender_id,
                      receiverId: r.msg_receiver_id,
                      content: r.msg_content,
                      readAt: r.msg_read_at,
                      createdAt: r.msg_created_at,
                      isMine: r.msg_sender_id === userId,
                  }
                : null;

            return {
                id: r.chat_id,
                studentId: r.student_id,
                tutorId: r.tutor_id,
                other,
                lastMessage,
                updatedAt: r.msg_created_at || r.chat_updated_at,
            };
        });

        return res.status(200).json({
            success: true,
            count: chats.length,
            chats,
        });

    } catch (error) {
        console.error("Error fetching user chats:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { getUserChats };
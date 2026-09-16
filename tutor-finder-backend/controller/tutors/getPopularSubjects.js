const getFeaturedTutors = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `
            SELECT tp.*, u.name AS tutor_name, u.email AS tutor_email
            FROM tutor_profiles tp
            INNER JOIN users u ON tp.user_id = u.id
            WHERE tp.is_active = TRUE AND tp.rating >= 4.5
            ORDER BY tp.rating DESC, tp.reviews_count DESC
            LIMIT 6
            `
        );

        return res.status(200).json({
            success: true,
            tutors: rows.map(parseProfile)
        });
    } catch (error) {
        console.error('Error fetching featured tutors:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
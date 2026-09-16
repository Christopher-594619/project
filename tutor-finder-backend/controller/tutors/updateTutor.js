// ==================== UPDATE TUTOR PROFILE ====================
const updateTutorProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const {
            photo, bio, subjects, levels, price, mode,
            availability, experience, qualifications,
            languages, location, skills, education
        } = req.body;

        const [existing] = await db.promise().query(
            "SELECT id FROM tutor_profiles WHERE user_id = ?",
            [userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tutor profile not found"
            });
        }

        await db.promise().query(
            `
            UPDATE tutor_profiles SET
                photo = ?,
                bio = ?,
                subjects = ?,
                levels = ?,
                price = ?,
                mode = ?,
                availability = ?,
                experience = ?,
                qualifications = ?,
                languages = ?,
                location = ?,
                skills = ?,
                education = ?
            WHERE user_id = ?
            `,
            [
                photo,
                bio,
                JSON.stringify(subjects),
                JSON.stringify(levels),
                price,
                mode,
                JSON.stringify(availability),
                experience,
                JSON.stringify(qualifications),
                JSON.stringify(languages),
                location,
                JSON.stringify(skills),
                JSON.stringify(education),
                userId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Error updating tutor profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
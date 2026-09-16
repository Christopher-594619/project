// controllers/user/userController.js
const { db } = require("../../modal/db");


const updateUserLocation = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { lat, lng } = req.body;

        console.log(lat, lng);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (lat == null || lng == null) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        await db.promise().query(
            `UPDATE tutor_profiles SET latitude = ?, longitude = ? WHERE user_id = ?`,
            [lat, lng, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Location updated successfully",
            location: { lat, lng }
        });

    } catch (error) {
        console.error("Error updating location:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { updateUserLocation };
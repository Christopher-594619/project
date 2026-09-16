// controllers/tutor/tutorController.js
const { db } = require("../../modal/db");
const { parseProfile } = require("../tutors/parseProfile");

const getAllTutors = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        const userLat = lat != null && lat !== '' ? parseFloat(lat) : null;
        const userLng = lng != null && lng !== '' ? parseFloat(lng) : null;

        const hasUserLocation =
            userLat !== null &&
            userLng !== null &&
            !isNaN(userLat) &&
            !isNaN(userLng);

        // Haversine distance in km. NULL when user has no location.
        const distanceSelect = hasUserLocation
            ? `
                (
                    6371 * ACOS(
                        LEAST(1, GREATEST(-1,
                            COS(RADIANS(?)) *
                            COS(RADIANS(tp.latitude)) *
                            COS(RADIANS(tp.longitude) - RADIANS(?)) +
                            SIN(RADIANS(?)) *
                            SIN(RADIANS(tp.latitude))
                        ))
                    )
                ) AS distance
            `
            : `NULL AS distance`;

        const params = hasUserLocation ? [userLat, userLng, userLat] : [];

        const [rows] = await db.promise().query(
            `
            SELECT
                tp.*,

                u.id AS user_id,
                u.email AS tutor_email,
                u.phone AS tutor_phone,
                tp.bio AS tutor_bio,
                tp.photo AS tutor_profile_pic,

                tp.latitude,
                tp.longitude,

                ${distanceSelect}

            FROM tutor_profiles tp

            INNER JOIN users u
                ON tp.user_id = u.id

            WHERE tp.is_active = TRUE

            ORDER BY
                ${hasUserLocation ? 'distance ASC,' : ''}
                tp.rating DESC,
                tp.reviews_count DESC
            `,
            params
        );

        const tutors = rows.map((row) => ({
            ...parseProfile(row),
            distance:
                row.distance != null
                    ? parseFloat(Number(row.distance).toFixed(2))
                    : null,
        }));

        return res.status(200).json({
            success: true,
            count: tutors.length,
            userLocation: hasUserLocation
                ? { lat: userLat, lng: userLng }
                : null,
            tutors,
        });

    } catch (error) {
        console.error("Error fetching tutors:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getAllTutors };
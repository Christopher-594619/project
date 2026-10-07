const { db } = require("../../modal/db");
const { parseProfile } = require("./parseProfile");

// ==================== GET TUTOR PROFILE ====================
const getTutorProfile = async (req, res) => {
    try {
        const { id } = req.params;
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

        const params = hasUserLocation
            ? [userLat, userLng, userLat, id, id]
            : [id, id];

        const [rows] = await db.promise().query(
            `
            SELECT
                tp.*,

                tp.latitude,
                tp.longitude,

                u.id AS user_id,
                u.email AS tutor_email,
                u.phone AS tutor_phone,
                u.firstName AS tutor_first_name,
                u.lastName AS tutor_last_name,
                u.bio AS tutor_bio,
                u.profile_pic AS tutor_profile_pic,

                ${distanceSelect}

            FROM tutor_profiles tp

            INNER JOIN users u
                ON tp.user_id = u.id

            WHERE tp.id = ?
               OR tp.user_id = ?

            LIMIT 1
            `,
            params
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tutor profile not found"
            });
        }

        const row = rows[0];

        const tutor = {
            ...parseProfile(row),
            distance:
                row.distance != null
                    ? parseFloat(Number(row.distance).toFixed(2))
                    : null,
        };

        return res.status(200).json({
            success: true,
            userLocation: hasUserLocation
                ? { lat: userLat, lng: userLng }
                : null,
            tutor
        });

    } catch (error) {
        console.error("Error fetching tutor profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getTutorProfile };
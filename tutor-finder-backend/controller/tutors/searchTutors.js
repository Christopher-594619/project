// controllers/tutor/tutorController.js
const { db } = require("../../modal/db");
const { parseProfile } = require("../tutors/parseProfile");

const searchTutors = async (req, res) => {
    try {
        const {
            q, subject, level, mode, rating, distance,
            minPrice, maxPrice, availability,
            lat, lng                 // <-- user coordinates from frontend
        } = req.query;

        const userLat = lat != null && lat !== '' ? parseFloat(lat) : null;
        const userLng = lng != null && lng !== '' ? parseFloat(lng) : null;
        const hasUserLocation =
            userLat !== null && userLng !== null &&
            !isNaN(userLat) && !isNaN(userLng);

        // Haversine formula (in miles). If no user location → NULL distance.
        const distanceSelect = hasUserLocation
            ? `
                (
                    3959 * ACOS(
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

        let sql = `
            SELECT
                tp.*,
                u.name AS tutor_name,
                u.email AS tutor_email,
                u.phone AS tutor_phone,
                ${distanceSelect}
            FROM tutor_profiles tp
            INNER JOIN users u ON tp.user_id = u.id
            WHERE tp.is_active = TRUE
        `;

        const params = [];
        if (hasUserLocation) {
            params.push(userLat, userLng, userLat);
        }

        // ===== Filters =====
        if (q) {
            sql += ` AND (
                u.name LIKE ? OR
                tp.bio LIKE ? OR
                tp.location LIKE ? OR
                JSON_SEARCH(tp.subjects, 'one', ?) IS NOT NULL OR
                JSON_SEARCH(tp.skills, 'one', ?) IS NOT NULL
            )`;
            const like = `%${q}%`;
            params.push(like, like, like, like, like);
        }

        if (subject) {
            sql += ` AND JSON_SEARCH(tp.subjects, 'one', ?) IS NOT NULL`;
            params.push(subject);
        }

        if (level) {
            sql += ` AND JSON_SEARCH(tp.levels, 'one', ?) IS NOT NULL`;
            params.push(level);
        }

        if (mode) {
            sql += ` AND (tp.mode = ? OR tp.mode = 'both')`;
            params.push(mode);
        }

        if (rating) {
            sql += ` AND tp.rating >= ?`;
            params.push(parseFloat(rating));
        }

        if (minPrice) {
            sql += ` AND tp.price >= ?`;
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            sql += ` AND tp.price <= ?`;
            params.push(parseFloat(maxPrice));
        }

        if (availability) {
            sql += ` AND JSON_SEARCH(tp.availability, 'one', ?) IS NOT NULL`;
            params.push(availability);
        }

        // Distance filter — requires user location
        if (distance && hasUserLocation) {
            sql += `
                AND tp.latitude IS NOT NULL
                AND tp.longitude IS NOT NULL
                HAVING distance <= ?
            `;
            params.push(parseFloat(distance));
        }

        // Sort by distance if we have user location, else by rating
        if (hasUserLocation) {
            sql += ` ORDER BY distance ASC, tp.rating DESC, tp.reviews_count DESC`;
        } else {
            sql += ` ORDER BY tp.rating DESC, tp.reviews_count DESC`;
        }

        const [rows] = await db.promise().query(sql, params);

        // Make sure `distance` is present on each parsed profile
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
        console.error('Error searching tutors:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { searchTutors };
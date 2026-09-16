// controllers/tutors/parseProfile.js
const safeParseJSON = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const parseProfile = (row) => {
    if (!row) return null;

    return {
        id: row.id,
        userId: row.user_id,

        // User fields (from JOIN)
        name: row.tutor_name || row.name || null,
        email: row.tutor_email || null,
        phone: row.tutor_phone || null,

        // Use user's profile_pic as fallback for photo
        photo: row.photo || row.tutor_profile_pic || null,

        longitude: row.longitude,
        latitude: row.latitude,

        // Use user's bio if profile bio is empty
        bio: row.bio || row.tutor_bio || '',

        // Tutor profile fields
        subjects: safeParseJSON(row.subjects, []),
        levels: safeParseJSON(row.levels, []),
        rating: parseFloat(row.rating) || 0,
        reviewsCount: row.reviews_count || 0,
        price: parseFloat(row.price) || 0,
        distance: parseFloat(row.distance) || 0,
        mode: row.mode || 'both',
        availability: safeParseJSON(row.availability, []),
        verified: Boolean(row.verified),
        experience: row.experience || null,
        qualifications: safeParseJSON(row.qualifications, []),
        languages: safeParseJSON(row.languages, []),
        location: row.location || null,
        skills: safeParseJSON(row.skills, []),
        education: safeParseJSON(row.education, []),
    };
};

module.exports = { parseProfile };
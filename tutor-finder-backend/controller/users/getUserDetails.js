const { db } = require("../../modal/db");

// ==================== PERSONAL DETAILS (EDITABLE PROFILE FIELDS) ====================
// Mirrors the fields /api/users/update writes, so the profile form can load the
// current values before saving. Dates are formatted in SQL to avoid timezone shifts.
const getUserDetails = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    const [rows] = await db.promise().query(
      `SELECT
        id, email, role, firstName AS first_name, lastName AS last_name, middle_name, mobile_phone, telephone,
        address, physical_address, postal_address,
        DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth,
        gender, nationality, place_of_birth_town, place_of_birth_country,
        nrc_number, nrc_place_of_issue,
        DATE_FORMAT(nrc_date_of_issue, '%Y-%m-%d') AS nrc_date_of_issue,
        profile_completed, created_at
      FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error("Get user details error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getUserDetails };

const { db } = require("../../modal/db");

const updateUser = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found"
      });
    }

    // Check if user exists
    const [existingUser] = await db.promise().query(
      `SELECT id FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const sql = `
      UPDATE users
      SET
        first_name = ?,
        last_name = ?,
        middle_name = ?,
        email = ?,
        mobile_phone = ?,
        telephone = ?,
        address = ?,
        physical_address = ?,
        postal_address = ?,
        date_of_birth = ?,
        gender = ?,
        nationality = ?,
        place_of_birth_town = ?,
        place_of_birth_country = ?,
        nrc_number = ?,
        nrc_place_of_issue = ?,
        nrc_date_of_issue = ?,
        profile_completed = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.promise().query(sql, [
      req.body.first_name || null,
      req.body.last_name || null,
      req.body.middle_name || null,
      req.body.email || null,
      req.body.mobile_phone || null,
      req.body.telephone || null,
      req.body.address || null,
      req.body.physical_address || null,
      req.body.postal_address || null,
      req.body.date_of_birth || null,
      req.body.gender || null,
      req.body.nationality || null,
      req.body.place_of_birth_town || null,
      req.body.place_of_birth_country || null,
      req.body.nrc_number || null,
      req.body.nrc_place_of_issue || null,
      req.body.nrc_date_of_issue || null,
      req.body.profile_completed ? 1 : 0,
      userId,
    ]);

    // Fetch updated user data (excluding password)
    const [updatedUser] = await db.promise().query(
      `SELECT 
        id, first_name, last_name, middle_name, email, mobile_phone, telephone,
        address, physical_address, postal_address, date_of_birth, gender, nationality,
        place_of_birth_town, place_of_birth_country, nrc_number, nrc_place_of_issue,
        nrc_date_of_issue, profile_completed, profile_pic, is_registered, role, created_at, updated_at
      FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser[0]
    });
  } catch (error) {
    console.error("Update user error:", error);

    // Duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      let field = "field";

      // Extract field name from error message
      const match = error.message.match(/for key '(.+)'/);

      if (match) {
        const keyName = match[1];

        // Map database indexes to friendly names
        const fieldMap = {
          email: "Email Address",
          users_email_unique: "Email Address",
          mobile_phone: "Mobile Phone",
          users_mobile_phone_unique: "Mobile Phone",
          nrc_number: "NRC Number",
          users_nrc_number_unique: "NRC Number",
        };

        field = fieldMap[keyName] || keyName;
      }

      return res.status(409).json({
        success: false,
        message: `${field} already exists. Please use a different value.`,
      });
    }

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

module.exports = { updateUser };
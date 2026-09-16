const { db } = require("../../modal/db");

const getCurrentUser = async (req, res) => {
  try {
    // req.user comes from your JWT middleware
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Get basic user information
    const [userRows] = await db.promise().query(
      `
      SELECT
        id,
        email,
        role,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    const user = userRows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let profileData = null;

    // Only tutors have a separate profile
    if (user.role === "tutor") {
      const [profileRows] = await db.promise().query(
        `
        SELECT
          id,
          user_id,
          bio,
          photo,
          subjects,
          levels,
          rating,
          reviews_count,
          price,
          distance,
          mode,
          availability,
          verified,
          experience,
          qualifications,
          languages,
          location,
          skills,
          education,
          is_active,
          created_at,
          updated_at
        FROM tutor_profiles
        WHERE user_id = ?
        LIMIT 1
        `,
        [userId]
      );

      profileData = profileRows[0] || null;

      // Parse JSON fields
      if (profileData) {
        const jsonFields = [
          "subjects",
          "levels",
          "availability",
          "qualifications",
          "languages",
          "skills",
          "education"
        ];

        jsonFields.forEach((field) => {
          if (
            profileData[field] &&
            typeof profileData[field] === "string"
          ) {
            try {
              profileData[field] = JSON.parse(profileData[field]);
            } catch (error) {
              profileData[field] = [];
            }
          }
        });
      }
    }

    // Final response
    const responseData = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,

      // Tutor biography and photo belong to the tutor profile.
      bio: profileData?.bio || null,
      profilePic: profileData?.photo || null,

      // Only populated for tutors
      profile: profileData
    };

    return res.status(200).json({
      success: true,
      user: responseData
    });

  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { getCurrentUser };
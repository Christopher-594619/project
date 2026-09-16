const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    console.log(userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found"
      });
    }

    const { db } = require("../modal/db");
    const [rows] = await db.promise().query(
      `SELECT role FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const user = rows[0];

    if (!user || user.role === 'member') {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required"
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { isAdmin };
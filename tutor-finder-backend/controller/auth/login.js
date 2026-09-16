const bcrypt = require("bcrypt");
const { db } = require("../../modal/db");
const { createTokens } = require("../common/auth.token");

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Sanitize
    email = email.trim().toLowerCase();

    // Find user
    const [users] = await db.promise().query(
      `
      SELECT
        id,
        password,
        role
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const { accessToken, refreshToken } =
      createTokens(user);

    // Store refresh token in secure cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { login };
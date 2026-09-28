const jwt = require("jsonwebtoken");
const { db } = require("../../modal/db");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const refreshToken = async (req, res) => {
    try {

        // 1. get refresh token from HttpOnly cookie
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No refresh token provided"
            });
        }

        // 2. verify refresh token
        const decoded = jwt.verify(token, REFRESH_SECRET);

        // 3. re-check the account - a suspension should not wait out a 30-day
        // refresh token, and the role may have changed (e.g. became a tutor).
        const [rows] = await db.promise().query(
            "SELECT role, is_suspended FROM users WHERE id = ? LIMIT 1",
            [decoded.userId]
        );

        const user = rows[0];

        if (!user || user.is_suspended) {
            res.clearCookie("refreshToken");
            return res.status(403).json({
                success: false,
                message: user?.is_suspended
                    ? "Your account has been suspended"
                    : "Account not found"
            });
        }

        // 4. create new access token
        const newAccessToken = jwt.sign(
            {
                userId: decoded.userId,
                role: user.role,
            },
            ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        // 5. send new access token
        return res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        console.log(error);
        return res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};

module.exports = { refreshToken };

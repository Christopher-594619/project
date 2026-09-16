const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const refreshToken = (req, res) => {
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

        // 3. create new access token
        const newAccessToken = jwt.sign(
            {
                userId: decoded.userId,
                role: decoded.role,
            },
            ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        // 4. send new access token
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
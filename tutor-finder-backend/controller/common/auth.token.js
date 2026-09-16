const jwt = require("jsonwebtoken");
const { ACCESS_SECRET, REFRESH_SECRET } = require("./auth.config");

const createTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

module.exports = { createTokens };
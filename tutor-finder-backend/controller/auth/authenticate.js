const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_SECRET;

const authenticate = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, ACCESS_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authenticate };
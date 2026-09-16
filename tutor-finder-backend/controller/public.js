const path = require("path");
const fs = require("fs");

const serveIndex = (req, res) => {
  try {
    const indexPath = path.join(__dirname, "../public/index.html");
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        success: false,
        message: "Index file not found"
      });
    }
  } catch (error) {
    console.error("Error serving index:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { serveIndex };
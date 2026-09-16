require('dotenv').config();
const express = require("express");
const {corsOptions} = require("./middleware/cors");
const {db} = require("./modal/db");
const cors = require("cors");
const path = require('path');
const fs = require("fs");
const cookieParser = require("cookie-parser");

// routes
const {users} = require("./routes/users")
const {public} = require("./routes/public");
const {auth} = require("./routes/signup")
const {tutors}= require("./routes/tutors");


const app = express();

// middleware
app.use(cors(corsOptions))
app.use(cookieParser());
app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// routes
app.use("/", public);
app.use("/api/auth", auth);
app.use("/api/users", users)
app.use("/api/tutors", tutors)

app.get(/.*/, (req, res) => {
  // Skip API routes (should already be handled above)
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }
  
  const indexPath = path.join(__dirname, "public", "index.html");
  
  // Check if file exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Application not found");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log("***Server running***");
});